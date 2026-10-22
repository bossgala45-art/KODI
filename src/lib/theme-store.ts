import { createLocalStore } from "@/lib/local-store";
import {
  MOTION_STORAGE_KEY,
  THEME_STORAGE_KEY,
  isMotionPreference,
  isThemePreference,
  resolveMotion,
  resolveTheme,
  type MotionPreference,
  type ThemePreference,
} from "@/lib/theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const themeStore = createLocalStore<ThemePreference>({
  key: THEME_STORAGE_KEY,
  fallback: "system",
  parse: (raw) => (isThemePreference(raw) ? raw : null),
  serialize: (value) => value,
});

export const motionStore = createLocalStore<MotionPreference>({
  key: MOTION_STORAGE_KEY,
  fallback: "system",
  parse: (raw) => (isMotionPreference(raw) ? raw : null),
  serialize: (value) => value,
});

export function applyTheme(preference: ThemePreference): void {
  const theme = resolveTheme(preference, window.matchMedia(DARK_QUERY).matches);
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function applyMotion(preference: MotionPreference): void {
  document.documentElement.dataset.motion = resolveMotion(
    preference,
    window.matchMedia(REDUCED_MOTION_QUERY).matches,
  );
}

export function setThemePreference(preference: ThemePreference): void {
  if (preference === "system") themeStore.reset();
  else themeStore.set(preference);
  applyTheme(preference);
}

export function setMotionPreference(preference: MotionPreference): void {
  if (preference === "system") motionStore.reset();
  else motionStore.set(preference);
  applyMotion(preference);
}

/**
 * Garde <html> synchronisé avec les préférences : changement côté système
 * (mode « Auto ») ou modification dans un autre onglet.
 */
export function watchAppearance(): () => void {
  const dark = window.matchMedia(DARK_QUERY);
  const motion = window.matchMedia(REDUCED_MOTION_QUERY);
  const syncTheme = () => applyTheme(themeStore.get());
  const syncMotion = () => applyMotion(motionStore.get());

  dark.addEventListener("change", syncTheme);
  motion.addEventListener("change", syncMotion);
  const offTheme = themeStore.subscribe(syncTheme);
  const offMotion = motionStore.subscribe(syncMotion);

  return () => {
    dark.removeEventListener("change", syncTheme);
    motion.removeEventListener("change", syncMotion);
    offTheme();
    offMotion();
  };
}
