import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";
import { PERMISSION_DENIED, RLS_VIOLATION, TestDb, expectRejected } from "./helpers/session";

let db: TestDb;
let reader: string;
let editor: string;

beforeAll(async () => {
  db = new TestDb(inject("databaseUrl"));
  reader = await db.createUser("lecteur");
  editor = await db.createUser("editeur");
  await db.admin("insert into public.staff (user_id, role) values ($1, 'editor')", [editor]);
});
afterAll(() => db.close());

const questionId = async (ref: string) =>
  (await db.admin<{ id: string }>("select id from public.questions where external_ref = $1", [ref]))[0]!.id;

describe("contenus non validés", () => {
  it("les visiteurs ne voient que les cours et scènes publiés", async () => {
    const courses = await db.asAnon((q) => q<{ slug: string }>("select slug from public.courses"));
    expect(courses).toEqual([{ slug: "cours-publie" }]);
    const scenes = await db.asAnon((q) => q<{ slug: string }>("select slug from public.simulation_scenes"));
    expect(scenes).toEqual([{ slug: "scene-publiee" }]);
  });

  it("les visiteurs anonymes n’accèdent pas aux questions", async () => {
    await expectRejected(db.asAnon((q) => q("select * from public.questions")), PERMISSION_DENIED);
  });

  it("un utilisateur ne voit ni brouillons ni questions en relecture", async () => {
    const rows = await db.asUser(reader, (q) =>
      q<{ status: string; n: number }>("select status::text, count(*)::int as n from public.questions group by 1"),
    );
    expect(rows).toEqual([{ status: "published", n: 45 }]);
    const draft = await questionId("brouillon-1");
    const choices = await db.asUser(reader, (q) =>
      q("select * from public.question_choices where question_id = $1", [draft]),
    );
    expect(choices).toEqual([]);
  });

  it("l’équipe éditoriale voit les contenus non publiés", async () => {
    const rows = await db.asUser(editor, (q) =>
      q<{ n: number }>("select count(*)::int as n from public.questions where status <> 'published'"),
    );
    expect(rows[0]?.n).toBe(2);
  });

  it("personne ne peut modifier un contenu directement", async () => {
    const id = await questionId("brouillon-1");
    for (const user of [reader, editor]) {
      await expectRejected(
        db.asUser(user, (q) => q("update public.questions set status = 'published' where id = $1", [id])),
        PERMISSION_DENIED,
      );
    }
  });
});

describe("bonnes réponses", () => {
  it("la table des réponses est illisible, même pour l’équipe", async () => {
    for (const user of [reader, editor]) {
      await expectRejected(db.asUser(user, (q) => q("select * from public.question_answers")), PERMISSION_DENIED);
    }
    await expectRejected(db.asAnon((q) => q("select * from public.question_answers")), PERMISSION_DENIED);
  });

  it("la relecture des réponses est réservée à l’équipe", async () => {
    const id = await questionId("relecture-1");
    await expectRejected(
      db.asUser(reader, (q) => q("select public.get_question_for_review($1)", [id])),
      /KODI_FORBIDDEN/,
    );
    const [row] = await db.asUser(editor, (q) =>
      q<{ r: { correct_choice_ids: string[] } }>("select public.get_question_for_review($1) as r", [id]),
    );
    expect(row?.r.correct_choice_ids).toHaveLength(1);
  });
});

describe("publication", () => {
  it("seule l’équipe peut publier, et c’est journalisé", async () => {
    const id = await questionId("relecture-1");
    await expectRejected(
      db.asUser(reader, (q) => q("select public.review_question($1, 'published')", [id])),
      /KODI_FORBIDDEN/,
    );
    await db.asUser(editor, (q) => q("select public.review_question($1, 'published')", [id]));
    const [row] = await db.admin<{ status: string; reviewed_by: string; ev: number }>(
      `select status::text, reviewed_by,
        (select count(*)::int from public.audit_events where event_type = 'content.reviewed' and entity_id = $1::text) as ev
       from public.questions where id = $1::uuid`,
      [id],
    );
    expect(row).toEqual({ status: "published", reviewed_by: editor, ev: 1 });
    // Remise en relecture pour ne pas fausser les autres tests.
    await db.asUser(editor, (q) => q("select public.review_question($1, 'in_review')", [id]));
  });

  it("une question sans source ne peut pas être publiée", async () => {
    await expectRejected(
      db.admin(
        `insert into public.questions (prompt, explanation, status, reviewed_at)
         values ('Question sans source ?', 'x', 'published', now())`,
      ),
      /questions_published_reviewed/,
    );
  });
});

describe("parcours de simulation", () => {
  it("on enregistre un parcours pour soi sur une scène publiée", async () => {
    const [scene] = await db.admin<{ id: string }>("select id from public.simulation_scenes where slug = 'scene-publiee'");
    await db.asUser(reader, (q) =>
      q("insert into public.simulation_runs (scene_id, camera) values ($1, 'conducteur')", [scene!.id]),
    );
    const rows = await db.asUser(reader, (q) => q("select camera from public.simulation_runs"));
    expect(rows).toEqual([{ camera: "conducteur" }]);
  });

  it("refuse une scène non publiée ou un parcours au nom d’un autre", async () => {
    const [draft] = await db.admin<{ id: string }>("select id from public.simulation_scenes where slug = 'scene-brouillon'");
    const [published] = await db.admin<{ id: string }>(
      "select id from public.simulation_scenes where slug = 'scene-publiee'",
    );
    await expectRejected(
      db.asUser(reader, (q) =>
        q("insert into public.simulation_runs (scene_id, camera) values ($1, 'conducteur')", [draft!.id]),
      ),
      RLS_VIOLATION,
    );
    await expectRejected(
      db.asUser(reader, (q) =>
        q("insert into public.simulation_runs (user_id, scene_id, camera) values ($1, $2, 'conducteur')", [
          editor,
          published!.id,
        ]),
      ),
      RLS_VIOLATION,
    );
  });

  it("chacun ne voit que ses parcours", async () => {
    const rows = await db.asUser(editor, (q) => q("select * from public.simulation_runs"));
    expect(rows).toEqual([]);
  });
});
