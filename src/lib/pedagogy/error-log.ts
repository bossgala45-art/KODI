/**
 * Carnet d'erreurs : les questions manquées, jusqu'à ce qu'elles soient
 * réussies plusieurs fois de suite (2 par défaut) après la dernière erreur.
 */
import { chronological, type AnswerRecord } from "@/lib/pedagogy/history";

export const ERROR_LOG_RESOLVE_AFTER = 2;

export interface ErrorEntry {
  questionId: string;
  competenceIds: readonly string[];
  /** Nombre total d'erreurs sur cette question. */
  wrongCount: number;
  lastWrongAt: string;
  /** Propositions cochées lors de la dernière erreur. */
  lastSelected: readonly string[];
  /** Bonnes réponses consécutives depuis la dernière erreur. */
  correctSince: number;
}

export function buildErrorLog(
  history: readonly AnswerRecord[],
  resolveAfter = ERROR_LOG_RESOLVE_AFTER,
): ErrorEntry[] {
  const active = new Map<string, ErrorEntry>();
  const wrongTotals = new Map<string, number>();

  for (const record of chronological(history)) {
    if (!record.correct) {
      const total = (wrongTotals.get(record.questionId) ?? 0) + 1;
      wrongTotals.set(record.questionId, total);
      active.set(record.questionId, {
        questionId: record.questionId,
        competenceIds: record.competenceIds,
        wrongCount: total,
        lastWrongAt: record.answeredAt,
        lastSelected: record.selected,
        correctSince: 0,
      });
      continue;
    }
    const entry = active.get(record.questionId);
    if (!entry) continue;
    const correctSince = entry.correctSince + 1;
    if (correctSince >= resolveAfter) active.delete(record.questionId);
    else active.set(record.questionId, { ...entry, correctSince });
  }

  return [...active.values()].sort((a, b) => Date.parse(b.lastWrongAt) - Date.parse(a.lastWrongAt));
}
