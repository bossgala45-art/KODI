import { describe, expect, it } from "vitest";
import { TABS, isActivePath } from "@/lib/navigation";

describe("navigation", () => {
  it("comporte exactement cinq onglets", () => {
    expect(TABS.map((tab) => tab.label)).toEqual([
      "Accueil",
      "Apprendre",
      "Simuler",
      "S’entraîner",
      "Progression",
    ]);
  });

  it("n’active l’accueil que sur la racine", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/apprendre", "/")).toBe(false);
  });

  it("active un onglet sur ses sous-pages, sans faux positif de préfixe", () => {
    expect(isActivePath("/apprendre", "/apprendre")).toBe(true);
    expect(isActivePath("/apprendre/univers-1", "/apprendre")).toBe(true);
    expect(isActivePath("/apprendre-plus", "/apprendre")).toBe(false);
  });
});
