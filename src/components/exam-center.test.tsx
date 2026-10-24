import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExamWorkspace } from "@/components/exam-center";
import { validatedExamQuestionCount, type ExamAvailability, type ExamSummary } from "@/lib/exam/modes";
import type { ExamApi, ServerCorrection, ServerExam } from "@/lib/exam/server-exam";
import { historyStore } from "@/lib/history";

const ok = (required: number): ExamAvailability => ({ required, available: 45, unseen: 45, reason: null, target_refs: [] });

const exam: ServerExam = {
  id: "exam-1",
  mode: "express",
  status: "in_progress",
  question_count: 2,
  pass_mark: null,
  unseen_count: 2,
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
  mode: "express",
  score: 1,
  passed: null,
  question_count: 2,
  pass_mark: null,
  unseen_count: 2,
  items: [
    {
      ...exam.items[0]!,
      selected_choice_ids: ["a"],
      correct_choice_ids: ["a"],
      is_correct: true,
      explanation: "Car oui.",
      sources: [{ title: "Page officielle", url: "https://exemple.gouv.fr/a" }],
      competence_refs: ["c-priorite-intersection"],
    },
    {
      ...exam.items[1]!,
      selected_choice_ids: ["c"],
      correct_choice_ids: ["c", "e"],
      is_correct: false,
      explanation: "Deux réponses.",
      sources: [],
      competence_refs: ["c-vitesses"],
    },
  ],
  competences: [
    { competence_ref: "c-vitesses", title: "Respecter les vitesses maximales", correct: 0, total: 1 },
    { competence_ref: "c-priorite-intersection", title: "Appliquer les règles de priorité", correct: 1, total: 1 },
  ],
};

