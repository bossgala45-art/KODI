import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";
import { PERMISSION_DENIED, TestDb, allKeys, expectRejected } from "./helpers/session";

interface Item {
  position: number;
  question_id: string;
  answer_count: number;
  selected_choice_ids: string[] | null;
  choices: { id: string; label: string }[];
}
interface Exam {
  id: string;
  mode: string;
  status: string;
  question_count: number;
  pass_mark: number | null;
  unseen_count: number;
  items: Item[];
}
interface Availability {
  required: number;
  available: number;
  unseen: number;
  reason: string | null;
  target_refs: string[];
}
interface ReportLine {
  competence_ref: string;
  correct: number;
  total: number;
}

let db: TestDb;
beforeAll(() => {
  db = new TestDb(inject("databaseUrl"));
});
afterAll(() => db.close());

/** Édition personnelle (D-032) : plusieurs examens le même jour, sans abonnement. */
const premiumUser = (label: string): Promise<string> => db.createUser(label);

const start = (user: string, mode: string, refs: string[] | null = null) =>
  db.asUser(user, async (q) => (await q<{ id: string }>("select public.start_exam_mode($1, $2) as id", [mode, refs]))[0]!.id);

const getExam = (user: string, id: string) =>
  db.asUser(user, async (q) => (await q<{ e: Exam }>("select public.get_exam($1) as e", [id]))[0]!.e);

const availability = (user: string, mode: string, refs: string[] | null = null) =>
  db.asUser(user, async (q) => (await q<{ a: Availability }>("select public.exam_availability($1, $2) as a", [mode, refs]))[0]!.a);

const answer = (user: string, id: string, position: number, choices: string[]) =>
  db.asUser(user, (q) => q("select public.answer_exam_question($1, $2, $3)", [id, position, choices]));

const submit = (user: string, id: string) =>
  db.asUser(user, async (q) =>
    (await q<{ r: { score: number; passed: boolean | null; pass_mark: number | null } }>("select public.submit_exam($1) as r", [id]))[0]!.r,
  );

async function correctChoices(questionId: string): Promise<string[]> {
  return (
    await db.admin<{ choice_id: string }>("select choice_id from public.question_answers where question_id = $1", [questionId])
  ).map((r) => r.choice_id);
}

async function refsOf(questionIds: string[]): Promise<Map<string, string>> {
  const rows = await db.admin<{ id: string; ref: string; competence: string }>(
    `select q.id, q.external_ref as ref, c.external_ref as competence
     from public.questions q
     join public.question_competences qc on qc.question_id = q.id
     join public.competences c on c.id = qc.competence_id
     where q.id = any ($1)`,
    [questionIds],
  );
  return new Map(rows.map((r) => [r.id, r.competence]));
}

/** Répond juste à `correctCount` questions, faux (une mauvaise proposition) aux autres. */
async function answerWith(user: string, exam: Exam, correctCount: number) {
  for (const [index, item] of exam.items.entries()) {
    const right = await correctChoices(item.question_id);
    const wrong = item.choices.map((c) => c.id).filter((c) => !right.includes(c));
    await answer(user, exam.id, item.position, index < correctCount ? right : [wrong[0]!]);
  }
}

describe("modes d’examen : format et barème", () => {
  it("officiel : 40 questions, réussi à 35 bonnes réponses, échoué à 34", async () => {
    const reussi = await db.createUser("officiel-35");
    const echoue = await db.createUser("officiel-34");
    for (const [user, correct, passed] of [
      [reussi, 35, true],
      [echoue, 34, false],
    ] as const) {
      const exam = await getExam(user, await start(user, "officiel"));
      expect(exam).toMatchObject({ mode: "officiel", question_count: 40, pass_mark: 35 });
      expect(exam.items).toHaveLength(40);
      await answerWith(user, exam, correct);
      expect(await submit(user, exam.id)).toMatchObject({ score: correct, passed, pass_mark: 35 });
    }
  });

  it("express : 10 questions, score sans seuil", async () => {
    const user = await db.createUser("express");
    const exam = await getExam(user, await start(user, "express"));
    expect(exam).toMatchObject({ mode: "express", question_count: 10, pass_mark: null });
    expect(exam.items).toHaveLength(10);
    await answerWith(user, exam, 7);
    expect(await submit(user, exam.id)).toMatchObject({ score: 7, passed: null, pass_mark: null });
  });

  it("réponses multiples : tout ou rien, une réponse incomplète ou en trop est fausse", async () => {
    const user = await db.createUser("multiples");
    const exam = await getExam(user, await start(user, "officiel"));
    let multiples = 0;
    for (const [index, item] of exam.items.entries()) {
      const right = await correctChoices(item.question_id);
      if (right.length > 1) {
        multiples += 1;
        const extra = item.choices.map((c) => c.id).find((c) => !right.includes(c))!;
        // Une sur deux incomplète, l'autre avec une proposition en trop.
        await answer(user, exam.id, item.position, index % 2 ? [right[0]!] : [...right, extra]);
      } else {
        await answer(user, exam.id, item.position, right);
      }
    }
    expect(multiples).toBeGreaterThan(0);
    expect((await submit(user, exam.id)).score).toBe(40 - multiples);
  });

  it("une question sans réponse compte comme fausse", async () => {
    const user = await db.createUser("sans-reponse");
    const exam = await getExam(user, await start(user, "express"));
    for (const item of exam.items.slice(0, 6)) await answer(user, exam.id, item.position, await correctChoices(item.question_id));
    expect((await submit(user, exam.id)).score).toBe(6);
  });
});

