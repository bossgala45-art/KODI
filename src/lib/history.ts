import { createLocalStore, isRecord, parseJson } from "@/lib/local-store";

export const SESSION_MODES = ["entrainement", "simulation"] as const;
export type SessionMode = (typeof SESSION_MODES)[number];

export const HISTORY_LIMIT = 200;

/** Résultat d'une session terminée, enregistré sur cet appareil. */
export interface SessionRecord {
  id: string;
  mode: SessionMode;
  finishedAt: string;
  correct: number;
  total: number;
  /** Vrai tant que les sessions portent sur des questions fictives. */
  demo: boolean;
}

function isSessionRecord(value: unknown): value is SessionRecord {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (SESSION_MODES as readonly unknown[]).includes(value.mode) &&
    typeof value.finishedAt === "string" &&
    !Number.isNaN(Date.parse(value.finishedAt)) &&
    Number.isInteger(value.correct) &&
    Number.isInteger(value.total) &&
    (value.total as number) > 0 &&
    (value.correct as number) >= 0 &&
    (value.correct as number) <= (value.total as number) &&
    typeof value.demo === "boolean"
  );
}

export function parseHistory(raw: string): SessionRecord[] | null {
  const data = parseJson(raw);
  if (!Array.isArray(data)) return null;
  return data.filter(isSessionRecord).slice(-HISTORY_LIMIT);
}

export const historyStore = createLocalStore<readonly SessionRecord[]>({
  key: "kodi-history",
  fallback: [],
  parse: parseHistory,
  serialize: (value) => JSON.stringify(value),
});

export function appendSession(
  history: readonly SessionRecord[],
  record: SessionRecord,
): SessionRecord[] {
  return [...history, record].slice(-HISTORY_LIMIT);
}

export function createSessionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Clé de jour local « AAAA-MM-JJ ». */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function previousDay(date: Date): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - 1);
  return copy;
}

export interface ModeStats {
  sessions: number;
  questions: number;
  correct: number;
}

export interface ProgressStats {
  sessions: number;
  questions: number;
  correct: number;
  /** Taux de réussite entre 0 et 1, null sans réponse. */
  accuracy: number | null;
  questionsToday: number;
  /** Jours consécutifs d'activité, se terminant aujourd'hui ou hier. */
  streakDays: number;
  byMode: Record<SessionMode, ModeStats>;
  recent: SessionRecord[];
}

export function computeStats(
  history: readonly SessionRecord[],
  now: Date,
): ProgressStats {
  const byMode: Record<SessionMode, ModeStats> = {
    entrainement: { sessions: 0, questions: 0, correct: 0 },
    simulation: { sessions: 0, questions: 0, correct: 0 },
  };
  const activeDays = new Set<string>();
  const today = dayKey(now);
  let questionsToday = 0;

  for (const record of history) {
    const stats = byMode[record.mode];
    stats.sessions += 1;
    stats.questions += record.total;
    stats.correct += record.correct;
    const key = dayKey(new Date(record.finishedAt));
    activeDays.add(key);
    if (key === today) questionsToday += record.total;
  }

  let streakDays = 0;
  let cursor = activeDays.has(today) ? now : previousDay(now);
  while (activeDays.has(dayKey(cursor))) {
    streakDays += 1;
    cursor = previousDay(cursor);
  }

  const questions = byMode.entrainement.questions + byMode.simulation.questions;
  const correct = byMode.entrainement.correct + byMode.simulation.correct;

  return {
    sessions: history.length,
    questions,
    correct,
    accuracy: questions > 0 ? correct / questions : null,
    questionsToday,
    streakDays,
    byMode,
    recent: [...history]
      .sort((a, b) => Date.parse(b.finishedAt) - Date.parse(a.finishedAt))
      .slice(0, 5),
  };
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)} %`;
}
