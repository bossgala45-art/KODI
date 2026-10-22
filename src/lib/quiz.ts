export interface QuizChoice {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: readonly QuizChoice[];
  /** Identifiants des bonnes réponses (une ou plusieurs). */
  correct: readonly string[];
  explanation: string;
}

export interface QuizState {
  questions: readonly QuizQuestion[];
  index: number;
  selections: Readonly<Record<string, readonly string[]>>;
  submitted: Readonly<Record<string, boolean>>;
  finished: boolean;
}

export function createQuiz(questions: readonly QuizQuestion[]): QuizState {
  if (questions.length === 0) {
    throw new Error("Un quiz doit contenir au moins une question.");
  }
  return { questions, index: 0, selections: {}, submitted: {}, finished: false };
}

export function currentQuestion(state: QuizState): QuizQuestion {
  const question = state.questions[state.index];
  if (!question) throw new Error("Index de question invalide.");
  return question;
}

export function isMultipleChoice(question: QuizQuestion): boolean {
  return question.correct.length > 1;
}

export function selectionOf(state: QuizState, questionId: string): readonly string[] {
  return state.selections[questionId] ?? [];
}

export function isSubmitted(state: QuizState, questionId: string): boolean {
  return state.submitted[questionId] === true;
}

/** Coche ou décoche une proposition de la question courante. */
export function toggleChoice(state: QuizState, choiceId: string): QuizState {
  const question = currentQuestion(state);
  if (state.finished || isSubmitted(state, question.id)) return state;
  if (!question.choices.some((choice) => choice.id === choiceId)) return state;

  const current = selectionOf(state, question.id);
  let next: string[];
  if (isMultipleChoice(question)) {
    next = current.includes(choiceId)
      ? current.filter((id) => id !== choiceId)
      : [...current, choiceId];
  } else {
    next = current.includes(choiceId) ? [] : [choiceId];
  }
  return { ...state, selections: { ...state.selections, [question.id]: next } };
}

export function canSubmit(state: QuizState): boolean {
  const question = currentQuestion(state);
  return (
    !state.finished &&
    !isSubmitted(state, question.id) &&
    selectionOf(state, question.id).length > 0
  );
}

/** Valide la réponse à la question courante. */
export function submitAnswer(state: QuizState): QuizState {
  if (!canSubmit(state)) return state;
  const question = currentQuestion(state);
  return { ...state, submitted: { ...state.submitted, [question.id]: true } };
}

export function isLastQuestion(state: QuizState): boolean {
  return state.index === state.questions.length - 1;
}

/** Passe à la question suivante, ou termine le quiz après la dernière. */
export function goToNext(state: QuizState): QuizState {
  if (!isSubmitted(state, currentQuestion(state).id)) return state;
  if (isLastQuestion(state)) return { ...state, finished: true };
  return { ...state, index: state.index + 1 };
}

export function isAnswerCorrect(
  question: QuizQuestion,
  selection: readonly string[],
): boolean {
  if (selection.length !== question.correct.length) return false;
  return question.correct.every((id) => selection.includes(id));
}

export interface QuizScore {
  correct: number;
  total: number;
}

export function scoreQuiz(state: QuizState): QuizScore {
  const correct = state.questions.filter(
    (question) =>
      isSubmitted(state, question.id) &&
      isAnswerCorrect(question, selectionOf(state, question.id)),
  ).length;
  return { correct, total: state.questions.length };
}

/** Mélange déterministe (Fisher-Yates) avec un générateur fourni. */
export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const a = copy[i] as T;
    copy[i] = copy[j] as T;
    copy[j] = a;
  }
  return copy;
}