describe("modes d’examen : tirage", () => {
  it("ciblé : 20 questions des seules compétences choisies", async () => {
    const user = await db.createUser("cible");
    expect(await availability(user, "cible", ["c-test-a"])).toMatchObject({
      required: 20,
      available: 22,
      reason: null,
      target_refs: ["c-test-a"],
    });
    const exam = await getExam(user, await start(user, "cible", ["c-test-a"]));
    expect(exam.items).toHaveLength(20);
    const refs = await refsOf(exam.items.map((i) => i.question_id));
    expect(new Set(refs.values())).toEqual(new Set(["c-test-a"]));
  });

  it("ciblé : refuse une compétence inconnue ou non validée", async () => {
    const user = await db.createUser("cible-inconnue");
    await expectRejected(start(user, "cible", ["c-inexistante"]), /KODI_NO_TARGET/);
    await expectRejected(start(user, "cible", null), /KODI_NO_TARGET/);
    await db.adminRollback(async (q) => {
      await q("update public.competences set status = 'in_review' where external_ref = 'c-test-a'");
      await TestDb.impersonate(q, user);
      await expect(q("select public.start_exam_mode('cible', array['c-test-a'])")).rejects.toThrow(/KODI_NO_TARGET/);
    });
  });

  it("revanche : uniquement sur les compétences ratées, sinon refusée", async () => {
    const user = await db.createUser("revanche");
    expect(await availability(user, "revanche")).toMatchObject({ available: 0, reason: "KODI_NO_FAILED_COMPETENCES" });
    await expectRejected(start(user, "revanche"), /KODI_NO_FAILED_COMPETENCES/);

    // Trois erreurs en pratique sur des questions de la compétence B.
    for (const ref of ["pub-30", "pub-31", "pub-32"]) {
      const [question] = await db.admin<{ id: string }>("select id from public.questions where external_ref = $1", [ref]);
      const right = await correctChoices(question!.id);
      const [wrong] = await db.admin<{ id: string }>(
        "select id from public.question_choices where question_id = $1 and not (id = any ($2)) limit 1",
        [question!.id, right],
      );
      await db.asUser(user, (q) => q("select public.submit_practice_answer($1, $2)", [question!.id, [wrong!.id]]));
    }
    expect((await availability(user, "revanche")).target_refs).toEqual(["c-test-b"]);
    const exam = await getExam(user, await start(user, "revanche"));
    expect(exam.items).toHaveLength(10);
    const refs = await refsOf(exam.items.map((i) => i.question_id));
    expect(new Set(refs.values())).toEqual(new Set(["c-test-b"]));
  });

  it("propose d’abord des questions inédites", async () => {
    const user = await premiumUser("inedites");
    const seen = new Set<string>();
    for (let round = 1; round <= 5; round += 1) {
      const exam = await getExam(user, await start(user, "express"));
      const ids = exam.items.map((i) => i.question_id);
      // 45 questions : 4 séries entièrement inédites, puis 5 inédites restantes.
      const expectedUnseen = round <= 4 ? 10 : 5;
      expect(exam.unseen_count, `série ${round}`).toBe(expectedUnseen);
      expect(ids.filter((id) => !seen.has(id)), `série ${round}`).toHaveLength(expectedUnseen);
      ids.forEach((id) => seen.add(id));
      await submit(user, exam.id);
    }
    expect(seen.size).toBe(45);
  });

  it("ne tire jamais de brouillon, de question en relecture ni de question hors examen", async () => {
    const user = await db.createUser("statuts");
    const exam = await getExam(user, await start(user, "officiel"));
    const refs = await db.admin<{ ref: string; status: string; eligible: boolean }>(
      "select external_ref as ref, status::text, exam_eligible as eligible from public.questions where id = any ($1)",
      [exam.items.map((i) => i.question_id)],
    );
    expect(refs.every((r) => r.status === "published" && r.eligible)).toBe(true);
  });

  it("refuse un examen incomplet quand les questions validées manquent, sans rien créer", async () => {
    const user = await db.createUser("insuffisant");
    await db.adminRollback(async (q) => {
      await q("update public.questions set exam_eligible = false where external_ref in ('pub-1','pub-2','pub-3','pub-4','pub-6','pub-7')");
      await TestDb.impersonate(q, user);
      const [row] = await q<{ a: Availability }>("select public.exam_availability('officiel') as a");
      expect(row?.a).toMatchObject({ required: 40, available: 39, reason: "KODI_NOT_ENOUGH_QUESTIONS" });
      await expect(q("select public.start_exam_mode('officiel')")).rejects.toThrow(/KODI_NOT_ENOUGH_QUESTIONS/);
    });
    await db.adminRollback(async (q) => {
      await q("update public.questions set status = 'in_review', reviewed_at = null where external_ref like 'pub-%'");
      await TestDb.impersonate(q, user);
      for (const mode of ["officiel", "express"]) {
        const [row] = await q<{ a: Availability }>("select public.exam_availability($1) as a", [mode]);
        expect(row?.a.available, mode).toBe(0);
      }
      await expect(q("select public.start_exam_mode('express')")).rejects.toThrow(/KODI_NOT_ENOUGH_QUESTIONS/);
    });
    const [count] = await db.admin<{ n: number }>("select count(*)::int as n from public.exams where user_id = $1", [user]);
    expect(count?.n).toBe(0);
  });
});

