/**
 * Règles de synchronisation entre les données locales (cet appareil) et le
 * compte (Supabase). Fonctions pures, testées unitairement.
 *
 * Principe : « la dernière modification gagne », comparée sur l'horodatage
 * serveur (updated_at) et l'horodatage local de la dernière modification.
 */
import { isDailyGoal, normalizeFirstName, type LocalProfile } from "@/lib/profile";
import {
  isMotionPreference,
  isThemePreference,
  type MotionPreference,
  type ThemePreference,
} from "@/lib/theme";

export interface ProfileRow {
  first_name: string;
  daily_goal: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PreferencesRow {
  theme: string;
  motion: string;
  updated_at: string;
}

export interface Preferences {
  theme: ThemePreference;
  motion: MotionPreference;
}

/** État de synchronisation d'une ressource, conservé sur l'appareil. */
export interface ResourceSyncState {
  /** Date de la dernière modification locale non encore confirmée. */
  localChangedAt: string | null;
  /** updated_at serveur de la dernière version connue. */
  remoteUpdatedAt: string | null;
}

export type SyncDecision = "push" | "pull" | "none";

const time = (iso: string | null | undefined) => (iso ? Date.parse(iso) : Number.NaN);

/**
 * Décide du sens de synchronisation d'une ressource.
 * - modification locale en attente plus récente que le serveur : on envoie ;
 * - version serveur plus récente que ce que l'appareil connaît : on récupère ;
 * - sinon : rien à faire.
 */
export function decideSync(state: ResourceSyncState, remoteUpdatedAt: string): SyncDecision {
  const remote = time(remoteUpdatedAt);
  const known = time(state.remoteUpdatedAt);
  const local = time(state.localChangedAt);

  if (!Number.isNaN(local)) {
    // Conflit : modifié ici hors ligne ET ailleurs ensuite → le plus récent gagne.
    if (!Number.isNaN(known) && remote > known && remote > local) return "pull";
    return "push";
  }
  if (Number.isNaN(known) || remote > known) return "pull";
  return "none";
}

/**
 * Premier rattachement d'un appareil à un compte : si le compte n'a jamais
 * été modifié (création toute récente), il adopte les données de l'appareil ;
 * sinon, le compte fait foi.
 */
export function decideFirstLink(row: Pick<ProfileRow, "created_at" | "updated_at">): "adopt-local" | "use-remote" {
  return time(row.updated_at) <= time(row.created_at) + 1000 ? "adopt-local" : "use-remote";
}

export function profileFromRow(row: ProfileRow, current: LocalProfile): LocalProfile {
  return {
    ...current,
    firstName: normalizeFirstName(row.first_name ?? ""),
    dailyGoal: isDailyGoal(row.daily_goal) ? row.daily_goal : current.dailyGoal,
    onboardingCompleted: row.onboarding_completed === true,
  };
}

export function profileToRow(profile: LocalProfile) {
  return {
    first_name: normalizeFirstName(profile.firstName),
    daily_goal: profile.dailyGoal,
    onboarding_completed: profile.onboardingCompleted,
  };
}

export function preferencesFromRow(row: PreferencesRow, current: Preferences): Preferences {
  return {
    theme: isThemePreference(row.theme) ? row.theme : current.theme,
    motion: isMotionPreference(row.motion) ? row.motion : current.motion,
  };
}

export function sameProfile(a: LocalProfile, b: LocalProfile): boolean {
  return (
    a.firstName === b.firstName &&
    a.dailyGoal === b.dailyGoal &&
    a.onboardingCompleted === b.onboardingCompleted
  );
}
