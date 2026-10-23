/**
 * Historique des réponses : source unique de vérité du moteur. La maîtrise,
 * les cartes de révision et le carnet d'erreurs en sont déduits ; ils ne sont
 * jamais stockés séparément, donc toujours cohérents entre eux.
 */
import { createLocalStore, isRecord, parseJson } from "@/lib/local-store";
import { masteryByCompetence, weakestScore, type MasteryEstimate } from "@/lib/pedagogy/mastery";
import { scheduleNext, type ReviewCard } from "@/lib/pedagogy/scheduler";

export const ANSWER_CONTEXTS = ["lesson", "review", "practice", "exam"] as const;
export type AnswerContext = (typeof ANSWER_CONTEXTS)[number];

export interface AnswerRecord {
  id: string;
  questionId: string;
  competenceIds: readonly string[];
  selected: readonly string[];
  correct: boolean;
  answeredAt: string;
  context: AnswerContext;
}

export const ANSWER_HISTORY_LIMIT = 5000;

function isAnswerRecord(value: unknown): value is AnswerRecord {
  const strings = (v: unknown) => Array.isArray(v) && v.every((x) => typeof x === "string");
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.questionId === "string" &&
    strings(value.competenceIds) &&
    strings(value.selected) &&
    typeof value.correct === "boolean" &&
    typeof value.answeredAt === "string" &&
    !Number.isNaN(Date.parse(value.answeredAt)) &&
    (ANSWER_CONTEXTS as readonly unknown[]).includes(value.context)
  );
}

export function parseAnswerHistory(raw: string): AnswerRecord[] | null {
  const data = parseJson(raw);
  if (!Array.isArray(data)) return null;
  return data.filter(isAnswerRecord).slice(-ANSWER_HISTORY_LIMIT);
}

export const answerHistoryStore = createLocalStore<readonly AnswerRecord[]>({
  key: "kodi-answers",
  fallback: [],
  parse: parseAnswerHistory,
  serialize: (value) => JSON.stringify(value),
});

export function appendAnswer(history: readonly AnswerRecord[], record: AnswerRecord): AnswerRecord[] {
  return [...history, record].slice(-ANSWER_HISTORY_LIMIT);
}

export function chronological(history: readonly AnswerRecord[]): AnswerRecord[] {
  return [...history].sort((a, b) => Date.parse(a.answeredAt) - Date.parse(b.answeredAt));
}

/**
 * Reconstitue les cartes de révision en rejouant l'historique. À chaque
 * réponse, la maîtrise utilisée est celle des réponses strictement
 * antérieures (même règle qu'en SQL, private.record_revision).
 */
export function replayCards(history: readonly AnswerRecord[]): Map<string, ReviewCard> {
  const cards = new Map<string, ReviewCard>();
  const seen: AnswerRecord[] = [];
  for (const record of chronological(history)) {
    const at = new Date(record.answeredAt);
    const mastery = masteryByCompetence(
      seen.filter((r) => Date.parse(r.answeredAt) < at.getTime()),
      at,
    );
    const card = scheduleNext(
      cards.get(record.questionId) ?? null,
      record.correct,
      at,
      weakestScore(record.competenceIds, mastery),
    );
    cards.set(record.questionId, card);
    seen.push(record);
  }
  return cards;
}

export interface LearnerState {
  cards: Map<string, ReviewCard>;
  mastery: Map<string, MasteryEstimate>;
}

export function learnerState(history: readonly AnswerRecord[], now: Date): LearnerState {
  return { cards: replayCards(history), mastery: masteryByCompetence(history, now) };
}

export function answeredOn(history: readonly AnswerRecord[], day: Date): number {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return history.filter((r) => {
    const t = Date.parse(r.answeredAt);
    return t >= start.getTime() && t < end.getTime();
  }).length;
}
