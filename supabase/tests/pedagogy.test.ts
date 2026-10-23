import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";
import { replayCards, type AnswerRecord } from "../../src/lib/pedagogy/history";
import { estimateMastery } from "../../src/lib/pedagogy/mastery";
import { TestDb, type Query } from "./helpers/session";

let db: TestDb;
beforeAll(() => {
  db = new TestDb(inject("databaseUrl"));
});
afterAll(() => db.close());

/** Univers, compétence et deux questions publiées, liées à la même compétence. */
async function setupContent(q: Query, lessonStatus = "published") {
  const [course] = await q<{ id: string }>(
    "insert into public.courses (slug, title, status) values ('univers-test', 'Univers test', 'published') returning id",
  );
  const [competence] = await q<{ id: string }>(
    "insert into public.competences (course_id, slug, title, status) values ($1, 'c-test', 'Compétence test', 'published') returning id",
    [course!.id],
  );
  const [lesson] = await q<{ id: string }>(
    `insert into public.lessons (course_id, slug, title, position, status, sources, reviewed_at)
     values ($1, 'lecon-test', 'Leçon test', 1, $2, '[{"title":"Source"}]', now()) returning id`,
    [course!.id, lessonStatus],
  );
  await q("insert into public.lesson_competences (lesson_id, competence_id) values ($1, $2)", [lesson!.id, competence!.id]);
  const questions: string[] = [];
  for (const ref of ["peda-1", "peda-2"]) {
    const [question] = await q<{ id: string }>(
      `insert into public.questions (external_ref, prompt, explanation, sources, status, reviewed_at)
       values ($1, 'Question de test pédagogique ?', 'Explication', '[{"title":"Source"}]', 'published', now()) returning id`,
      [ref],
    );
    await q("insert into public.question_competences (question_id, competence_id) values ($1, $2)", [
      question!.id,
      competence!.id,
    ]);
    questions.push(question!.id);
  }
  return { course: course!.id, competence: competence!.id, lesson: lesson!.id, questions };
}

describe("leçons et compétences : visibilité", () => {
  it("montre les leçons publiées à tous, jamais les brouillons", async () => {
    for (const [status, visible] of [
      ["published", 1],
      ["draft", 0],
      ["in_review", 0],
      ["retired", 0],
    ] as const) {
      await db.adminRollback(async (q) => {
        await setupContent(q, status);
        await q("set local role anon");
        const lessons = await q("select id from public.lessons where slug = 'lecon-test'");
        const links = await q("select lesson_id from public.lesson_competences");
        expect(lessons, status).toHaveLength(visible);
        expect(links, status).toHaveLength(visible);
      });
    }
  });

  it("réserve les compétences des questions aux personnes connectées", async () => {
    const user = await db.createUser("peda-lecteur");
    await db.adminRollback(async (q) => {
      await setupContent(q);
      await q("update public.questions set status = 'draft', reviewed_at = null where external_ref = 'peda-2'");
      await TestDb.impersonate(q, user);
      const rows = await q<{ ref: string }>(`
        select q.external_ref as ref from public.question_competences qc
        join public.questions q on q.id = qc.question_id`);
      expect(rows.map((r) => r.ref).filter((r) => r.startsWith("peda"))).toEqual(["peda-1"]);
    });
    await db.adminRollback(async (q) => {
      await setupContent(q);
      await q("set local role anon");
      await expect(q("select * from public.question_competences")).rejects.toThrow(/permission denied/);
    });
  });

  it("interdit toute écriture des clients", async () => {
    const user = await db.createUser("peda-ecriture");
    await db.adminRollback(async (q) => {
      const { course } = await setupContent(q);
      await TestDb.impersonate(q, user);
      await expect(
        q("insert into public.lessons (course_id, slug, title, position) values ($1, 'pirate', 'Pirate', 9)", [course]),
      ).rejects.toThrow(/permission denied/);
    });
    await db.adminRollback(async (q) => {
      await setupContent(q);
      await TestDb.impersonate(q, user);
      await expect(q("delete from public.lesson_competences")).rejects.toThrow(/permission denied/);
    });
  });
});

