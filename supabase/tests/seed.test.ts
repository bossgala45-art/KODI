import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";
import { EXAM_QUESTIONS } from "../../src/content/exam-questions";
import { TestDb } from "./helpers/session";

let db: TestDb;
let reader: string;
const seedSql = readFileSync(join(__dirname, "..", "seed", "questions.sql"), "utf8")
  // La transaction est gérée par le test (annulée à la fin).
  .replace(/^begin;$/m, "")
  .replace(/^commit;$/m, "");

beforeAll(async () => {
  db = new TestDb(inject("databaseUrl"));
  reader = await db.createUser("lecteur-seed");
});
afterAll(() => db.close());

describe("chargement des questions de l’examen blanc", () => {
  it("le fichier généré contient toutes les questions (sinon « npm run seed:questions »)", () => {
    for (const question of EXAM_QUESTIONS) {
      expect(seedSql).toContain(`'${question.id}'`);
    }
  });

  it("charge les questions en relecture, invisibles pour les utilisateurs, et se rejoue sans doublon", async () => {
    await db.adminRollback(async (q) => {
      await q(seedSql);
      await q(seedSql);
      const [row] = await q<{ total: number; in_review: number; with_answers: number }>(`
        select count(*)::int as total,
               count(*) filter (where status = 'in_review')::int as in_review,
               count(*) filter (where answer_count > 0)::int as with_answers
        from public.questions where external_ref like 'ex-%'`);
      expect(row).toEqual({
        total: EXAM_QUESTIONS.length,
        in_review: EXAM_QUESTIONS.length,
        with_answers: EXAM_QUESTIONS.length,
      });

      await TestDb.impersonate(q, reader);
      const visible = await q("select id from public.questions where external_ref like 'ex-%'");
      expect(visible).toEqual([]);
    });
  });

  it("enregistre les mêmes bonnes réponses que l’application", async () => {
    await db.adminRollback(async (q) => {
      await q(seedSql);
      const rows = await q<{ ref: string; positions: number[] }>(`
        select q.external_ref as ref, array_agg(c.position order by c.position) as positions
        from public.questions q
        join public.question_answers a on a.question_id = q.id
        join public.question_choices c on c.id = a.choice_id
        where q.external_ref like 'ex-%' group by 1`);
      const byRef = new Map(rows.map((r) => [r.ref, r.positions]));
      for (const question of EXAM_QUESTIONS) {
        const expected = question.choices
          .map((c, i) => (question.correct.includes(c.id) ? i : -1))
          .filter((i) => i >= 0);
        expect(byRef.get(question.id), question.id).toEqual(expected);
      }
    });
  });
});
