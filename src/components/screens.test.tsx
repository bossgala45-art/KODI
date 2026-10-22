import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Onboarding } from "@/components/onboarding";
import { ProfileSettings } from "@/components/profile-settings";
import { ProgressDashboard } from "@/components/progress-dashboard";
import { historyStore } from "@/lib/history";
import { profileStore } from "@/lib/profile";
import { THEME_STORAGE_KEY } from "@/lib/theme";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/" }));

describe("Progression", () => {
  it("affiche un écran vide sans résultat", () => {
    render(<ProgressDashboard />);
    expect(screen.getByRole("heading", { name: "Pas encore de résultats" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Faire une première série" }).getAttribute("href")).toBe(
      "/entrainement",
    );
  });

  it("affiche les statistiques puis efface l’historique après confirmation", async () => {
    historyStore.set([
      {
        id: "s1",
        mode: "entrainement",
        finishedAt: new Date().toISOString(),
        correct: 4,
        total: 5,
        demo: true,
      },
    ]);
    const user = userEvent.setup();
    render(<ProgressDashboard />);

    expect(screen.getByText("80 %")).toBeDefined();
    expect(screen.getByText("5 / 20 questions")).toBeDefined();
    expect(screen.getByRole("note").textContent).toMatch(/questions fictives/);

    await user.click(screen.getByRole("button", { name: "Effacer l’historique" }));
    await user.click(screen.getByRole("button", { name: /Oui, tout effacer/ }));
    expect(historyStore.get()).toEqual([]);
    expect(screen.getByText("Historique effacé.")).toBeDefined();
  });
});

describe("Profil et paramètres", () => {
  it("enregistre le prénom et l’objectif quotidien", async () => {
    const user = userEvent.setup();
    render(<ProfileSettings />);
    await user.type(screen.getByLabelText("Prénom (facultatif)"), "  Inès ");
    await user.click(screen.getByRole("radio", { name: "40" }));
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(profileStore.get()).toMatchObject({ firstName: "Inès", dailyGoal: 40 });
    expect(screen.getByText("Profil enregistré")).toBeDefined();
  });

  it("change le thème et le mémorise", async () => {
    const user = userEvent.setup();
    render(<ProfileSettings />);
    await user.click(screen.getByRole("radio", { name: "Sombre" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("réduit les animations", async () => {
    const user = userEvent.setup();
    render(<ProfileSettings />);
    await user.click(screen.getByRole("radio", { name: "Réduites" }));
    expect(document.documentElement.dataset.motion).toBe("reduce");
  });

  it("réinitialise les données locales après confirmation", async () => {
    profileStore.set({ firstName: "Sam", dailyGoal: 10, onboardingCompleted: true });
    const user = userEvent.setup();
    render(<ProfileSettings />);
    expect(screen.getByDisplayValue("Sam")).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Réinitialiser les données locales" }));
    await user.click(screen.getByRole("button", { name: "Oui, tout réinitialiser" }));

    expect(profileStore.get().firstName).toBe("");
    expect(screen.getByLabelText("Prénom (facultatif)")).toHaveProperty("value", "");
    expect(screen.getByText("Données locales réinitialisées.")).toBeDefined();
  });
});

describe("Onboarding", () => {
  it("parcourt les quatre étapes et enregistre le profil", async () => {
    const user = userEvent.setup();
    render(<Onboarding />);
    expect(screen.getByText("Étape 1 sur 4")).toBeDefined();

    await user.click(screen.getByRole("button", { name: /Continuer/ }));
    await user.type(screen.getByLabelText("Prénom"), "Noé");
    await user.click(screen.getByRole("button", { name: /Continuer/ }));
    await user.click(screen.getByRole("radio", { name: "10" }));
    await user.click(screen.getByRole("button", { name: /Retour/ }));
    expect(screen.getByLabelText("Prénom")).toHaveProperty("value", "Noé");
    await user.click(screen.getByRole("button", { name: /Continuer/ }));
    await user.click(screen.getByRole("button", { name: /Continuer/ }));
    expect(screen.getByText("Étape 4 sur 4")).toBeDefined();
    await user.click(screen.getByRole("button", { name: /C’est parti/ }));

    expect(profileStore.get()).toEqual({
      firstName: "Noé",
      dailyGoal: 10,
      onboardingCompleted: true,
    });
    expect(push).toHaveBeenCalledWith("/");
  });

  it("peut être passé", async () => {
    const user = userEvent.setup();
    render(<Onboarding />);
    await user.click(screen.getByRole("button", { name: "Passer" }));
    expect(profileStore.get().onboardingCompleted).toBe(true);
  });
});
