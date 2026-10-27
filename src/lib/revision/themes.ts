/**
 * Banques de révision de l'édition personnelle (D-032) : les questions
 * réelles du catalogue (hors démonstration), regroupées par univers via
 * leurs compétences. Une question liée à plusieurs univers figure dans
 * chacun d'eux.
 */
export interface ThemedQuestion {
  competenceIds?: readonly string[];
}

export interface RevisionTheme<Q> {
  id: string;
  title: string;
  questions: readonly Q[];
}

export function groupByUniverse<Q extends ThemedQuestion>(
  questions: readonly Q[],
  universeOfCompetence: (competenceId: string) => string | undefined,
  universes: ReadonlyArray<{ id: string; title: string }>,
): RevisionTheme<Q>[] {
  return universes
    .map((universe) => ({
      id: universe.id,
      title: universe.title,
      questions: questions.filter((question) =>
        (question.competenceIds ?? []).some((id) => universeOfCompetence(id) === universe.id),
      ),
    }))
    .filter((theme) => theme.questions.length > 0);
}

/** Longueur d'une série : la longueur voulue, ou moins si la banque est plus petite. */
export function seriesLength(bankSize: number, wanted: number): number {
  return Math.max(0, Math.min(bankSize, wanted));
}
