/**
 * BANQUE DE QUESTIONS DE L'EXAMEN BLANC, tirée du catalogue (content/questions/).
 *
 * Questions ORIGINALES rédigées pour KODI (par une IA) à partir des pages
 * officielles listées dans `sources.ts`. Elles ne proviennent PAS de la banque
 * de l'examen officiel, qui n'est pas publique, et ne doivent jamais être
 * présentées comme telles.
 *
 * Seules entrent ici les questions prévues pour l'examen (examEligible), hors
 * démonstration et hors contenus retirés. Une question n'est « relue » que si
 * son statut est « valide » ; sinon l'interface affiche « Non relues ».
 */
import { QUESTIONS, toQuizQuestion } from "@/content/catalog";
import { SOURCES, type SourceId } from "@/content/sources";
import type { ContentStatus } from "@/lib/content/schema";
import type { QuizQuestion } from "@/lib/quiz";

/** Format vérifié sur service-public.gouv.fr (fiche F33694, consultée le 22/10/2026). */
export const EXAM_FORMAT = {
  questionCount: 40,
  passMark: 35,
  source: SOURCES.examen,
} as const;

export type ReviewStatus = "non-relue" | "relue";

export interface ExamQuestion {
  id: string;
  topic: string;
  prompt: string;
  choices: ReadonlyArray<{ id: string; label: string }>;
  correct: readonly string[];
  explanation: string;
  sources: readonly SourceId[];
  status: ContentStatus;
  review: ReviewStatus;
}

export const EXAM_QUESTIONS: readonly ExamQuestion[] = QUESTIONS.filter((q) => q.examEligible && !q.demo).map((q) => ({
  id: q.id,
  topic: q.topic,
  prompt: q.prompt,
  choices: q.choices,
  correct: q.correct,
  explanation: q.explanation,
  sources: q.sources as SourceId[],
  status: q.status,
  review: q.status === "valide" ? "relue" : "non-relue",
}));

export const EXAM_QUIZ_BANK: readonly QuizQuestion[] = QUESTIONS.filter((q) => q.examEligible && !q.demo).map(
  toQuizQuestion,
);
