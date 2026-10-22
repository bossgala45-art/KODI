import { describe, expect, it } from "vitest";
import { DEFAULT_PROFILE, initials, normalizeFirstName, parseProfile } from "@/lib/profile";

describe("profil local", () => {
  it("nettoie et limite le prénom", () => {
    expect(normalizeFirstName("  Léa   Marie ")).toBe("Léa Marie");
    expect(normalizeFirstName("x".repeat(50))).toHaveLength(30);
  });

  it("calcule l’initiale", () => {
    expect(initials(" élodie")).toBe("É");
    expect(initials("")).toBe("");
  });

  it("lit un profil valide", () => {
    expect(
      parseProfile(JSON.stringify({ firstName: "Sam", dailyGoal: 40, onboardingCompleted: true })),
    ).toEqual({ firstName: "Sam", dailyGoal: 40, onboardingCompleted: true });
  });

  it("corrige les champs invalides avec les valeurs par défaut", () => {
    expect(parseProfile(JSON.stringify({ firstName: 3, dailyGoal: 15, onboardingCompleted: "oui" }))).toEqual(
      DEFAULT_PROFILE,
    );
  });

  it("rejette un contenu illisible", () => {
    expect(parseProfile("{")).toBeNull();
    expect(parseProfile("[]")).toBeNull();
  });
});
