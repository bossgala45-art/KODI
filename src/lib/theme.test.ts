import { describe, expect, it, vi } from "vitest";
import {
  MOTION_STORAGE_KEY,
  THEME_STORAGE_KEY,
  isMotionPreference,
  isThemePreference,
  resolveMotion,
  resolveTheme,
  themeInitScript,
} from "@/lib/theme";

function mockSystem({ dark = false, reducedMotion = false } = {}) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches:
          (query === "(prefers-color-scheme: dark)" && dark) ||
          (query === "(prefers-reduced-motion: reduce)" && reducedMotion),
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

describe("préférence d’animation", () => {
  it("accepte uniquement les trois valeurs prévues", () => {
    expect(isMotionPreference("full")).toBe(true);
    expect(isMotionPreference("reduce")).toBe(true);
    expect(isMotionPreference("system")).toBe(true);
    expect(isMotionPreference("off")).toBe(false);
  });

  it("respecte un choix explicite et suit le système en mode auto", () => {
    expect(resolveMotion("full", true)).toBe("full");
    expect(resolveMotion("reduce", false)).toBe("reduce");
    expect(resolveMotion("system", true)).toBe("reduce");
    expect(resolveMotion("system", false)).toBe("full");
  });
});

describe("themeInitScript", () => {
  it("applique le thème enregistré", () => {
    mockSystem({ dark: true });
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    runInitScript();
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("suit le système sans choix enregistré", () => {
    mockSystem({ dark: true });
    runInitScript();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("ignore une valeur enregistrée invalide", () => {
    mockSystem();
    window.localStorage.setItem(THEME_STORAGE_KEY, "rose");
    runInitScript();
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("applique la réduction des animations du système en mode auto", () => {
    mockSystem({ reducedMotion: true });
    runInitScript();
    expect(document.documentElement.dataset.motion).toBe("reduce");
  });

  it("applique le choix d’animation enregistré", () => {
    mockSystem({ reducedMotion: true });
    window.localStorage.setItem(MOTION_STORAGE_KEY, "full");
    runInitScript();
    expect(document.documentElement.dataset.motion).toBe("full");
  });

  it("ne lève pas d’erreur si le stockage est inaccessible", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(runInitScript).not.toThrow();
  });
});
