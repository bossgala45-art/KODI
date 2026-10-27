import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AuthState } from "@/lib/auth/session-store";
import type { QuizQuestion } from "@/lib/quiz";

let state: AuthState = { status: "local" };
vi.mock("@/lib/auth/session-store", () => ({ useAuth: () => state }));

const { ExamCenter } = await import("@/components/exam-center");

const bank: QuizQuestion[] = Array.from({ length: 40 }, (_, i) => ({
  id: `q${i}`,
  prompt: `Question ${i} ?`,
  choices: [
    { id: "a", label: "Oui" },
    { id: "b", label: "Non" },
  ],
  correct: ["a"],
  explanation: "Parce que.",
}));

describe("examens sans serveur (édition personnelle)", () => {
  it("propose l’examen officiel simulé et l’examen express sur cet appareil", () => {
    state = { status: "local" };
    render(<ExamCenter validated={0} bank={bank} />);
    expect(screen.getByRole("heading", { name: "Examens blancs sur cet appareil" })).toBeDefined();
    expect(screen.getByRole("button", { name: /Lancer : Examen officiel simulé/ })).toBeDefined();
    expect(screen.getByRole("button", { name: /Lancer : Examen express/ })).toBeDefined();
    expect(screen.queryByRole("heading", { name: "Examens enregistrés sur votre compte" })).toBeNull();
  });

  it("lance un examen de 40 questions sans correction avant la fin", async () => {
    state = { status: "signed-out" };
    render(<ExamCenter validated={0} bank={bank} />);
    await userEvent.click(screen.getByRole("button", { name: /Lancer : Examen officiel simulé/ }));
    expect(screen.getByText("Question 1 sur 40")).toBeDefined();
    await userEvent.click(screen.getByText("Oui"));
    await userEvent.click(screen.getByRole("button", { name: "Valider" }));
    expect(screen.getByText("Question 2 sur 40")).toBeDefined();
    expect(screen.queryByText("Bonne réponse !")).toBeNull();
  });

  it("signale une banque trop petite au lieu de lancer un examen incomplet", () => {
    state = { status: "local" };
    render(<ExamCenter validated={0} bank={bank.slice(0, 12)} />);
    expect(screen.getByText("Pas assez de questions : 12 / 40.")).toBeDefined();
    expect(screen.getByRole("button", { name: /Lancer : Examen express/ })).toBeDefined();
  });
});