function fakeApi(overrides: Partial<ExamApi> = {}): ExamApi {
  return {
    availability: vi.fn().mockImplementation((mode: string) =>
      Promise.resolve(mode === "revanche" ? { ...ok(10), available: 0, reason: "KODI_NO_FAILED_COMPETENCES" } : ok(mode === "officiel" ? 40 : 10)),
    ),
    start: vi.fn().mockResolvedValue("exam-1"),
    history: vi.fn().mockResolvedValue([]),
    competenceStats: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue(exam),
    answer: vi.fn().mockResolvedValue(undefined),
    submit: vi.fn().mockResolvedValue({ mode: "express", score: 1, passed: null, question_count: 2, pass_mark: null }),
    correction: vi.fn().mockResolvedValue(correction),
    abandon: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("examens : accueil", () => {
  it("bloque un mode sans assez de questions validées, avec un message explicite", async () => {
    const api = fakeApi({
      availability: vi.fn().mockImplementation((mode: string) =>
        Promise.resolve({
          required: mode === "officiel" ? 40 : 10,
          available: 3,
          unseen: 3,
          reason: "KODI_NOT_ENOUGH_QUESTIONS",
          target_refs: [],
        }),
      ),
    });
    render(<ExamWorkspace api={api} />);
    expect(
      await screen.findByText(/Examen impossible pour le moment : 3 questions validées disponibles pour 40 nécessaires/),
    ).toBeDefined();
    const button = screen.getByRole("button", { name: /Lancer : examen officiel simulé/ }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(api.start).not.toHaveBeenCalled();
  });

  it("ouvre la revanche seulement après des erreurs", async () => {
    render(<ExamWorkspace api={fakeApi()} />);
    expect(await screen.findByText(/Aucune compétence ratée pour l’instant/)).toBeDefined();
    expect((screen.getByRole("button", { name: /Lancer : mode revanche/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("ciblé : demande des univers puis interroge le serveur sur leurs compétences", async () => {
    const api = fakeApi();
    const user = userEvent.setup();
    render(<ExamWorkspace api={api} />);
    expect(await screen.findByText("Cochez au moins un univers.")).toBeDefined();
    await user.click(screen.getByRole("checkbox", { name: "Règles de priorités" }));
    expect(api.availability).toHaveBeenCalledWith("cible", ["c-priorite-intersection", "c-vehicules-prioritaires"]);
    await user.click(await screen.findByRole("button", { name: /Lancer : examen ciblé/ }));
    expect(api.start).toHaveBeenCalledWith("cible", ["c-priorite-intersection", "c-vehicules-prioritaires"]);
  });

  it("propose de reprendre ou d’abandonner un examen en cours", async () => {
    const inProgress: ExamSummary = {
      id: "exam-1",
      mode: "officiel",
      status: "in_progress",
      question_count: 40,
      pass_mark: 35,
      score: null,
      passed: null,
      started_at: "2026-10-24T08:00:00Z",
      submitted_at: null,
    };
    const api = fakeApi({ history: vi.fn().mockResolvedValue([inProgress]) });
    const user = userEvent.setup();
    render(<ExamWorkspace api={api} />);
    expect(await screen.findByText("Examen en cours : Examen officiel simulé")).toBeDefined();
    expect((screen.getByRole("button", { name: /Lancer : examen express/ }) as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: "Reprendre" }));
    expect(api.get).toHaveBeenCalledWith("exam-1");
    expect(await screen.findByText("Question 1 sur 2")).toBeDefined();
  });

  it("affiche l’historique, les statistiques et les recommandations", async () => {
    const done = (score: number, passed: boolean, day: number): ExamSummary => ({
      id: `e${day}`,
      mode: "officiel",
      status: "submitted",
      question_count: 40,
      pass_mark: 35,
      score,
      passed,
      started_at: `2026-10-2${day}T08:00:00Z`,
      submitted_at: `2026-10-2${day}T08:30:00Z`,
    });
    const api = fakeApi({
      history: vi.fn().mockResolvedValue([done(36, true, 2), done(30, false, 1)]),
      competenceStats: vi.fn().mockResolvedValue(correction.competences),
    });
    render(<ExamWorkspace api={api} />);
    const section = within((await screen.findByRole("heading", { name: "Historique et statistiques" })).closest("section")!);
    expect(section.getByText("83 %")).toBeDefined();
    expect(section.getByText(/2 examens · meilleur 90 % · 1 réussi/)).toBeDefined();
    expect(section.getByText("36 / 40")).toBeDefined();
    expect(section.getByText("Réussi")).toBeDefined();
    expect(section.getByText("Échoué")).toBeDefined();
    expect(section.getByText(/0 \/ 1 \(0 %\) : sous les 87,5 %/)).toBeDefined();
  });
});

describe("examens : déroulé", () => {
  it("enregistre chaque réponse, ne montre le corrigé qu’après la remise, puis le bilan", async () => {
    historyStore.reset();
    const api = fakeApi();
    const user = userEvent.setup();
    render(<ExamWorkspace api={api} />);
    await user.click(await screen.findByRole("button", { name: /Lancer : examen express/ }));
    expect(api.start).toHaveBeenCalledWith("express", null);
    expect(screen.getByText("Question 1 sur 2")).toBeDefined();
    expect(screen.queryByText(/Bonne réponse/)).toBeNull();

    await user.click(screen.getByRole("radio", { name: /Oui/ }));
    await user.click(screen.getByRole("button", { name: "Valider" }));
    expect(api.answer).toHaveBeenCalledWith("exam-1", 1, ["a"]);

    expect(screen.getByText("2 réponses attendues.")).toBeDefined();
    await user.click(screen.getByRole("checkbox", { name: /Premier choix/ }));
    await user.click(screen.getByRole("button", { name: "Valider et terminer" }));
    expect(api.submit).toHaveBeenCalledWith("exam-1");

    expect(await screen.findByRole("heading", { name: "Examen express terminé" })).toBeDefined();
    expect(screen.getByText("1 / 2")).toBeDefined();
    expect(screen.getByText(/Repère : l’examen réel exige 35 bonnes réponses sur 40/)).toBeDefined();
    expect(screen.queryByText(/Réussi :|Échoué :/)).toBeNull();
    expect(screen.getByRole("heading", { name: "Bilan par compétence" })).toBeDefined();
    expect(screen.getByText(/Réviser : /)).toBeDefined();
    expect(screen.getByText("Bonne réponse : Premier choix, Troisième choix")).toBeDefined();
    expect(historyStore.get()[0]).toMatchObject({ mode: "simulation", correct: 1, total: 2, demo: false });
  });

  it("affiche réussi ou échoué uniquement pour le mode officiel", async () => {
    const official: ServerCorrection = { ...correction, mode: "officiel", pass_mark: 35, passed: false, question_count: 40, score: 34 };
    const api = fakeApi({ correction: vi.fn().mockResolvedValue(official), get: vi.fn().mockResolvedValue({ ...exam, items: [exam.items[0]!] }) });
    const user = userEvent.setup();
    render(<ExamWorkspace api={api} />);
    await user.click(await screen.findByRole("button", { name: /Lancer : examen officiel simulé/ }));
    await user.click(screen.getByRole("radio", { name: /Oui/ }));
    await user.click(screen.getByRole("button", { name: "Valider et terminer" }));
    expect(await screen.findByText("Échoué : il faut au moins 35 bonnes réponses sur 40")).toBeDefined();
  });

  it("garde la réponse et affiche l’erreur si l’enregistrement échoue", async () => {
    const api = fakeApi({ answer: vi.fn().mockRejectedValue(new TypeError("Failed to fetch")) });
    const user = userEvent.setup();
    render(<ExamWorkspace api={api} />);
    await user.click(await screen.findByRole("button", { name: /Lancer : examen express/ }));
    await user.click(screen.getByRole("radio", { name: /Oui/ }));
    await user.click(screen.getByRole("button", { name: "Valider" }));
    expect(await screen.findByText("Problème de connexion")).toBeDefined();
    expect((screen.getByRole("radio", { name: /Oui/ }) as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText("Question 1 sur 2")).toBeDefined();
  });

  it("annonce un refus du serveur au lancement", async () => {
    const api = fakeApi({ start: vi.fn().mockRejectedValue({ message: "KODI_NOT_ENOUGH_QUESTIONS", code: "P0001" }) });
    const user = userEvent.setup();
    render(<ExamWorkspace api={api} />);
    await user.click(await screen.findByRole("button", { name: /Lancer : examen express/ }));
    expect(await screen.findByText("Pas encore assez de questions validées pour composer un examen complet.")).toBeDefined();
  });
});

describe("questions validées du catalogue", () => {
  it("ne compte que les questions validées, prévues pour l’examen, hors démonstration", () => {
    expect(
      validatedExamQuestionCount([
        { status: "valide", examEligible: true, demo: false },
        { status: "valide", examEligible: false, demo: false },
        { status: "a-verifier", examEligible: true, demo: false },
        { status: "valide", examEligible: true, demo: true },
      ]),
    ).toBe(1);
  });
});