describe("examen blanc : tirage", () => {
  it("ne tire que des questions publiées prévues pour l’examen", async () => {
    const user = await db.createUser("peda-examen");
    await db.adminRollback(async (q) => {
      // 45 questions publiées et éligibles dans les données de test : on en exclut 5.
      await q(`update public.questions set exam_eligible = false
               where external_ref in ('pub-1', 'pub-2', 'pub-3', 'pub-4', 'pub-6')`);
      await TestDb.impersonate(q, user);
      const [exam] = await q<{ id: string }>("select public.start_exam() as id");
      const refs = await q<{ ref: string }>(
        `select q.external_ref as ref from public.exam_items i join public.questions q on q.id = i.question_id
         where i.exam_id = $1`,
        [exam!.id],
      );
      expect(refs).toHaveLength(40);
      expect(refs.map((r) => r.ref)).not.toEqual(expect.arrayContaining(["pub-1"]));
      for (const excluded of ["pub-1", "pub-2", "pub-3", "pub-4", "pub-6"]) {
        expect(refs.map((r) => r.ref)).not.toContain(excluded);
      }
    });
    await db.adminRollback(async (q) => {
      await q(`update public.questions set exam_eligible = false
               where external_ref in ('pub-1', 'pub-2', 'pub-3', 'pub-4', 'pub-6', 'pub-7')`);
      await TestDb.impersonate(q, user);
      await expect(q("select public.start_exam()")).rejects.toThrow(/KODI_NOT_ENOUGH_QUESTIONS/);
    });
  });
});

