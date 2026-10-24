/* eslint-disable no-console -- script en ligne de commande */
/**
 * Importation des contenus pédagogiques (dossier content/).
 *
 *   npm run content:check   valide tout, sans rien écrire
 *   npm run content:build   valide puis génère :
 *       src/content/generated/catalog.json   catalogue lu par l'application
 *       supabase/seed/content.sql             import en base (rejouable)
 *       content/statuts.lock.json             statuts et empreintes (suivi)
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { SOURCES } from "../src/content/sources";
import { buildLock, checkTransitions, type ContentLock } from "../src/lib/content/lock";
import {
  DB_STATUS,
  STATUS_LABELS,
  competencesFileSchema,
  lessonSchema,
  questionsFileSchema,
  universesFileSchema,
  type Catalog,
  type ContentStatus,
} from "../src/lib/content/schema";
import { validateCatalog } from "../src/lib/content/validate";

const ROOT = join(__dirname, "..");
const CONTENT = join(ROOT, "content");
const LOCK_PATH = join(CONTENT, "statuts.lock.json");

// ---------------------------------------------------------------------------
// Lecture et validation
// ---------------------------------------------------------------------------
function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function parseFile<T>(schema: z.ZodType<T>, path: string, errors: string[]): T | null {
  const result = schema.safeParse(readJson(path));
  if (result.success) return result.data;
  errors.push(`${path.replace(ROOT + "/", "")} :\n${z.prettifyError(result.error)}`);
  return null;
}

function jsonFiles(dir: string): string[] {
  return existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((f) => join(dir, f))
    : [];
}

export function loadCatalog(): { catalog: Catalog; errors: string[] } {
  const errors: string[] = [];
  const universes = parseFile(universesFileSchema, join(CONTENT, "univers.json"), errors)?.universes ?? [];
  const competences = parseFile(competencesFileSchema, join(CONTENT, "competences.json"), errors)?.competences ?? [];
  const lessons = jsonFiles(join(CONTENT, "lecons")).flatMap((f) => {
    const lesson = parseFile(lessonSchema, f, errors);
    return lesson ? [lesson] : [];
  });
  const questions = jsonFiles(join(CONTENT, "questions")).flatMap(
    (f) => parseFile(questionsFileSchema, f, errors)?.questions ?? [],
  );
  const catalog: Catalog = {
    universes: [...universes].sort((a, b) => a.position - b.position),
    competences: [...competences].sort((a, b) => a.id.localeCompare(b.id)),
    lessons: [...lessons].sort((a, b) => a.universeId.localeCompare(b.universeId) || a.position - b.position),
    questions: [...questions].sort((a, b) => a.id.localeCompare(b.id)),
  };
  return { catalog, errors };
}

function readLock(): ContentLock {
  return existsSync(LOCK_PATH) ? (readJson(LOCK_PATH) as ContentLock) : {};
}

export function checkAll(): { catalog: Catalog; errors: string[] } {
  const { catalog, errors } = loadCatalog();
  if (errors.length) return { catalog, errors };
  errors.push(
    ...validateCatalog(catalog, {
      sourceIds: new Set(Object.keys(SOURCES)),
      assetExists: (path) => existsSync(join(ROOT, "public", path)),
    }),
  );
  errors.push(...checkTransitions(readLock(), catalog));
  return { catalog, errors };
}

// ---------------------------------------------------------------------------
// Génération SQL (identifiants stables)
// ---------------------------------------------------------------------------
/** UUID déterministe (version 5) : un contenu garde le même identifiant en base. */
export function stableUuid(name: string): string {
  const namespace = Buffer.from("6f1c0e4a8b2d4c7e9a3f5b1d2e4c6a80", "hex");
  const hash = createHash("sha1").update(namespace).update(name).digest();
  hash[6] = (hash[6]! & 0x0f) | 0x50;
  hash[8] = (hash[8]! & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const sql = (value: string | null | undefined) => (value == null ? "null" : `'${value.replace(/'/g, "''")}'`);
const sqlJson = (value: unknown) => `${sql(JSON.stringify(value))}::jsonb`;
const status = (s: ContentStatus) => `'${DB_STATUS[s]}'::public.content_status`;
const reviewedAt = (r?: { at: string }) => (r ? sql(`${r.at}T12:00:00Z`) : "null");

function sourcesJson(ids: readonly string[]) {
  return ids.map((id) => {
    const source = SOURCES[id as keyof typeof SOURCES];
    return {
      title: source.title,
      publisher: source.publisher,
      url: source.url,
      consulted_at: source.consultedAt,
      cited_articles: "citedArticles" in source ? source.citedArticles : [],
    };
  });
}

export function catalogToSql(catalog: Catalog): string {
  const out: string[] = [
    "-- FICHIER GÉNÉRÉ par « npm run content:build » : ne pas modifier à la main.",
    "-- Importe le catalogue pédagogique (rejouable). Seuls les contenus au statut",
    "-- « valide » (published) deviennent visibles pour les utilisateurs.",
    "begin;",
    "",
  ];

  for (const u of catalog.universes) {
    out.push(
      `insert into public.courses (id, external_ref, slug, title, description, position, planned_lessons, status)
values (${sql(stableUuid(`universe:${u.id}`))}, ${sql(u.id)}, ${sql(u.slug)}, ${sql(u.title)}, ${sql(u.description)}, ${u.position}, ${u.plannedLessons}, ${status(u.status)})
on conflict (id) do update set external_ref = excluded.external_ref, slug = excluded.slug, title = excluded.title,
  description = excluded.description, position = excluded.position, planned_lessons = excluded.planned_lessons, status = excluded.status;`,
    );
  }

  catalog.competences.forEach((c, index) => {
    out.push(
      `insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values (${sql(stableUuid(`competence:${c.id}`))}, ${sql(c.id)}, ${sql(stableUuid(`universe:${c.universeId}`))}, ${sql(c.id)}, ${sql(c.title)}, ${sql(c.description)}, ${index + 1}, ${status(c.status)})
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;`,
    );
  });

  for (const l of catalog.lessons) {
    out.push(
      `insert into public.lessons (id, external_ref, course_id, slug, title, summary, position, status, is_demo, blocks, sources, reviewer_name, reviewed_at, access)
values (${sql(stableUuid(`lesson:${l.id}`))}, ${sql(l.id)}, ${sql(stableUuid(`universe:${l.universeId}`))}, ${sql(l.slug)}, ${sql(l.title)}, ${sql(l.summary)}, ${l.position}, ${status(l.status)}, ${l.demo}, ${sqlJson(l.blocks)}, ${sqlJson(sourcesJson(l.sources))}, ${sql(l.review?.by)}, ${reviewedAt(l.review)}, ${sql(l.access)})
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, summary = excluded.summary, position = excluded.position, status = excluded.status,
  is_demo = excluded.is_demo, blocks = excluded.blocks, sources = excluded.sources,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, access = excluded.access;`,
    );
    out.push(`delete from public.lesson_competences where lesson_id = ${sql(stableUuid(`lesson:${l.id}`))};`);
    for (const c of l.competenceIds) {
      out.push(
        `insert into public.lesson_competences (lesson_id, competence_id) values (${sql(stableUuid(`lesson:${l.id}`))}, ${sql(stableUuid(`competence:${c}`))});`,
      );
    }
  }

  for (const q of catalog.questions) {
    const qid = stableUuid(`question:${q.id}`);
    out.push(
      `insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values (${sql(qid)}, ${sql(q.id)}, ${sql(q.topic)}, ${sql(q.prompt)}, ${sql(q.explanation)}, ${sqlJson(sourcesJson(q.sources))}, ${status(q.status)}, ${sql(q.review?.by)}, ${reviewedAt(q.review)}, ${q.lessonId ? sql(stableUuid(`lesson:${q.lessonId}`)) : "null"}, ${q.demo}, ${q.examEligible})
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;`,
    );
    const choiceIds = q.choices.map((c) => stableUuid(`choice:${q.id}:${c.id}`));
    out.push(`delete from public.question_answers where question_id = ${sql(qid)};`);
    out.push(
      `delete from public.question_choices where question_id = ${sql(qid)} and id not in (${choiceIds.map(sql).join(", ")});`,
    );
    q.choices.forEach((c, index) => {
      out.push(
        `insert into public.question_choices (id, question_id, position, label) values (${sql(choiceIds[index])}, ${sql(qid)}, ${index}, ${sql(c.label)})
on conflict (id) do update set position = excluded.position, label = excluded.label;`,
      );
    });
    q.correct.forEach((id) => {
      out.push(
        `insert into public.question_answers (question_id, choice_id) values (${sql(qid)}, ${sql(stableUuid(`choice:${q.id}:${id}`))});`,
      );
    });
    out.push(`delete from public.question_competences where question_id = ${sql(qid)};`);
    for (const c of q.competenceIds) {
      out.push(
        `insert into public.question_competences (question_id, competence_id) values (${sql(qid)}, ${sql(stableUuid(`competence:${c}`))});`,
      );
    }
  }

  out.push("", "commit;", "");
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// Commandes
// ---------------------------------------------------------------------------
function summary(catalog: Catalog): string {
  const count = (items: { status: ContentStatus }[]) =>
    (Object.keys(STATUS_LABELS) as ContentStatus[])
      .map((s) => `${STATUS_LABELS[s].toLowerCase()} ${items.filter((i) => i.status === s).length}`)
      .join(", ");
  return [
    `univers     : ${catalog.universes.length} (${count(catalog.universes)})`,
    `compétences : ${catalog.competences.length} (${count(catalog.competences)})`,
    `leçons      : ${catalog.lessons.length} sur ${catalog.universes.reduce((s, u) => s + u.plannedLessons, 0)} prévues (${count(catalog.lessons)})`,
    `questions   : ${catalog.questions.length} (${count(catalog.questions)})`,
  ].join("\n");
}

function main() {
  const command = process.argv[2] ?? "check";
  const { catalog, errors } = checkAll();
  if (errors.length) {
    console.error(`Contenu invalide (${errors.length} erreur${errors.length > 1 ? "s" : ""}) :\n`);
    errors.forEach((e) => console.error(`- ${e}`));
    process.exit(1);
  }
  console.log(summary(catalog));
  if (command !== "build") return;

  const generated = join(ROOT, "src", "content", "generated");
  mkdirSync(generated, { recursive: true });
  writeFileSync(join(generated, "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
  writeFileSync(join(ROOT, "supabase", "seed", "content.sql"), catalogToSql(catalog));
  writeFileSync(LOCK_PATH, `${JSON.stringify(buildLock(catalog), null, 2)}\n`);
  console.log("\nGénérés : src/content/generated/catalog.json, supabase/seed/content.sql, content/statuts.lock.json");
}

if (process.argv[1]?.endsWith("content.ts")) main();