describe("modes d’examen : sessions et résultats", () => {
  it("sauvegarde les réponses, reprend l’examen et refuse d’en lancer un second", async () => {
    const user = await db.createUser("reprise");
    const id = await start(user, "express");
    const exam = await getExam(user, id);
    const first = exam.items[0]!;
    await answer(user, id, first.position, [first.choices[0]!.id]);
    await expectRejected(start(user, "officiel"), /KODI_EXAM_IN_PROGRESS/);
    const reloaded = await getExam(user, id);
    expect(reloaded.items[0]?.selected_choice_ids).toEqual([first.choices[0]!.id]);
    // L'ancien point d'entrée reprend aussi l'examen en cours.
    const [again] = await db.asUser(user, (q) => q<{ id: string }>("select public.start_exam() as id"));
    expect(again?.id).toBe(id);
  });

  it("donne le corrigé et le bilan par compétence après la remise uniquement", async () => {
    const user = await db.createUser("bilan");
    const exam = await getExam(user, await start(user, "officiel"));
    for (const fn of ["get_exam_correction"]) {
      await expectRejected(db.asUser(user, (q) => q(`select public.${fn}($1)`, [exam.id])), /KODI_EXAM_NOT_SUBMITTED/);
    }
    await answerWith(user, exam, 30);
    await submit(user, exam.id);
    const [row] = await db.asUser(user, (q) =>
      q<{ c: { competences: ReportLine[]; items: { is_correct: boolean; competence_refs: string[] }[] } }>(
        "select public.get_exam_correction($1) as c",
        [exam.id],
      ),
    );
    const report = row!.c.competences;
    expect(report.map((r) => r.competence_ref).sort()).toEqual(["c-test-a", "c-test-b"]);
    expect(report.reduce((s, r) => s + r.total, 0)).toBe(40);
    expect(report.reduce((s, r) => s + r.correct, 0)).toBe(30);
    for (const line of report) {
      const items = row!.c.items.filter((i) => i.competence_refs.includes(line.competence_ref));
      expect(line.total).toBe(items.length);
      expect(line.correct).toBe(items.filter((i) => i.is_correct).length);
    }
  });

  it("cumule les statistiques des seuls examens remis", async () => {
    const user = await premiumUser("statistiques");
    const first = await getExam(user, await start(user, "express"));
    await answerWith(user, first, 10);
    await submit(user, first.id);
    const abandoned = await start(user, "express");
    await db.asUser(user, (q) => q("select public.abandon_exam($1)", [abandoned]));
    const [row] = await db.asUser(user, (q) => q<{ s: ReportLine[] }>("select public.get_exam_competence_stats() as s"));
    expect(row!.s.reduce((s, r) => s + r.total, 0)).toBe(10);
    expect(row!.s.reduce((s, r) => s + r.correct, 0)).toBe(10);
    const history = await db.asUser(user, (q) =>
      q<{ mode: string; status: string; score: number | null }>("select mode, status, score from public.exams order by started_at"),
    );
    expect(history).toEqual([
      { mode: "express", status: "submitted", score: 10 },
      { mode: "express", status: "abandoned", score: null },
    ]);
  });
});

