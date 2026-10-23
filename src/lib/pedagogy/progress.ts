/**
 * Enregistrement des réponses et des leçons terminées sur l'appareil.
 */
import { createLocalStore, isRecord, parseJson } from "@/lib/local-store";
import { gradeAnswer, type GradableQuestion, type GradeResult } from "@/lib/pedagogy/grading";
import { answerHistoryStore, appendAnswer, type AnswerContext, type AnswerRecord } from "@/lib/pedagogy/history";

export interface EngineQuestion extends GradableQuestion {
  competenceIds: readonly string[];
}

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createAnswerRecord(
  question: EngineQuestion,
  selected: readonly string[],
  context: AnswerContext,
  now: Date,
): { record: AnswerRecord; grade: GradeResult } {
  const grade = gradeAnswer(question, selected);
  return {
    grade,
    record: {
      id: createId(),
      questionId: question.id,
      competenceIds: question.competenceIds,
      selected: [...new Set(selected)],
      correct: grade.correct,
      answeredAt: now.toISOString(),
      context,
    },
  };
}

/** Corrige, enregistre dans l'historique et renvoie le détail de la correction. */
export function recordAnswer(
  question: EngineQuestion,
  selected: readonly string[],
  context: AnswerContext,
  now = new Date(),
): GradeResult {
  const { record, grade } = createAnswerRecord(question, selected, context, now);
  answerHistoryStore.set((history) => appendAnswer(history, record));
  return grade;
}

/** Leçons terminées : identifiant → date de fin. */
export type LessonProgress = Readonly<Record<string, string>>;

export function parseLessonProgress(raw: string): LessonProgress | null {
  const data = parseJson(raw);
  if (!isRecord(data)) return null;
  return Object.fromEntries(
    Object.entries(data).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string" && !Number.isNaN(Date.parse(entry[1])),
    ),
  );
}

export const lessonProgressStore = createLocalStore<LessonProgress>({
  key: "kodi-lessons",
  fallback: {},
  parse: parseLessonProgress,
  serialize: (value) => JSON.stringify(value),
});

export function completeLesson(lessonId: string, now = new Date()): void {
  lessonProgressStore.set((progress) => (progress[lessonId] ? progress : { ...progress, [lessonId]: now.toISOString() }));
}
