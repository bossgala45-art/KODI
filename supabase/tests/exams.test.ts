import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";
import { PERMISSION_DENIED, TestDb, allKeys, expectRejected } from "./helpers/session";

interface ExamItem {
  position: number;
  question_id: string;
  answer_count: number;
  choices: { id: string; label: string }[];
}
interface ExamPayload {
  id: string;
  status: string;
  question_count: number;
  pass_mark: number;
  items: ExamItem[];
}

let db: TestDb;
let candidate: string;
let intruder: string;

beforeAll(async () => {
  db = new TestDb(inject("databaseUrl"));
  candidate = await db.createUser("candidat");
  intruder = await db.createUser("intrus");
});
afterAll(() => db.close());

const startExam = (user: string) =>
  db.asUser(user, async (q) => (await q<{ id: string }>("select public.start_exam() as id"))[0]!.id);

const getExam = (user: string, examId: string) =>
  db.asUser(user, async (q) => (await q<{ e: ExamPayload }>("select public.get_exam($1) as e", [examId]))[0]!.e);

/** Bonnes réponses connues du superutilisateur (pour simuler un candidat parfait). */
async function correctChoices(questionId: string): Promise<string[]> {
  const rows = await db.admin<{ choice_id: string }>(
    "select choice_id from public.question_answers where question_id = $1",
    [questionId],
  );
  return rows.map((r) => r.choice_id);
}

const LEAK_KEYS = ["correct_choice_ids", "is_correct", "explanation", "sources"];

describe("examen blanc", () => {
  let examId: string;

  it("exige d’être connecté", async () => {
    await expectRejected(db.asAnon((q) => q("select public.start_exam()")), PERMISSION_DENIED);
  });

  it("démarre un examen de 40 questions publiées, réussite à 35", async () => {
    examId = await startExam(candidate);
    const exam = await getExam(candidate, examId);
    expect(exam.status).toBe("in_progress");
    expect(exam.question_count).toBe(40);
    expect(exam.pass_mark).toBe(35);
    expect(exam.items).toHaveLength(40);
    expect(new Set(exam.items.map((i) => i.question_id)).size).toBe(40);
    const refs = await db.admin<{ external_ref: string }>(
      `select q.external_ref from public.exam_items i join public.questions q on q.id = i.question_id
       where i.exam_id = $1 and q.status <> 'published'`,
      [examId],
    );
    expect(refs).toEqual([]);
  });

  it("reprend l’examen en cours au lieu d’en créer un autre", async () => {
    expect(await startExam(candidate)).toBe(examId);
  });

  it("n’expose aucune bonne réponse pendant l’examen", async () => {
    const exam = await getExam(candidate, examId);
    const keys = allKeys(exam);
    for (const key of LEAK_KEYS) expect(keys.has(key)).toBe(false);

    const items = await db.asUser(candidate, (q) =>
      q<{ is_correct: boolean | null }>("select is_correct from public.exam_items where exam_id = $1", [examId]),
    );
    expect(items.every((i) => i.is_correct === null)).toBe(true);
  });

  it("refuse le corrigé avant la remise", async () => {
    await expectRejected(
      db.asUser(candidate, (q) => q("select public.get_exam_correction($1)", [examId])),
      /KODI_EXAM_NOT_SUBMITTED/,
    );
  });

  it("refuse d’obtenir la réponse en « pratique » sur une question de l’examen en cours", async () => {
    const exam = await getExam(candidate, examId);
    const item = exam.items[0]!;
    await expectRejected(
      db.asUser(candidate, (q) =>
        q("select public.submit_practice_answer($1, $2)", [item.question_id, [item.choices[0]!.id]]),
      ),
      /KODI_QUESTION_IN_ACTIVE_EXAM/,
    );
  });

  it("empêche un autre utilisateur de voir ou de répondre à l’examen", async () => {
    await expectRejected(
      db.asUser(intruder, (q) => q("select public.get_exam($1)", [examId])),
      /KODI_EXAM_NOT_FOUND/,
    );
    await expectRejected(
      db.asUser(intruder, (q) => q("select public.answer_exam_question($1, 1, '{}')", [examId])),
      /KODI_EXAM_NOT_FOUND/,
    );
    await expectRejected(
      db.asUser(intruder, (q) => q("select public.submit_exam($1)", [examId])),
      /KODI_EXAM_NOT_FOUND/,
    );
    const rows = await db.asUser(intruder, (q) => q("select * from public.exam_items where exam_id = $1", [examId]));
    expect(rows).toEqual([]);
  });

  it("empêche de falsifier un examen ou un score directement", async () => {
    await expectRejected(
      db.asUser(candidate, (q) => q("update public.exams set score = 40, passed = true where id = $1", [examId])),
      PERMISSION_DENIED,
    );
    await expectRejected(
      db.asUser(candidate, (q) => q("update public.exam_items set is_correct = true where exam_id = $1", [examId])),
      PERMISSION_DENIED,
    );
    await expectRejected(
      db.asUser(candidate, (q) =>
        q("insert into public.exams (user_id, question_count, pass_mark) values ($1, 1, 1)", [candidate]),
      ),
      PERMISSION_DENIED,
    );
    await expectRejected(
      db.asUser(candidate, (q) =>
        q(
          "insert into public.attempts (user_id, question_id, context, selected_choice_ids, is_correct) values ($1, (select id from public.questions limit 1), 'practice', '{}', true)",
          [candidate],
        ),
      ),
      PERMISSION_DENIED,
    );
  });

  it("refuse une réponse vide ou des propositions d’une autre question", async () => {
    const exam = await getExam(candidate, examId);
    const [first, second] = exam.items;
    await expectRejected(
      db.asUser(candidate, (q) => q("select public.answer_exam_question($1, $2, '{}')", [examId, first!.position])),
      /KODI_EMPTY_ANSWER/,
    );
    await expectRejected(
      db.asUser(candidate, (q) =>
        q("select public.answer_exam_question($1, $2, $3)", [examId, first!.position, [second!.choices[0]!.id]]),
      ),
      /KODI_INVALID_CHOICES/,
    );
  });

  it("corrige à la remise : toutes les réponses justes donnent 40/40, réussi", async () => {
    const exam = await getExam(candidate, examId);
    for (const item of exam.items) {
      const choices = await correctChoices(item.question_id);
      await db.asUser(candidate, (q) =>
        q("select public.answer_exam_question($1, $2, $3)", [examId, item.position, choices]),
      );
    }
    const [result] = await db.asUser(candidate, (q) =>
      q<{ r: { score: number; passed: boolean } }>("select public.submit_exam($1) as r", [examId]),
    );
    expect(result?.r).toMatchObject({ score: 40, passed: true });
  });

  it("verrouille l’examen remis et donne alors le corrigé", async () => {
    await expectRejected(
      db.asUser(candidate, (q) => q("select public.answer_exam_question($1, 1, '{}')", [examId])),
      /KODI_EXAM_CLOSED/,
    );
    await expectRejected(
      db.asUser(candidate, (q) => q("select public.submit_exam($1)", [examId])),
      /KODI_EXAM_CLOSED/,
    );
    const [row] = await db.asUser(candidate, (q) =>
      q<{ c: { items: { correct_choice_ids: string[]; is_correct: boolean }[] } }>(
        "select public.get_exam_correction($1) as c",
        [examId],
      ),
    );
    expect(row?.c.items).toHaveLength(40);
    expect(row?.c.items.every((i) => i.is_correct && i.correct_choice_ids.length > 0)).toBe(true);
  });

  it("enregistre tentatives et révisions, et journalise la remise", async () => {
    const [row] = await db.asUser(candidate, (q) =>
      q<{ attempts: number; revisions: number }>(
        `select (select count(*)::int from public.attempts where exam_id = $1) as attempts,
                (select count(*)::int from public.revisions) as revisions`,
        [examId],
      ),
    );
    expect(row).toEqual({ attempts: 40, revisions: 40 });
    const events = await db.asUser(candidate, (q) =>
      q<{ event_type: string }>(
        "select event_type from public.audit_events where entity_id = $1 order by id",
        [examId],
      ),
    );
    expect(events.map((e) => e.event_type)).toEqual(["exam.started", "exam.submitted"]);
  });

  it("un examen sans aucune réponse est échoué", async () => {
    const id = await startExam(intruder);
    const [result] = await db.asUser(intruder, (q) =>
      q<{ r: { score: number; passed: boolean } }>("select public.submit_exam($1) as r", [id]),
    );
    expect(result?.r).toMatchObject({ score: 0, passed: false });
  });
});

