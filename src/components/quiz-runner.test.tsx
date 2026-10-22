import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuizRunner } from "@/components/quiz-runner";
import { historyStore } from "@/lib/history";
import type { QuizQuestion } from "@/lib/quiz";

const questions: QuizQuestion[] = [
  {
    id: "t1",
    prompt: "Première question fictive",
    choices: [
      { id: "a", label: "Réponse juste" },
      { id: "b", label: "Réponse fausse" },
    ],
    correct: ["a"],
    explanation: "Explication fictive 1.",
  },
  {
    id: "t2",
    prompt: "Deuxième question fictive",
    choices: [
      { id: "a", label: "Vrai 1" },
      { id: "b", label: "Faux" },
      { id: "c", label: "Vrai 2" },
    ],
    correct: ["a", "c"],
    explanation: "Explication fictive 2.",
  },
];

function setup(mode: "entrainement" | "simulation") {
  const onExit = vi.fn();
  const onRestart = vi.fn();
  render(<QuizRunner questions={questions} mode={mode} onExit={onExit} onRestart={onRestart} />);
  return { user: userEvent.setup(), onExit, onRestart };
}

describe("QuizRunner — entraînement", () => {
  it("signale les données fictives et active Valider après une sélection", async () => {
    const { user } = setup("entrainement");
    expect(screen.getByText("Données fictives")).toBeDefined();
    const validate = screen.getByRole("button", { name: "Valider" });
    expect(validate).toHaveProperty("disabled", true);
    await user.click(screen.getByRole("radio", { name: /Réponse juste/ }));
    expect(validate).toHaveProperty("disabled", false);
  });

  it("affiche la correction, enchaîne et enregistre le résultat", async () => {
    const { user } = setup("entrainement");

    await user.click(screen.getByRole("radio", { name: /Réponse fausse/ }));
    await user.click(screen.getByRole("button", { name: "Valider" }));
    expect(screen.getByText("Ce n’est pas la bonne réponse.")).toBeDefined();
    expect(screen.getByText("Explication fictive 1.")).toBeDefined();
    // Réponse verrouillée : le fieldset désactivé désactive ses propositions.
    expect(screen.getByRole("radio", { name: /Réponse juste/ }).matches(":disabled")).toBe(true);

    await user.click(screen.getByRole("button", { name: /Question suivante/ }));
    expect(screen.getByText("Plusieurs réponses possibles.")).toBeDefined();
    await user.click(screen.getByRole("checkbox", { name: /Vrai 1/ }));
    await user.click(screen.getByRole("checkbox", { name: /Vrai 2/ }));
    await user.click(screen.getByRole("button", { name: "Valider" }));
    expect(screen.getByText("Bonne réponse !")).toBeDefined();

    await user.click(screen.getByRole("button", { name: /Voir le résultat/ }));
    expect(screen.getByRole("heading", { name: "Série terminée" })).toBeDefined();
    expect(screen.getByText("1 / 2")).toBeDefined();

    const history = historyStore.get();
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ mode: "entrainement", correct: 1, total: 2, demo: true });
  });

  it("permet de quitter la série", async () => {
    const { user, onExit } = setup("entrainement");
    await user.click(screen.getByRole("button", { name: "Quitter" }));
    expect(onExit).toHaveBeenCalledOnce();
    expect(historyStore.get()).toHaveLength(0);
  });
});

describe("QuizRunner — simulation", () => {
  it("ne corrige qu’à la fin puis affiche le corrigé", async () => {
    const { user, onRestart } = setup("simulation");

    await user.click(screen.getByRole("radio", { name: /Réponse juste/ }));
    await user.click(screen.getByRole("button", { name: "Valider" }));
    expect(screen.queryByText("Bonne réponse !")).toBeNull();
    expect(screen.getByText("Deuxième question fictive")).toBeDefined();

    await user.click(screen.getByRole("checkbox", { name: /Vrai 1/ }));
    await user.click(screen.getByRole("button", { name: "Valider et terminer" }));

    expect(screen.getByRole("heading", { name: "Examen blanc terminé" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Corrigé" })).toBeDefined();
    expect(screen.getByText("Votre réponse : Vrai 1")).toBeDefined();
    expect(historyStore.get()[0]).toMatchObject({ mode: "simulation", correct: 1, total: 2 });

    await user.click(screen.getByRole("button", { name: /Recommencer/ }));
    expect(onRestart).toHaveBeenCalledOnce();
  });
});
