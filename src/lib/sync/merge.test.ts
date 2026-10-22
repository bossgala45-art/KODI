import { describe, expect, it } from "vitest";
import { DEFAULT_PROFILE } from "@/lib/profile";
import {
  decideFirstLink,
  decideSync,
  preferencesFromRow,
  profileFromRow,
  profileToRow,
  type ResourceSyncState,
} from "@/lib/sync/merge";

const T0 = "2026-10-22T10:00:00.000Z";
const T1 = "2026-10-22T10:05:00.000Z";
const T2 = "2026-10-22T10:10:00.000Z";

const state = (localChangedAt: string | null, remoteUpdatedAt: string | null): ResourceSyncState => ({
  localChangedAt,
  remoteUpdatedAt,
});

describe("decideSync", () => {
  it("récupère une version serveur plus récente", () => {
    expect(decideSync(state(null, T0), T1)).toBe("pull");
    expect(decideSync(state(null, null), T0)).toBe("pull");
  });

  it("ne fait rien si tout est à jour", () => {
    expect(decideSync(state(null, T1), T1)).toBe("none");
  });

  it("envoie une modification locale en attente", () => {
    expect(decideSync(state(T1, T0), T0)).toBe("push");
  });

  it("en cas de conflit, la modification la plus récente gagne", () => {
    // Modifié ici à T1 (hors ligne), puis ailleurs à T2 : le serveur gagne.
    expect(decideSync(state(T1, T0), T2)).toBe("pull");
    // Modifié ailleurs à T1, puis ici à T2 : l'appareil gagne.
    expect(decideSync(state(T2, T0), T1)).toBe("push");
  });
});

describe("decideFirstLink", () => {
  it("un compte jamais modifié adopte les données de l’appareil", () => {
    expect(decideFirstLink({ created_at: T0, updated_at: T0 })).toBe("adopt-local");
  });

  it("un compte déjà utilisé fait foi", () => {
    expect(decideFirstLink({ created_at: T0, updated_at: T2 })).toBe("use-remote");
  });
});

describe("conversions", () => {
  it("profil : aller-retour et valeurs invalides ignorées", () => {
    const row = { first_name: "  Léa ", daily_goal: 40, onboarding_completed: true, created_at: T0, updated_at: T1 };
    const profile = profileFromRow(row, DEFAULT_PROFILE);
    expect(profile).toEqual({ firstName: "Léa", dailyGoal: 40, onboardingCompleted: true });
    expect(profileToRow(profile)).toEqual({ first_name: "Léa", daily_goal: 40, onboarding_completed: true });
    expect(profileFromRow({ ...row, daily_goal: 15 }, DEFAULT_PROFILE).dailyGoal).toBe(20);
  });

  it("préférences : valeurs inconnues ignorées", () => {
    expect(preferencesFromRow({ theme: "dark", motion: "reduce", updated_at: T0 }, { theme: "system", motion: "system" })).toEqual({
      theme: "dark",
      motion: "reduce",
    });
    expect(preferencesFromRow({ theme: "rose", motion: "x", updated_at: T0 }, { theme: "light", motion: "full" })).toEqual({
      theme: "light",
      motion: "full",
    });
  });
});
