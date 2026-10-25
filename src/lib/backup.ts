/**
 * Sauvegarde et restauration des données de l'appareil (fichier JSON).
 *
 * La restauration FUSIONNE : elle n'efface rien de ce qui est déjà sur
 * l'appareil (mêmes règles que la synchronisation, src/lib/sync/learning.ts).
 * Le fichier est vérifié champ par champ avec les mêmes contrôles que le
 * stockage local : une donnée invalide est ignorée.
 */
import { isRecord, parseJson } from "@/lib/local-store";
import { parseHistory, type SessionRecord } from "@/lib/history";
import { parseAnswerHistory, type AnswerRecord } from "@/lib/pedagogy/history";
import { parseLessonProgress, type LessonProgress } from "@/lib/pedagogy/progress";
import { parseProfile, type LocalProfile } from "@/lib/profile";
import { mergeLearning, type LearningState } from "@/lib/sync/learning";

export const BACKUP_FORMAT = "kodi-sauvegarde-1";
export const MAX_BACKUP_BYTES = 5_000_000;

export interface DeviceData {
  profile: LocalProfile;
  answers: readonly AnswerRecord[];
  lessons: LessonProgress;
  sessions: readonly SessionRecord[];
}

export interface Backup {
  format: typeof BACKUP_FORMAT;
  exportedAt: string;
  device: DeviceData;
  /** Export du compte (public.export_my_data), si la personne est connectée. */
  account?: unknown;
}

export function buildBackup(device: DeviceData, now: Date, account?: unknown): Backup {
  return { format: BACKUP_FORMAT, exportedAt: now.toISOString(), device, ...(account === undefined ? {} : { account }) };
}

export type RestoreResult =
  | { ok: true; restored: DeviceData; added: { answers: number; lessons: number; sessions: number } }
  | { ok: false; reason: "trop-gros" | "illisible" | "format-inconnu" };

export function restoreBackup(text: string, current: DeviceData): RestoreResult {
  if (text.length > MAX_BACKUP_BYTES) return { ok: false, reason: "trop-gros" };
  const data = parseJson(text);
  if (!isRecord(data)) return { ok: false, reason: "illisible" };
  if (data.format !== BACKUP_FORMAT || !isRecord(data.device)) return { ok: false, reason: "format-inconnu" };
  const device = data.device;

  const incoming: LearningState = {
    answers: parseAnswerHistory(JSON.stringify(device.answers ?? [])) ?? [],
    lessons: parseLessonProgress(JSON.stringify(device.lessons ?? {})) ?? {},
    sessions: parseHistory(JSON.stringify(device.sessions ?? [])) ?? [],
  };
  const merged = mergeLearning({ answers: current.answers, lessons: current.lessons, sessions: current.sessions }, incoming);
  // Le profil sauvegardé ne remplace qu'un profil vide (appareil neuf).
  const savedProfile = parseProfile(JSON.stringify(device.profile ?? null));
  const profile = !current.profile.onboardingCompleted && savedProfile ? savedProfile : current.profile;

  return {
    ok: true,
    restored: { profile, ...merged },
    added: {
      answers: merged.answers.length - current.answers.length,
      lessons: Object.keys(merged.lessons).length - Object.keys(current.lessons).length,
      sessions: merged.sessions.length - current.sessions.length,
    },
  };
}