describe("pratique", () => {
  let learner: string;
  beforeAll(async () => {
    learner = await db.createUser("apprenant");
  });

  const published = async (ref: string) =>
    (await db.admin<{ id: string }>("select id from public.questions where external_ref = $1", [ref]))[0]!.id;
  const choicesOf = async (questionId: string) =>
    (await db.admin<{ id: string }>("select id from public.question_choices where question_id = $1 order by position", [
      questionId,
    ])).map((r) => r.id);

  it("corrige après la réponse et fait progresser la révision", async () => {
    const qid = await published("pub-1");
    const right = await correctChoices(qid);
    const [res] = await db.asUser(learner, (q) =>
      q<{ r: { is_correct: boolean; correct_choice_ids: string[] } }>(
        "select public.submit_practice_answer($1, $2) as r",
        [qid, right],
      ),
    );
    expect(res?.r.is_correct).toBe(true);
    expect([...res!.r.correct_choice_ids].sort()).toEqual([...right].sort());

    const [rev] = await db.asUser(learner, (q) =>
      q<{ box: number }>("select box from public.revisions where question_id = $1", [qid]),
    );
    expect(rev?.box).toBe(2);
  });

  it("une réponse incomplète à une question à deux réponses est fausse", async () => {
    const qid = await published("pub-5");
    const right = await correctChoices(qid);
    expect(right).toHaveLength(2);
    const [res] = await db.asUser(learner, (q) =>
      q<{ r: { is_correct: boolean } }>("select public.submit_practice_answer($1, $2) as r", [qid, [right[0]]]),
    );
    expect(res?.r.is_correct).toBe(false);
  });

  it("refuse les questions non publiées", async () => {
    const draft = await published("brouillon-1");
    const choices = await choicesOf(draft);
    await expectRejected(
      db.asUser(learner, (q) => q("select public.submit_practice_answer($1, $2)", [draft, [choices[0]]])),
      /KODI_QUESTION_UNAVAILABLE/,
    );
  });

  it("chacun ne voit et ne supprime que ses tentatives", async () => {
    const mine = await db.asUser(learner, (q) => q<{ user_id: string }>("select distinct user_id from public.attempts"));
    expect(mine).toEqual([{ user_id: learner }]);
    const deleted = await db.asUser(learner, (q) =>
      q("delete from public.attempts where user_id = $1 returning id", [candidate]),
    );
    expect(deleted).toEqual([]);
  });
});
