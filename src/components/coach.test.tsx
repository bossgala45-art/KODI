import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CoachDashboard, CoachSummaryCard } from "@/components/coach";
import { answerHistoryStore, type AnswerRecord } from "@/lib/pedagogy/history";
import { profileStore } from "@/lib/profile";

const ago = (days: number, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10, minute, 0, 0);
  return d.toISOString();
};
const record = (i: number, questionId: string, correct: boolean, answeredAt: string, competenceIds: string[]): AnswerRecord => ({
  id: `r${i}`,
  questionId,
  competenceIds,
  selected: ["a"],
  correct,
  answeredAt,
  context: "review",
});

describe("tableau de bord du coach", () => {
  it("sans réponse : explique qu’il faut d’abord répondre, sans estimer la préparation", () => {
    render(<CoachDashboard />);
    expect(screen.getByText("Pas assez de réponses pour estimer")).toBeDefined();
    expect(screen.getByText("Votre coach attend vos premières réponses")).toBeDefined();
    expect(screen.getByText("Niveau")).toBeDefined();
  });

  it("repère une compétence fragile et des erreurs répétées, et propose un objectif", async () => {
    // Questions réelles du catalogue (vitesses) manquées plusieurs fois.
    answerHistoryStore.set([
      record(1, "ex-032", false, ago(3), ["c-vitesses"]),
      record(2, "ex-032", false, ago(2), ["c-vitesses"]),
      record(3, "ex-033", false, ago(2, 5), ["c-vitesses"]),
      record(4, "ex-034", false, ago(1), ["c-vitesses"]),
    ]);
    profileStore.set((p) => ({ ...p, dailyGoal: 40 }));
    const user = userEvent.setup();
    render(<CoachDashboard />);
    expect(screen.getByText("Respecter les vitesses maximales")).toBeDefined();
    expect(screen.getByText("Fragile")).toBeDefined();
    expect(screen.getByText(/Manquée 2 fois/)).toBeDefined();
    // Peu de réponses ces 7 derniers jours : objectif plus bas proposé.
    const lower = screen.getByRole("button", { name: "Passer à 20 questions par jour" });
    await user.click(lower);
    expect(profileStore.get().dailyGoal).toBe(20);
  });

  it("résume le coach sur l’accueil", () => {
    render(<CoachSummaryCard />);
    expect(screen.getByRole("link", { name: /Votre coach/ }).getAttribute("href")).toBe("/coach");
    expect(screen.getByText(/Préparation : Pas assez de réponses pour estimer/)).toBeDefined();
  });
});
