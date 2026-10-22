import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ServerExamRunner } from "@/components/server-exam";
import type { ExamApi, ServerCorrection, ServerExam } from "@/lib/exam/server-exam";
import { historyStore } from "@/lib/history";

const exam: ServerExam = {
  id: "exam-1",
  status: "in_progress",
  question_count: 2,
  pass_mark: 2,
  score: null,
  passed: null,
  items: [
    {
      position: 1,
      question_id: "q1",
      prompt: "Première question validée ?",
      answer_count: 1,
      selected_choice_ids: null,
      choices: [
        { id: "a", label: "Oui" },
        { id: "b", label: "Non" },
      ],
    },
    {
      position: 2,
      question_id: "q2",
      prompt: "Deuxième question validée ?",
      answer_count: 2,
      selected_choice_ids: null,
      choices: [
        { id: "c", label: "Premier choix" },
        { id: "d", label: "Deuxième choix" },
        { id: "e", label: "Troisième choix" },
      ],
    },
  ],
};

const correction: ServerCorrection = {
  id: "exam-1",
  score: 1,
  passed: false,
  question_count: 2,
  pass_mark: 2,
  items: [
    { ...exam.items[0]!, selected_choice_ids: ["a"], correct_choice_ids: ["a"], is_correct: true, explanation: "Car oui.", sources: [{ title: "Page officielle", url: "https://exemple.gouv.fr/a" }] },
    { ...exam.items[1]!, selected_choice_ids: ["c"], correct_choice_ids: ["c", "e"], is_correct: false, explanation: "Deux réponses.", sources: [] },
  ],
};

function fakeApi(overrides: Partial<ExamApi> = {}): ExamApi {
  return {
    start: vi.fn().mockResolvedValue("exam-1"),
    get: vi.fn().mockResolvedValue(exam),
    answer: vi.fn().mockResolvedValue(undefined),
    submit: vi.fn().mockResolvedValue({ score: 1, passed: false, question_count: 2, pass_mark: 2 }),
    correction: vi.fn().mockResolvedValue(correction),
    abandon: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("examen blanc côté serveur", () => {
  it("déroule l’examen et n’affiche le corrigé qu’après la remise", async () => {
    const api = fakeApi();
    const user = userEvent.setup();
    render(<ServerExamRunner api={api} onUseLocal={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /Lancer l’examen blanc/ }));
    expect(screen.getByText("Question 1 sur 2")).toBeDefined();
    expect(screen.queryByText(/Bonne réponse/)).toBeNull();

    await user.click(screen.getByRole("radio", { name: /Oui/ }));
    await user.click(screen.getByRole("button", { name: "Valider" }));
    expect(api.answer).toHaveBeenCalledWith("exam-1", 1, ["a"]);

    expect(screen.getByText("2 réponses attendues.")).toBeDefined();
    await user.click(screen.getByRole("checkbox", { name: /Premier choix/ }));
    expect(api.correction).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Valider et terminer" }));

    expect(api.submit).toHaveBeenCalledWith("exam-1");
    expect(screen.getByText("Échoué : il faut au moins 2 bonnes réponses")).toBeDefined();
    expect(screen.getByText("Bonne réponse : Premier choix, Troisième choix")).toBeDefined();
    expect(screen.getByRole("link", { name: /Page officielle/ }).getAttribute("href")).toBe("https://exemple.gouv.fr/a");
    expect(historyStore.get()[0]).toMatchObject({ mode: "simulation", correct: 1, total: 2, demo: false });
  });

  it("garde la réponse et propose de réessayer en cas de coupure réseau", async () => {
    const api = fakeApi({
      answer: vi
        .fn()
        .mockRejectedValueOnce(new TypeError("Failed to fetch"))
        .mockResolvedValueOnce(undefined),
    });
    const user = userEvent.setup();
    render(<ServerExamRunner api={api} onUseLocal={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /Lancer l’examen blanc/ }));
    await user.click(screen.getByRole("radio", { name: /Oui/ }));
    await user.click(screen.getByRole("button", { name: "Valider" }));

    expect(screen.getByText("Problème de connexion")).toBeDefined();
    expect(screen.getByText("Question 1 sur 2")).toBeDefined();
    expect(screen.getByRole("radio", { name: /Oui/ })).toHaveProperty("checked", true);

    await user.click(screen.getByRole("button", { name: "Valider" }));
    expect(screen.getByText("Question 2 sur 2")).toBeDefined();
  });

  it("reprend un examen en cours à la première question sans réponse", async () => {
    const resumed = { ...exam, items: [{ ...exam.items[0]!, selected_choice_ids: ["b"] }, exam.items[1]!] };
    const user = userEvent.setup();
    render(<ServerExamRunner api={fakeApi({ get: vi.fn().mockResolvedValue(resumed) })} onUseLocal={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /Lancer l’examen blanc/ }));
    expect(screen.getByText("Question 2 sur 2")).toBeDefined();
  });

  it("propose l’examen local s’il n’y a pas assez de questions validées", async () => {
    const onUseLocal = vi.fn();
    const api = fakeApi({ start: vi.fn().mockRejectedValue({ message: "KODI_NOT_ENOUGH_QUESTIONS", code: "P0001" }) });
    const user = userEvent.setup();
    render(<ServerExamRunner api={api} onUseLocal={onUseLocal} />);
    await user.click(screen.getByRole("button", { name: /Lancer l’examen blanc/ }));
    expect(screen.getByText("Pas encore assez de questions validées")).toBeDefined();
    await user.click(screen.getByRole("button", { name: /questions non relues/ }));
    expect(onUseLocal).toHaveBeenCalledOnce();
  });
});
