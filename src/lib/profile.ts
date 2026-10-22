import { createLocalStore, isRecord, parseJson } from "@/lib/local-store";

export const DAILY_GOALS = [10, 20, 40] as const;
export type DailyGoal = (typeof DAILY_GOALS)[number];

export const DAILY_GOAL_OPTIONS = DAILY_GOALS.map((goal) => ({
  value: String(goal) as `${DailyGoal}`,
  label: `${goal} questions`,
}));

export const FIRST_NAME_MAX_LENGTH = 30;

/** Profil conservé uniquement sur cet appareil (aucun compte en ligne). */
export interface LocalProfile {
  firstName: string;
  dailyGoal: DailyGoal;
  onboardingCompleted: boolean;
}

export const DEFAULT_PROFILE: LocalProfile = {
  firstName: "",
  dailyGoal: 20,
  onboardingCompleted: false,
};

export function isDailyGoal(value: unknown): value is DailyGoal {
  return (DAILY_GOALS as readonly unknown[]).includes(value);
}

export function normalizeFirstName(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, FIRST_NAME_MAX_LENGTH);
}

export function parseProfile(raw: string): LocalProfile | null {
  const data = parseJson(raw);
  if (!isRecord(data)) return null;
  return {
    firstName:
      typeof data.firstName === "string" ? normalizeFirstName(data.firstName) : "",
    dailyGoal: isDailyGoal(data.dailyGoal) ? data.dailyGoal : DEFAULT_PROFILE.dailyGoal,
    onboardingCompleted: data.onboardingCompleted === true,
  };
}

export const profileStore = createLocalStore<LocalProfile>({
  key: "kodi-profile",
  fallback: DEFAULT_PROFILE,
  parse: parseProfile,
  serialize: (value) => JSON.stringify(value),
});

export function initials(firstName: string): string {
  const letter = normalizeFirstName(firstName).charAt(0);
  return letter ? letter.toLocaleUpperCase("fr-FR") : "";
}