describe("révisions et maîtrise : SQL identique au moteur TypeScript", () => {
  const START = Date.parse("2026-01-05T08:00:00Z");
  const HOUR = 3_600_000;
  // [question (0 ou 1), juste ?, heures écoulées depuis le début]
  const EVENTS: Array<[number, boolean, number]> = [
    [0, false, 0],
    [1, false, 1],
    [0, true, 2],
    [1, false, 26],
    [0, true, 30],
    [1, true, 50],
    [0, true, 120],
    [1, true, 125],
    [0, false, 400],
    [1, true, 410],
    [0, true, 401],
    [0, true, 900],
    [1, true, 1500],
    [0, true, 2600],
    [0, true, 5000],
  ];

  it("produit les mêmes cartes de révision à chaque réponse", async () => {
    const user = await db.createUser("peda-parite");
    await db.adminRollback(async (q) => {
      const { questions } = await setupContent(q);
      const ordered = [...EVENTS].sort((a, b) => a[2] - b[2]);
      const history: AnswerRecord[] = [];
      for (const [index, [question, correct, hours]] of ordered.entries()) {
        const at = new Date(START + hours * HOUR);
        const questionId = questions[question]!;
        await q(
          `insert into public.attempts (user_id, question_id, context, selected_choice_ids, is_correct, answered_at)
           values ($1, $2, 'practice', '{}', $3, $4)`,
          [user, questionId, correct, at.toISOString()],
        );
        await q("select private.record_revision($1, $2, $3, $4)", [user, questionId, correct, at.toISOString()]);
        history.push({
          id: String(index),
          questionId,
          competenceIds: ["c-test"],
          selected: [],
          correct,
          answeredAt: at.toISOString(),
          context: "practice",
        });

        const expected = replayCards(history).get(questionId)!;
        const [row] = await q<{
          ease: number;
          interval_tenths: number;
          repetitions: number;
          lapses: number;
          box: number;
          due_at: Date;
        }>(
          "select ease, interval_tenths, repetitions, lapses, box, due_at from public.revisions where user_id = $1 and question_id = $2",
          [user, questionId],
        );
        const label = `réponse ${index + 1}`;
        expect(row?.ease, label).toBe(expected.ease);
        expect(row?.interval_tenths, label).toBe(expected.intervalTenths);
        expect(row?.repetitions, label).toBe(expected.repetitions);
        expect(row?.lapses, label).toBe(expected.lapses);
        expect(row?.box, label).toBe(Math.min(expected.repetitions + 1, 5));
        expect(row?.due_at.getTime(), label).toBe(Date.parse(expected.dueAt));
      }

    });
  });

  it("estime la même maîtrise par compétence", async () => {
    const user = await db.createUser("peda-maitrise");
    await db.adminRollback(async (q) => {
      const { questions, competence } = await setupContent(q);
      for (const [question, correct, hours] of EVENTS) {
        await q(
          `insert into public.attempts (user_id, question_id, context, selected_choice_ids, is_correct, answered_at)
           values ($1, $2, 'practice', '{}', $3, $4)`,
          [user, questions[question], correct, new Date(START + hours * HOUR).toISOString()],
        );
      }
      for (const hours of [0.5, 40, 500, 5000.5, 9000]) {
        const at = new Date(START + hours * HOUR);
        const [row] = await q<{ score: number; confidence: number; attempts: number }>(
          "select * from private.competence_mastery($1, $2, $3)",
          [user, competence, at.toISOString()],
        );
        const before = EVENTS.filter(([, , h]) => h < hours).map(([, correct, h]) => ({
          correct,
          answeredAt: new Date(START + h * HOUR).toISOString(),
        }));
        const expected = estimateMastery(before, at);
        expect(row?.attempts, `t+${hours} h`).toBe(expected.attempts);
        expect(row?.score, `t+${hours} h`).toBeCloseTo(expected.score, 12);
        expect(row?.confidence, `t+${hours} h`).toBeCloseTo(expected.confidence, 12);
      }
    });
  });

  it("raccourcit l’intervalle quand la compétence est fragile", async () => {
    const user = await db.createUser("peda-fragile");
    await db.adminRollback(async (q) => {
      const { questions } = await setupContent(q);
      const at = (h: number) => new Date(START + h * HOUR).toISOString();
      const answer = async (question: string, correct: boolean, h: number, schedule: boolean) => {
        await q(
          `insert into public.attempts (user_id, question_id, context, selected_choice_ids, is_correct, answered_at)
           values ($1, $2, 'practice', '{}', $3, $4)`,
          [user, question, correct, at(h)],
        );
        if (schedule) await q("select private.record_revision($1, $2, $3, $4)", [user, question, correct, at(h)]);
      };
      // Question 1 : deux bonnes réponses (intervalle 3 jours, facilité 2,70).
      await answer(questions[0]!, true, 0, true);
      await answer(questions[0]!, true, 1, true);
      // Quatre erreurs sur la question 2, même compétence : score ≈ 0,37 (fragile).
      for (const h of [2, 3, 4, 5]) await answer(questions[1]!, false, h, false);
      await answer(questions[0]!, true, 6, true);
      const [row] = await q<{ interval_tenths: number }>(
        "select interval_tenths from public.revisions where question_id = $1",
        [questions[0]],
      );
      // Sans adaptation : 3 j × 2,70 = 8,1 j ; compétence fragile : × 0,60 = 4,9 j.
      expect(row?.interval_tenths).toBe(49);
    });
  });

  it("ignore la réponse en cours dans le calcul de maîtrise", async () => {
    const user = await db.createUser("peda-anterieur");
    await db.adminRollback(async (q) => {
      const { questions } = await setupContent(q);
      const at = (h: number) => new Date(START + h * HOUR).toISOString();
      const history: AnswerRecord[] = [];
      const answer = async (question: number, correct: boolean, h: number) => {
        const questionId = questions[question]!;
        await q(
          `insert into public.attempts (user_id, question_id, context, selected_choice_ids, is_correct, answered_at)
           values ($1, $2, 'practice', '{}', $3, $4)`,
          [user, questionId, correct, at(h)],
        );
        await q("select private.record_revision($1, $2, $3, $4)", [user, questionId, correct, at(h)]);
        history.push({
          id: String(h),
          questionId,
          competenceIds: ["c-test"],
          selected: [],
          correct,
          answeredAt: at(h),
          context: "practice",
        });
      };
      // Avant la 5e réponse : 2 justes (plus anciennes) et 2 fausses, score juste sous 50 %.
      // Compter la réponse en cours ferait passer à 57 % et changerait l'intervalle.
      await answer(0, true, 0);
      await answer(0, true, 1);
      await answer(1, false, 2);
      await answer(1, false, 3);
      await answer(0, true, 4);
      const [row] = await q<{ interval_tenths: number }>(
        "select interval_tenths from public.revisions where question_id = $1",
        [questions[0]],
      );
      expect(row?.interval_tenths).toBe(49);
      expect(replayCards(history).get(questions[0]!)?.intervalTenths).toBe(49);
    });
  });
});
