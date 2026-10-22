import { describe, expect, it, vi } from "vitest";
import {
  THEME_STORAGE_KEY,
  isThemePreference,
  resolveTheme,
  themeInitScript,
} from "@/lib/theme";

function mockSystemDark(prefersDark: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query === "(prefers-color-scheme: dark)" && prefersDark,
        media: query,
      }) as MediaQueryList,
  );
}

function runInitScript() {
  new Function(themeInitScript)();
}

describe("isThemePreference", () => {
  it("accepte uniquement les trois valeurs prévues", () => {
    expect(isThemePreference("light")).toBe(true);
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("system")).toBe(true);
    expect(isThemePreference("blue")).toBe(false);
    expect(isThemePreference(null)).toBe(false);
    expect(isThemePreference(undefined)).toBe(false);
  });
});

describe("resolveTheme", () => {
  it("respecte un choix explicite quelle que soit la préférence système", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("suit le système en mode auto", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});

describe("themeInitScript", () => {
  it("applique le thème enregistré", () => {
    mockSystemDark(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    runInitScript();
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("suit le système sans choix enregistré", () => {
    mockSystemDark(true);
    runInitScript();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("ignore une valeur enregistrée invalide", () => {
    mockSystemDark(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, "rose");
    runInitScript();
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("ne lève pas d’erreur si le stockage est inaccessible", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(runInitScript).not.toThrow();
  });
});
