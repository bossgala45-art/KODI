import { describe, expect, it } from "vitest";
import {
  gradeAnswer,
  questionShapeErrors,
  validateSelection,
  type GradableQuestion,
} from "@/lib/pedagogy/grading";

const single: GradableQuestion = {
  id: "s",
  kind: "single",
  choices: [{ id: "a" }, { id: "b" }, { id: "c" }],
  correct: ["b"],
};

const multiple: GradableQuestion = {
  id: "m",
  kind: "multiple",
  choices: [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }],
  correct: ["a", "c"],
};

describe("correction — réponse unique", () => {
  it("juste avec la bonne proposition", () => {
    expect(gradeAnswer(single, ["b"])).toEqual({ correct: true, missed: [], wrong: [], expectedCount: 1 });
  });

  it("fausse avec une autre proposition, en indiquant l’oubli et l’erreur", () => {
    expect(gradeAnswer(single, ["a"])).toEqual({ correct: false, missed: ["b"], wrong: ["a"], expectedCount: 1 });
  });

  it("refuse plusieurs propositions", () => {
    expect(validateSelection(single, ["a", "b"])).toBe("too-many-for-single");
    expect(() => gradeAnswer(single, ["a", "b"])).toThrow(/too-many-for-single/);
  });
});

describe("correction — réponses multiples (tout ou rien)", () => {
  it("juste seulement si toutes les bonnes propositions sont cochées, et elles seules", () => {
    expect(gradeAnswer(multiple, ["a", "c"]).correct).toBe(true);
    expect(gradeAnswer(multiple, ["c", "a"]).correct).toBe(true);
  });

  it("fausse si une bonne proposition manque", () => {
    expect(gradeAnswer(multiple, ["a"])).toEqual({ correct: false, missed: ["c"], wrong: [], expectedCount: 2 });
  });

  it("fausse si une proposition en trop est cochée, même avec toutes les bonnes", () => {
    expect(gradeAnswer(multiple, ["a", "b", "c"])).toEqual({
      correct: false,
      missed: [],
      wrong: ["b"],
      expectedCount: 2,
    });
  });

  it("fausse si tout est coché", () => {
    const result = gradeAnswer(multiple, ["a", "b", "c", "d"]);
    expect(result.correct).toBe(false);
    expect(result.wrong).toEqual(["b", "d"]);
  });

  it("ignore les doublons dans la sélection", () => {
    expect(gradeAnswer(multiple, ["a", "a", "c"]).correct).toBe(true);
  });

  it("refuse une sélection vide ou une proposition inconnue", () => {
    expect(validateSelection(multiple, [])).toBe("empty");
    expect(validateSelection(multiple, ["z"])).toBe("unknown-choice");
  });
});

describe("cohérence des questions", () => {
  it("accepte des questions bien formées", () => {
    expect(questionShapeErrors(single)).toEqual([]);
    expect(questionShapeErrors(multiple)).toEqual([]);
  });

  it("détecte les incohérences de type et de réponses", () => {
    expect(questionShapeErrors({ ...single, correct: ["a", "b"] })).toContain(
      "une question à réponse unique doit avoir exactement une bonne réponse",
    );
    expect(questionShapeErrors({ ...multiple, correct: ["a"] })).toContain(
      "une question à réponses multiples doit avoir au moins deux bonnes réponses",
    );
    expect(questionShapeErrors({ ...multiple, correct: ["a", "z"] })).toContain("bonne réponse inconnue");
    expect(questionShapeErrors({ ...single, choices: [{ id: "b" }] })).toContain("au moins deux propositions");
    expect(
      questionShapeErrors({ id: "x", kind: "multiple", choices: [{ id: "a" }, { id: "b" }], correct: ["a", "b"] }),
    ).toContain("toutes les propositions ne peuvent pas être justes");
  });
});
