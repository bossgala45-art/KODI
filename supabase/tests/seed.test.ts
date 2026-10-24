import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";
import { CATALOG } from "../../src/content/catalog";
import { TestDb } from "./helpers/session";

let db: TestDb;
let reader: string;
const seedSql = readFileSync(join(__dirname, "..", "seed", "content.sql"), "utf8")
  // La transaction est gérée par le test (annulée à la fin).
  .replace(/^begin;$/m, "")
  .replace(/^commit;$/m, "");

const demoQuestions = CATALOG.questions.filter((q) => q.demo);
const examQuestions = CATALOG.questions.filter((q) => q.examEligible);

beforeAll(async () => {
  db = new TestDb(inject("databaseUrl"));
  reader = await db.createUser("lecteur-seed");
});
afterAll(() => db.close());

describe("import du catalogue pédagogique (supabase/seed/content.sql)", () => {
  it("contient tout le catalogue (sinon « npm run content:build »)", () => {
    for (const item of [...CATALOG.universes, ...CATALOG.competences, ...CATALOG.lessons, ...CATALOG.questions]) {
      expect(seedSql, item.id).toContain(`'${item.id}'`);
    }
  });

  it("charge 10 univers, les compétences, leçons et questions, et se rejoue sans doublon", async () => {
    await db.adminRollback(async (q) => {
      await q(seedSql);
      await q(seedSql);
      const [row] = await q<Record<string, number>>(`
        select (select count(*)::int from public.courses where external_ref is not null) as universes,
               (select sum(planned_lessons)::int from public.courses where external_ref is not null) as planned,
               (select count(*)::int from public.competences where external_ref is not null and external_ref not like 'c-test-%') as competences,
               (select count(*)::int from public.lessons) as lessons,
               (select count(*)::int from public.questions where external_ref ~ '^(ex|q-demo|q-sim)-') as questions,
               (select count(*)::int from public.questions where is_demo) as demo,
               (select count(*)::int from public.questions where exam_eligible and (external_ref ~ '^(ex|q-demo|q-sim)-')) as exam,
               (select count(*)::int from public.questions where answer_count > 0 and external_ref like 'ex-%') as with_answers`);
      expect(row).toEqual({
        universes: 10,
        planned: 72,
        competences: CATALOG.competences.length,
        lessons: CATALOG.lessons.length,
        questions: CATALOG.questions.length,
        demo: demoQuestions.length,
        exam: examQuestions.length,
        with_answers: examQuestions.length,
      });
    });
  });

  it("ne rend visible aucun contenu non validé", async () => {
    await db.adminRollback(async (q) => {
      await q(seedSql);
      const [statuses] = await q<{ published: number }>(`
        select (select count(*) from public.questions where status = 'published' and external_ref not like 'pub-%')::int
             + (select count(*) from public.lessons where status = 'published')::int
             + (select count(*) from public.courses where status = 'published' and external_ref is not null)::int as published`);
      expect(statuses?.published).toBe(0);

      await TestDb.impersonate(q, reader);
      expect(await q("select id from public.questions where external_ref ~ '^(ex|q-demo|q-sim)-'")).toEqual([]);
      expect(await q("select id from public.lessons")).toEqual([]);
      expect(await q("select id from public.courses where external_ref is not null")).toEqual([]);
    });
  });

  it("enregistre les mêmes bonnes réponses et compétences que le catalogue", async () => {
    await db.adminRollback(async (q) => {
      await q(seedSql);
      const answers = await q<{ ref: string; positions: number[] }>(`
        select q.external_ref as ref, array_agg(c.position order by c.position) as positions
        from public.questions q
        join public.question_answers a on a.question_id = q.id
        join public.question_choices c on c.id = a.choice_id
        where q.external_ref is not null group by 1`);
      const competences = await q<{ ref: string; ids: string[] }>(`
        select q.external_ref as ref, array_agg(c.external_ref order by c.external_ref) as ids
        from public.questions q
        join public.question_competences qc on qc.question_id = q.id
        join public.competences c on c.id = qc.competence_id
        group by 1`);
      const answersByRef = new Map(answers.map((r) => [r.ref, r.positions]));
      const competencesByRef = new Map(competences.map((r) => [r.ref, r.ids]));
      for (const question of CATALOG.questions) {
        const expected = question.choices
          .map((c, i) => (question.correct.includes(c.id) ? i : -1))
          .filter((i) => i >= 0);
        expect(answersByRef.get(question.id), question.id).toEqual(expected);
        expect(competencesByRef.get(question.id), question.id).toEqual([...question.competenceIds].sort());
      }
    });
  });

  it("refuse de publier une démonstration ou de la mettre à l’examen", async () => {
    await db.adminRollback(async (q) => {
      await q(seedSql);
      await expect(
        q("update public.questions set status = 'published', reviewed_at = now() where is_demo"),
      ).rejects.toThrow(/questions_demo_never_published/);
    });
    await db.adminRollback(async (q) => {
      await q(seedSql);
      await expect(q("update public.questions set exam_eligible = true where is_demo")).rejects.toThrow(
        /questions_demo_never_published/,
      );
    });
    await db.adminRollback(async (q) => {
      await q(seedSql);
      await expect(
        q("update public.lessons set status = 'published', reviewed_at = now() where is_demo"),
      ).rejects.toThrow(/lessons_published_reviewed/);
    });
  });
});
