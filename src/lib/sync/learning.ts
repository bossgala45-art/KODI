/**
 * Synchronisation de la progression pédagogique (historique des réponses,
 * leçons terminées, séries) entre l'appareil et le compte.
 *
 * Ces données ne font que s'accumuler : la fusion est une UNION, sans perte,
 * quel que soit l'ordre des écritures (identifiant de réponse ou de série ;
 * date de fin la plus ancienne pour une leçon). L'écriture est conditionnée
 * à la version lue (public.save_learning_state) : si un autre appareil a
 * écrit entre-temps, on relit et on refusionne.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { HISTORY_LIMIT, parseHistory, type SessionRecord } from "@/lib/history";
import { ANSWER_HISTORY_LIMIT, chronological, parseAnswerHistory, type AnswerRecord } from "@/lib/pedagogy/history";
import { parseLessonProgress, type LessonProgress } from "@/lib/pedagogy/progress";

export interface LearningState {
  answers: readonly AnswerRecord[];
  lessons: LessonProgress;
  sessions: readonly SessionRecord[];
}

export const EMPTY_LEARNING: LearningState = { answers: [], lessons: {}, sessions: [] };

export function mergeAnswers(a: readonly AnswerRecord[], b: readonly AnswerRecord[]): AnswerRecord[] {
  const byId = new Map<string, AnswerRecord>();
  for (const record of [...a, ...b]) if (!byId.has(record.id)) byId.set(record.id, record);
  return chronological([...byId.values()]).slice(-ANSWER_HISTORY_LIMIT);
}

export function mergeLessons(a: LessonProgress, b: LessonProgress): LessonProgress {
  const merged: Record<string, string> = { ...a };
  for (const [lessonId, completedAt] of Object.entries(b)) {
    const existing = merged[lessonId];
    if (!existing || Date.parse(completedAt) < Date.parse(existing)) merged[lessonId] = completedAt;
  }
  return Object.fromEntries(Object.entries(merged).sort(([x], [y]) => x.localeCompare(y)));
}

export function mergeSessions(a: readonly SessionRecord[], b: readonly SessionRecord[]): SessionRecord[] {
  const byId = new Map<string, SessionRecord>();
  for (const record of [...a, ...b]) if (!byId.has(record.id)) byId.set(record.id, record);
  return [...byId.values()]
    .sort((x, y) => Date.parse(x.finishedAt) - Date.parse(y.finishedAt) || x.id.localeCompare(y.id))
    .slice(-HISTORY_LIMIT);
}

export function mergeLearning(a: LearningState, b: LearningState): LearningState {
  return {
    answers: mergeAnswers(a.answers, b.answers),
    lessons: mergeLessons(a.lessons, b.lessons),
    sessions: mergeSessions(a.sessions, b.sessions),
  };
}

/** Comparaison indépendante de l'ordre d'origine. */
export function sameLearning(a: LearningState, b: LearningState): boolean {
  const key = (s: LearningState) => JSON.stringify(mergeLearning(s, EMPTY_LEARNING));
  return key(a) === key(b);
}

/** Lecture prudente d'une ligne distante (données éventuellement anciennes ou abîmées). */
export function learningFromRow(row: { answers: unknown; lessons: unknown; sessions: unknown } | null): LearningState {
  if (!row) return EMPTY_LEARNING;
  return {
    answers: parseAnswerHistory(JSON.stringify(row.answers)) ?? [],
    lessons: parseLessonProgress(JSON.stringify(row.lessons)) ?? {},
    sessions: parseHistory(JSON.stringify(row.sessions)) ?? [],
  };
}

export interface LearningStorage {
  read(): LearningState;
  write(state: LearningState): void;
}

/**
 * « merge » : fusionne l'appareil et le compte (même compte, ou appareil
 * jamais rattaché). « replace » : l'appareil a servi à un autre compte, ses
 * données locales ne sont jamais envoyées ; on adopte celles du compte.
 */
export async function syncLearning(
  client: SupabaseClient,
  uid: string,
  storage: LearningStorage,
  mode: "merge" | "replace",
): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await client
      .from("learning_states")
      .select("answers, lessons, sessions, version")
      .eq("user_id", uid)
      .maybeSingle<{ answers: unknown; lessons: unknown; sessions: unknown; version: number }>();
    if (error) throw error;
    const remote = learningFromRow(data);
    const version = data?.version ?? 0;
    const merged = mode === "replace" ? remote : mergeLearning(storage.read(), remote);

    if (!sameLearning(merged, storage.read())) storage.write(merged);
    if (sameLearning(merged, remote) && data) return;

    const saved = await client.rpc("save_learning_state", {
      p_answers: merged.answers,
      p_lessons: merged.lessons,
      p_sessions: merged.sessions,
      p_expected_version: version,
    });
    if (!saved.error) return;
    if (!/KODI_SYNC_CONFLICT/.test(saved.error.message)) throw saved.error;
    // Un autre appareil a écrit entre-temps : on relit et on refusionne.
  }
  throw new Error("KODI_SYNC_CONFLICT");
}
