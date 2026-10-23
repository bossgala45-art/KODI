/**
 * Schéma des fichiers de contenu (dossier content/), validé à l'import.
 *
 * Statuts :
 *   brouillon  → en cours d'écriture, jamais publié ;
 *   a-verifier → complet, en attente de relecture par une personne compétente ;
 *   valide     → relu et validé (date et relecteur obligatoires) ;
 *   retire     → n'est plus proposé (une règle a changé, une erreur…).
 */
import { z } from "zod";

export const CONTENT_STATUSES = ["brouillon", "a-verifier", "valide", "retire"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const STATUS_LABELS: Record<ContentStatus, string> = {
  brouillon: "Brouillon",
  "a-verifier": "À vérifier",
  valide: "Validé",
  retire: "Retiré",
};

/** Correspondance avec l'énumération de la base (public.content_status). */
export const DB_STATUS: Record<ContentStatus, "draft" | "in_review" | "published" | "retired"> = {
  brouillon: "draft",
  "a-verifier": "in_review",
  valide: "published",
  retire: "retired",
};

export const CAMERAS = ["conducteur", "aerienne", "arriere", "usager"] as const;

const id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "identifiant : minuscules, chiffres et tirets");
/** Clé du registre src/content/sources.ts (vérifiée ensuite par le validateur). */
const sourceId = z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/, "source : clé du registre des sources");
const text = z.string().trim().min(1, "texte vide");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date au format AAAA-MM-JJ");

export const reviewSchema = z.object({
  by: text,
  at: isoDate,
  note: z.string().optional(),
});

const base = {
  id,
  status: z.enum(CONTENT_STATUSES),
  review: reviewSchema.optional(),
};

export const universeSchema = z.object({
  ...base,
  slug: id,
  title: text,
  description: z.string().default(""),
  position: z.number().int().min(1).max(10),
  plannedLessons: z.number().int().min(1),
  sources: z.array(sourceId).default([]),
});

export const competenceSchema = z.object({
  ...base,
  universeId: id,
  title: text,
  description: z.string().default(""),
});

const textBlock = z.object({
  type: z.literal("text"),
  title: z.string().optional(),
  paragraphs: z.array(text).min(1),
});

const imageBlock = z.object({
  type: z.literal("image"),
  src: z.string().regex(/^\/contenus\/[a-z0-9/._-]+\.(svg|png|jpg|jpeg|webp)$/, "image dans /contenus/"),
  alt: text,
  caption: z.string().optional(),
  /** Origine et licence : obligatoire (aucune image sans droits). */
  credit: text,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const videoBlock = z
  .object({
    type: z.literal("video"),
    title: text,
    src: z.string().regex(/^\/contenus\/[a-z0-9/._-]+\.(mp4|webm)$/).optional(),
    poster: z.string().optional(),
    /** Transcription : obligatoire pour l'accessibilité. */
    transcript: text,
    credit: z.string().optional(),
    /** Vidéo prévue mais pas encore produite. */
    toProduce: z.boolean().default(false),
  })
  .refine((v) => Boolean(v.src) !== v.toProduce, {
    message: "une vidéo a soit une source (src), soit toProduce: true",
  })
  .refine((v) => !v.src || Boolean(v.credit), { message: "une vidéo publiée doit indiquer son origine (credit)" });

const simulationBlock = z.object({
  type: z.literal("simulation"),
  sceneSlug: id,
  camera: z.enum(CAMERAS).optional(),
  instructions: text,
});

export const blockSchema = z.discriminatedUnion("type", [textBlock, imageBlock, videoBlock, simulationBlock]);

export const lessonSchema = z.object({
  ...base,
  universeId: id,
  slug: id,
  title: text,
  summary: text,
  position: z.number().int().min(1),
  competenceIds: z.array(id).min(1),
  sources: z.array(sourceId).default([]),
  /** Contenu de démonstration : ne peut jamais être validé. */
  demo: z.boolean().default(false),
  blocks: z.array(blockSchema).min(1),
});

export const questionSchema = z.object({
  ...base,
  kind: z.enum(["single", "multiple"]),
  topic: z.string().default(""),
  prompt: z.string().trim().min(10).max(600),
  choices: z
    .array(z.object({ id: z.string().regex(/^[a-f]$/, "proposition : a à f"), label: text }))
    .min(2)
    .max(4),
  correct: z.array(z.string()).min(1),
  explanation: text,
  sources: z.array(sourceId).default([]),
  competenceIds: z.array(id).min(1),
  lessonId: id.optional(),
  /** Peut être tirée dans l'examen blanc. */
  examEligible: z.boolean().default(false),
  demo: z.boolean().default(false),
});

export const universesFileSchema = z.object({ universes: z.array(universeSchema) });
export const competencesFileSchema = z.object({ competences: z.array(competenceSchema) });
export const questionsFileSchema = z.object({ questions: z.array(questionSchema) });

export type Universe = z.infer<typeof universeSchema>;
export type Competence = z.infer<typeof competenceSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type LessonBlock = z.infer<typeof blockSchema>;
export type ContentQuestion = z.infer<typeof questionSchema>;
export type Review = z.infer<typeof reviewSchema>;

export interface Catalog {
  universes: Universe[];
  competences: Competence[];
  lessons: Lesson[];
  questions: ContentQuestion[];
}
