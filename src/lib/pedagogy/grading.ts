/**
 * Correction des réponses, uniques ou multiples.
 *
 * Règle (identique à l'examen blanc) : une réponse n'est juste que si
 * l'ensemble des propositions cochées est exactement l'ensemble des bonnes
 * propositions. Aucun point partiel ; le détail (oublis, erreurs) sert
 * seulement à l'explication.
 */

export type QuestionKind = "single" | "multiple";

export interface GradableQuestion {
  id: string;
  kind: QuestionKind;
  choices: ReadonlyArray<{ id: string }>;
  correct: readonly string[];
}

export type SelectionError = "empty" | "unknown-choice" | "too-many-for-single";

export interface GradeResult {
  correct: boolean;
  /** Bonnes propositions non cochées. */
  missed: string[];
  /** Propositions cochées à tort. */
  wrong: string[];
  /** Nombre de bonnes propositions attendues. */
  expectedCount: number;
}

export function uniqueSelection(selected: readonly string[]): string[] {
  return [...new Set(selected)];
}

export function validateSelection(
  question: GradableQuestion,
  selected: readonly string[],
): SelectionError | null {
  const unique = uniqueSelection(selected);
  if (unique.length === 0) return "empty";
  const known = new Set(question.choices.map((c) => c.id));
  if (unique.some((id) => !known.has(id))) return "unknown-choice";
  if (question.kind === "single" && unique.length > 1) return "too-many-for-single";
  return null;
}

/** Corrige une réponse valide (voir validateSelection). */
export function gradeAnswer(question: GradableQuestion, selected: readonly string[]): GradeResult {
  const error = validateSelection(question, selected);
  if (error) throw new Error(`Réponse invalide (${error}) pour la question ${question.id}`);
  const chosen = new Set(uniqueSelection(selected));
  const expected = new Set(question.correct);
  const missed = question.choices.map((c) => c.id).filter((id) => expected.has(id) && !chosen.has(id));
  const wrong = question.choices.map((c) => c.id).filter((id) => chosen.has(id) && !expected.has(id));
  return {
    correct: missed.length === 0 && wrong.length === 0,
    missed,
    wrong,
    expectedCount: expected.size,
  };
}

/** Cohérence d'une question : type, nombre de bonnes réponses, propositions connues. */
export function questionShapeErrors(question: GradableQuestion): string[] {
  const errors: string[] = [];
  const ids = question.choices.map((c) => c.id);
  if (new Set(ids).size !== ids.length) errors.push("identifiants de propositions en double");
  if (ids.length < 2) errors.push("au moins deux propositions");
  const correct = uniqueSelection(question.correct);
  if (correct.length !== question.correct.length) errors.push("bonne réponse en double");
  if (correct.some((id) => !ids.includes(id))) errors.push("bonne réponse inconnue");
  if (correct.length === 0) errors.push("aucune bonne réponse");
  if (question.kind === "single" && correct.length !== 1) errors.push("une question à réponse unique doit avoir exactement une bonne réponse");
  if (question.kind === "multiple" && correct.length < 2) errors.push("une question à réponses multiples doit avoir au moins deux bonnes réponses");
  if (correct.length >= ids.length) errors.push("toutes les propositions ne peuvent pas être justes");
  return errors;
}
