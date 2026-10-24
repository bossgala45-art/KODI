import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AuthState } from "@/lib/auth/session-store";

let state: AuthState = { status: "local" };
vi.mock("@/lib/auth/session-store", () => ({ useAuth: () => state }));

const { ExamCenter } = await import("@/components/exam-center");

describe("examens selon le compte", () => {
  it("sans serveur : explique pourquoi aucun examen n’est possible", () => {
    state = { status: "local" };
    render(<ExamCenter validated={0} />);
    expect(screen.getByText("Examens pas encore disponibles")).toBeDefined();
    expect(screen.getAllByText(/Questions validées dans le catalogue : 0 \//)).toHaveLength(3);
    expect(screen.queryByRole("button", { name: /Lancer/ })).toBeNull();
  });

  it("déconnecté : invite à se connecter puis à revenir sur Simuler", () => {
    state = { status: "signed-out" };
    render(<ExamCenter validated={12} />);
    expect(screen.getByText("Connectez-vous pour passer un examen")).toBeDefined();
    expect(screen.getByRole("link", { name: "Se connecter" }).getAttribute("href")).toBe("/connexion?next=/simuler");
    expect(screen.getByText("Questions validées dans le catalogue : 12 / 40 nécessaires")).toBeDefined();
  });
});
