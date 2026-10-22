import { describe, expect, it } from "vitest";
import {
  canSubmit,
  createQuiz,
  currentQuestion,
  goToNext,
  isAnswerCorrect,
  scoreQuiz,
  selectionOf,
  shuffle,
  submitAnswer,
  toggleChoice,
  type QuizQuestion,
} from "@/lib/quiz";

const single: QuizQuestion = {
  id: "q1",
  prompt: "Question à réponse unique",
  choices: [
    { id: "a", label: "A" },
    { id: "b", label: "B" },
  ],
  correct: ["b"],
  explanation: "",
};

const multiple: QuizQuestion = {
  id: "q2",
  prompt: "Question à réponses multiples",
  choices: [
    { id: "a", label: "A" },
    { id: "b", label: "B" },
    { id: "c", label: "C" },
  ],
  correct: ["a", "c"],
  explanation: "",
};

describe("quiz", () => {
  it("refuse un quiz vide", () => {
    expect(() => createQuiz([])).toThrow();
  });

  it("remplace la sélection pour une question à réponse unique", () => {
    let state = createQuiz([single]);
    state = toggleChoice(state, "a");
    state = toggleChoice(state, "b");
    expect(selectionOf(state, "q1")).toEqual(["b"]);
  });

  it("cumule les sélections pour une question à réponses multiples", () => {
    let state = createQuiz([multiple]);
    state = toggleChoice(state, "a");
    state = toggleChoice(state, "c");
    expect(selectionOf(state, "q2")).toEqual(["a", "c"]);
    state = toggleChoice(state, "a");
    expect(selectionOf(state, "q2")).toEqual(["c"]);
  });

  it("ignore une proposition inconnue", () => {
    const state = createQuiz([single]);
    expect(toggleChoice(state, "z")).toBe(state);
  });

  it("n’autorise la validation qu’avec une sélection", () => {
    let state = createQuiz([single]);
    expect(canSubmit(state)).toBe(false);
    expect(submitAnswer(state)).toBe(state);
    state = toggleChoice(state, "a");
    expect(canSubmit(state)).toBe(true);
  });

  it("verrouille la réponse une fois validée", () => {
    let state = submitAnswer(toggleChoice(createQuiz([single]), "a"));
    state = toggleChoice(state, "b");
    expect(selectionOf(state, "q1")).toEqual(["a"]);
    expect(canSubmit(state)).toBe(false);
  });

  it("n’avance qu’après validation et termine après la dernière question", () => {
    let state = createQuiz([single, multiple]);
    expect(goToNext(state)).toBe(state);
    state = goToNext(submitAnswer(toggleChoice(state, "b")));
    expect(currentQuestion(state).id).toBe("q2");
    state = goToNext(submitAnswer(toggleChoice(state, "a")));
    expect(state.finished).toBe(true);
  });

  it("exige exactement les bonnes réponses", () => {
    expect(isAnswerCorrect(multiple, ["a", "c"])).toBe(true);
    expect(isAnswerCorrect(multiple, ["c", "a"])).toBe(true);
    expect(isAnswerCorrect(multiple, ["a"])).toBe(false);
    expect(isAnswerCorrect(multiple, ["a", "b", "c"])).toBe(false);
    expect(isAnswerCorrect(single, [])).toBe(false);
  });

  it("calcule le score sur les réponses validées", () => {
    let state = createQuiz([single, multiple]);
    state = goToNext(submitAnswer(toggleChoice(state, "b")));
    state = goToNext(submitAnswer(toggleChoice(state, "a")));
    expect(scoreQuiz(state)).toEqual({ correct: 1, total: 2 });
  });

  it("mélange sans perdre ni dupliquer d’éléments", () => {
    const items = [1, 2, 3, 4, 5, 6];
    let seed = 0.42;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280 / 233280;
      return seed;
    };
    const result = shuffle(items, random);
    expect([...result].sort()).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