describe("modes d’examen : tentatives de manipulation", () => {
  it("n’expose aucune bonne réponse avant la remise", async () => {
    const user = await db.createUser("fuite");
    const exam = await getExam(user, await start(user, "cible", ["c-test-b"]));
    const keys = allKeys(exam);
    for (const key of ["correct_choice_ids", "is_correct", "explanation", "sources", "competences"]) {
      expect(keys.has(key), key).toBe(false);
    }
    const items = await db.asUser(user, (q) =>
      q<{ is_correct: boolean | null }>("select is_correct from public.exam_items where exam_id = $1", [exam.id]),
    );
    expect(items.every((i) => i.is_correct === null)).toBe(true);
  });

  it("refuse toute écriture directe : mode, seuil, score, questions", async () => {
    const user = await db.createUser("tricheur");
    const id = await start(user, "express");
    for (const sql of [
      "update public.exams set mode = 'officiel', pass_mark = 1 where id = $1",
      "update public.exams set score = 10, status = 'submitted', submitted_at = now() where id = $1",
      "update public.exam_items set is_correct = true where exam_id = $1",
      "delete from public.exam_items where exam_id = $1",
      "insert into public.exam_items (exam_id, position, question_id) select $1, 99, id from public.questions limit 1",
    ]) {
      await expectRejected(db.asUser(user, (q) => q(sql, [id])), PERMISSION_DENIED);
    }
    await expectRejected(
      db.asUser(user, (q) =>
        q("insert into public.exams (user_id, mode, question_count, pass_mark, status, score) values ($1, 'officiel', 40, 35, 'submitted', 40)", [user]),
      ),
      PERMISSION_DENIED,
    );
  });

  it("refuse les appels directs aux fonctions internes de tirage et de bilan", async () => {
    const user = await db.createUser("interne");
    for (const sql of [
      "select * from private.exam_pool($1, null)",
      "select private.failed_competences($1)",
      "select private.competence_report($1, null)",
      "select private.exam_targets($1, 'express', null)",
    ]) {
      await expectRejected(db.asUser(user, (q) => q(sql, [user])), PERMISSION_DENIED);
    }
  });

  it("refuse un mode inconnu et protège les examens des autres", async () => {
    const owner = await db.createUser("proprietaire");
    const other = await db.createUser("voisin");
    await expectRejected(start(owner, "facile"), /KODI_INVALID_MODE/);
    await expectRejected(db.asUser(owner, (q) => q("select public.exam_availability('facile')")), /KODI_INVALID_MODE/);
    const id = await start(owner, "express");
    const exam = await getExam(owner, id);
    await expectRejected(getExam(other, id), /KODI_EXAM_NOT_FOUND/);
    await expectRejected(answer(other, id, 1, [exam.items[0]!.choices[0]!.id]), /KODI_EXAM_NOT_FOUND/);
    await expectRejected(submit(other, id), /KODI_EXAM_NOT_FOUND/);
    await answerWith(owner, exam, 10);
    await submit(owner, id);
    await expectRejected(db.asUser(other, (q) => q("select public.get_exam_correction($1)", [id])), /KODI_EXAM_NOT_FOUND/);
    // Remise une seule fois : le score ne peut pas être recalculé après coup.
    await expectRejected(submit(owner, id), /KODI_EXAM_CLOSED/);
    await expectRejected(answer(owner, id, 1, [exam.items[0]!.choices[0]!.id]), /KODI_EXAM_CLOSED/);
  });

  it("exige d’être connecté", async () => {
    await expectRejected(db.asAnon((q) => q("select public.start_exam_mode('express')")), PERMISSION_DENIED);
    await expectRejected(db.asAnon((q) => q("select public.exam_availability('express')")), PERMISSION_DENIED);
    await expectRejected(db.asAnon((q) => q("select public.get_exam_competence_stats()")), PERMISSION_DENIED);
  });
});
