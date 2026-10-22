"use client";

import { useSyncExternalStore } from "react";
import { THEME_PREFERENCES, type ThemePreference } from "@/lib/theme";
import {
  readThemePreference,
  setThemePreference,
  subscribeThemePreference,
} from "@/lib/theme-store";

const LABELS: Record<ThemePreference, string> = {
  light: "Clair",
  dark: "Sombre",
  system: "Auto",
};

export function ThemeSwitcher() {
  const preference = useSyncExternalStore(
    subscribeThemePreference,
    readThemePreference,
    () => "system",
  );

  return (
    <fieldset className="flex rounded-full border border-line bg-surface p-1 text-sm">
      <legend className="sr-only">Thème d’affichage</legend>
      {THEME_PREFERENCES.map((option) => (
        <label
          key={option}
          className="cursor-pointer rounded-full px-3 py-1.5 font-medium text-muted transition-colors has-checked:bg-brand has-checked:text-on-brand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand"
        >
          <input
            type="radio"
            name="theme"
            value={option}
            checked={preference === option}
            onChange={() => setThemePreference(option)}
            className="sr-only"
          />
          {LABELS[option]}
        </label>
      ))}
    </fieldset>
  );
}
