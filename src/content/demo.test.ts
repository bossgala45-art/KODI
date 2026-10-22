import { describe, expect, it } from "vitest";
import { DEMO_QUESTIONS, DEMO_UNIVERSES, SIMULATION_LENGTH, TRAINING_LENGTH } from "@/content/demo";

describe("données de démonstration", () => {
  it("contient assez de questions pour chaque mode", () => {
    expect(DEMO_QUESTIONS.length).toBeGreaterThanOrEqual(SIMULATION_LENGTH);
    expect(DEMO_QUESTIONS.length).toBeGreaterThanOrEqual(TRAINING_LENGTH);
  });

  it("a des questions cohérentes (identifiants uniques, bonnes réponses existantes)", () => {
    const ids = new Set(DEMO_QUESTIONS.map((q) => q.id));
    expect(ids.size).toBe(DEMO_QUESTIONS.length);
    for (const question of DEMO_QUESTIONS) {
      expect(question.id.startsWith("demo-")).toBe(true);
      const choiceIds = question.choices.map((c) => c.id);
      expect(new Set(choiceIds).size).toBe(choiceIds.length);
      expect(question.correct.length).toBeGreaterThan(0);
      expect(question.correct.every((id) => choiceIds.includes(id))).toBe(true);
      expect(question.explanation.length).toBeGreaterThan(0);
    }
  });

  it("présente 10 univers explicitement fictifs", () => {
    expect(DEMO_UNIVERSES).toHaveLength(10);
    expect(DEMO_UNIVERSES.every((u) => u.title.includes("fictif"))).toBe(true);
    expect(DEMO_UNIVERSES.reduce((sum, u) => sum + u.lessons, 0)).toBe(72);
  });
});
