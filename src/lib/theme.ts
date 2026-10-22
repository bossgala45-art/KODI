export const THEME_STORAGE_KEY = "kodi-theme";
export const MOTION_STORAGE_KEY = "kodi-motion";

export const THEME_PREFERENCES = ["light", "dark", "system"] as const;
export const MOTION_PREFERENCES = ["full", "reduce", "system"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = Exclude<ThemePreference, "system">;
export type MotionPreference = (typeof MOTION_PREFERENCES)[number];
export type ResolvedMotion = Exclude<MotionPreference, "system">;

export function isThemePreference(value: unknown): value is ThemePreference {
  return (
    typeof value === "string" &&
    (THEME_PREFERENCES as readonly string[]).includes(value)
  );
}

export function isMotionPreference(value: unknown): value is MotionPreference {
  return (
    typeof value === "string" &&
    (MOTION_PREFERENCES as readonly string[]).includes(value)
  );
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }
  return preference;
}

export function resolveMotion(
  preference: MotionPreference,
  systemPrefersReduced: boolean,
): ResolvedMotion {
  if (preference === "system") {
    return systemPrefersReduced ? "reduce" : "full";
  }
  return preference;
}

/**
 * Script exécuté dans <head> avant le premier rendu pour appliquer le thème
 * et le niveau d'animation enregistrés, sans flash. Il doit rester cohérent
 * avec `resolveTheme` / `resolveMotion` : les tests unitaires l'exécutent.
 */
export const themeInitScript = `(function(){try{var r=document.documentElement,m=window.matchMedia;var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t!=="light"&&t!=="dark"){t=m("(prefers-color-scheme: dark)").matches?"dark":"light";}r.dataset.theme=t;r.style.colorScheme=t;var a=localStorage.getItem(${JSON.stringify(
  MOTION_STORAGE_KEY,
)});if(a!=="full"&&a!=="reduce"){a=m("(prefers-reduced-motion: reduce)").matches?"reduce":"full";}r.dataset.motion=a;}catch(e){}})();`;
