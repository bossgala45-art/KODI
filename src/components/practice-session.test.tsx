import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StatusBadge } from "@/components/content-status";
import { PracticeSession } from "@/components/practice-session";
import type { PracticeQuestion } from "@/content/catalog";
import { answerHistoryStore } from "@/lib/pedagogy/history";

const questions: PracticeQuestion[] = [
  {
    id: "m1",
    kind: "multiple",
    prompt: "Question de test à réponses multiples ?",
    choices: [
      { id: "a", label: "Juste 1" },
      { id: "b", label: "Fausse" },
      { id: "c", label: "Juste 2" },
    ],
    correct: ["a", "c"],
    explanation: "Explication de test.",
    sources: [{ label: "Source de test", url: "https://exemple.test/source" }],
    competenceIds: ["c-test"],
    status: "brouillon",
    demo: true,
  },
  {
    id: "s1",
    kind: "single",
    prompt: "Question de test à réponse unique ?",
    choices: [
      { id: "a", label: "Oui" },
      { id: "b", label: "Non" },
    ],
    correct: ["b"],
    explanation: "Parce que non.",
    sources: [],
    competenceIds: ["c-test"],
    status: "a-verifier",
    demo: false,
  },
];

describe("séance d’entraînement du moteur", () => {
  it("détaille une réponse multiple incomplète, enregistre l’historique et termine la série", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<PracticeSession questions={questions} context="lesson" label="Avancement" onComplete={onComplete} />);

    expect(screen.getByText("Démonstration · non validé")).toBeTruthy();
    expect(screen.getByText("2 réponses attendues : cochez-les toutes.")).toBeTruthy();
    const validate = screen.getByRole("button", { name: "Valider" });
    expect((validate as HTMLButtonElement).disabled).toBe(true);

    await user.click(screen.getByRole("checkbox", { name: /Juste 1/ }));
    await user.click(screen.getByRole("checkbox", { name: /Fausse/ }));
    await user.click(validate);
    expect(screen.getByText("Ce n’est pas la bonne réponse.")).toBeTruthy();
    expect(screen.getByText("Bonne(s) réponse(s) oubliée(s) : C")).toBeTruthy();
    expect(screen.getByText("Cochée(s) à tort : B")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Demander au professeur" }).getAttribute("href")).toMatch(/^\/professeur\?question=/);
    expect(screen.getByRole("link", { name: /Source de test/ }).getAttribute("href")).toBe("https://exemple.test/source");

    await user.click(screen.getByRole("button", { name: /Question suivante/ }));
    expect(screen.getByText("À vérifier")).toBeTruthy();
    expect(screen.getByText("Une seule réponse attendue.")).toBeTruthy();
    await user.click(screen.getByRole("radio", { name: /Oui/ }));
    await user.click(screen.getByRole("radio", { name: /Non/ }));
    expect((screen.getByRole("radio", { name: /Oui/ }) as HTMLInputElement).checked).toBe(false);
    await user.click(screen.getByRole("button", { name: "Valider" }));
    expect(screen.getByText("Bonne réponse !")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Voir le bilan/ }));

    expect(screen.getByRole("heading", { name: "Série terminée" })).toBeTruthy();
    expect(screen.getByText("1 / 2")).toBeTruthy();
    expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 2 });
    const history = answerHistoryStore.get();
    expect(history.map((r) => [r.questionId, r.correct, r.context])).toEqual([
      ["m1", false, "lesson"],
      ["s1", true, "lesson"],
    ]);
    expect(history[0]?.selected).toEqual(["a", "b"]);
  });
});

describe("badge de statut", () => {
  it("affiche chaque statut, et toujours « non validé » pour une démonstration", () => {
    const { rerender } = render(<StatusBadge status="a-verifier" />);
    expect(screen.getByText("À vérifier")).toBeTruthy();
    rerender(<StatusBadge status="valide" />);
    expect(screen.getByText("Validé")).toBeTruthy();
    rerender(<StatusBadge status="brouillon" />);
    expect(screen.getByText("Brouillon · non validé")).toBeTruthy();
    rerender(<StatusBadge status="valide" demo />);
    expect(screen.getByText("Démonstration · non validé")).toBeTruthy();
  });
});
