import type { TestProject } from "vitest/node";
import { Client } from "pg";
import { applySchema, startPostgres } from "./helpers/postgres";

declare module "vitest" {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

export const PUBLISHED_QUESTIONS = 45;

/** Contenus de test : publiés, brouillons et en relecture. */
async function seed(connectionString: string): Promise<void> {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(`
      insert into public.courses (slug, title, status) values
        ('cours-publie', 'Cours publié', 'published'),
        ('cours-brouillon', 'Cours brouillon', 'draft');
      insert into public.simulation_scenes (slug, title, status) values
        ('scene-publiee', 'Scène publiée', 'published'),
        ('scene-brouillon', 'Scène brouillon', 'draft');
    `);

    const insertQuestion = async (ref: string, status: string, answers: number[]) => {
      const reviewed = status === "published";
      const [q] = (
        await client.query(
          `insert into public.questions (external_ref, prompt, explanation, sources, status, reviewed_at, exam_eligible)
           values ($1, $2, 'Explication de test', $3, $4, $5, true) returning id`,
          [
            ref,
            `Question de test ${ref} ?`,
            JSON.stringify([{ title: "Source de test", url: "https://exemple.test" }]),
            status,
            reviewed ? new Date().toISOString() : null,
          ],
        )
      ).rows;
      const choiceIds: string[] = [];
      for (let p = 0; p < 3; p += 1) {
        const [c] = (
          await client.query(
            "insert into public.question_choices (question_id, position, label) values ($1, $2, $3) returning id",
            [q.id, p, `Proposition ${p}`],
          )
        ).rows;
        choiceIds.push(c.id);
      }
      for (const a of answers) {
        await client.query("insert into public.question_answers (question_id, choice_id) values ($1, $2)", [
          q.id,
          choiceIds[a],
        ]);
      }
    };

    for (let i = 1; i <= PUBLISHED_QUESTIONS; i += 1) {
      await insertQuestion(`pub-${i}`, "published", i % 5 === 0 ? [0, 2] : [i % 3]);
    }
    await insertQuestion("brouillon-1", "draft", [1]);
    await insertQuestion("relecture-1", "in_review", [2]);
  } finally {
    await client.end();
  }
}

export default async function setup(project: TestProject) {
  const db = startPostgres();
  try {
    await applySchema(db.connectionString);
    await seed(db.connectionString);
  } catch (error) {
    db.stop();
    throw error;
  }
  project.provide("databaseUrl", db.connectionString);
  return () => db.stop();
}
