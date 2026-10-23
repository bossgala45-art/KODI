/**
 * Maîtrise estimée par compétence, sans IA : moyenne bayésienne des réponses
 * (a priori Beta(1,1), soit 50 % sans information), où chaque réponse pèse
 * d'autant moins qu'elle est ancienne (demi-vie de 30 jours).
 *
 *   poids    w = 0,5 ^ (âge en jours / 30)
 *   score    = (1 + Σ w × juste) / (2 + Σ w)
 *   confiance = Σ w / (Σ w + 5)
 *
 * Le même calcul existe en SQL (migration « pedagogy ») : un test vérifie
 * que les deux donnent le même résultat.
 */

export const MASTERY_SETTINGS = {
  halfLifeDays: 30,
  priorCorrect: 1,
  priorTotal: 2,
  confidenceK: 5,
  /** En dessous, pas assez de réponses pour juger. */
  minAttempts: 3,
  masteredScore: 0.8,
  masteredConfidence: 0.5,
  fragileScore: 0.5,
} as const;

export type MasteryLevel = "non-evaluee" | "fragile" | "en-cours" | "maitrisee";

export interface MasteryAttempt {
  correct: boolean;
  answeredAt: string;
}

export interface MasteryEstimate {
  score: number;
  confidence: number;
  attempts: number;
  level: MasteryLevel;
  lastAnsweredAt: string | null;
}

const DAY_MS = 86_400_000;

export function attemptWeight(answeredAt: string, now: Date): number {
  const ageDays = Math.max(0, (now.getTime() - Date.parse(answeredAt)) / DAY_MS);
  return 0.5 ** (ageDays / MASTERY_SETTINGS.halfLifeDays);
}

export function masteryLevel(score: number, confidence: number, attempts: number): MasteryLevel {
  const s = MASTERY_SETTINGS;
  if (attempts < s.minAttempts) return "non-evaluee";
  if (score >= s.masteredScore && confidence >= s.masteredConfidence) return "maitrisee";
  if (score < s.fragileScore) return "fragile";
  return "en-cours";
}

export function estimateMastery(attempts: readonly MasteryAttempt[], now: Date): MasteryEstimate {
  const s = MASTERY_SETTINGS;
  let weight = 0;
  let weightedCorrect = 0;
  let last: string | null = null;
  for (const attempt of attempts) {
    const w = attemptWeight(attempt.answeredAt, now);
    weight += w;
    if (attempt.correct) weightedCorrect += w;
    if (!last || Date.parse(attempt.answeredAt) > Date.parse(last)) last = attempt.answeredAt;
  }
  const score = (s.priorCorrect + weightedCorrect) / (s.priorTotal + weight);
  const confidence = weight / (weight + s.confidenceK);
  return {
    score,
    confidence,
    attempts: attempts.length,
    level: masteryLevel(score, confidence, attempts.length),
    lastAnsweredAt: last,
  };
}

export interface CompetenceAttempt extends MasteryAttempt {
  competenceIds: readonly string[];
}

/** Maîtrise de chaque compétence : une réponse compte pour toutes les compétences de sa question. */
export function masteryByCompetence(
  history: readonly CompetenceAttempt[],
  now: Date,
): Map<string, MasteryEstimate> {
  const grouped = new Map<string, MasteryAttempt[]>();
  for (const record of history) {
    for (const competenceId of record.competenceIds) {
      const list = grouped.get(competenceId) ?? [];
      list.push(record);
      grouped.set(competenceId, list);
    }
  }
  const result = new Map<string, MasteryEstimate>();
  for (const [competenceId, attempts] of grouped) {
    result.set(competenceId, estimateMastery(attempts, now));
  }
  return result;
}

/** Maîtrise retenue pour une question : celle de sa compétence la plus faible. */
export function weakestScore(
  competenceIds: readonly string[],
  mastery: ReadonlyMap<string, MasteryEstimate>,
): number | null {
  const scores = competenceIds
    .map((id) => mastery.get(id))
    .filter((m): m is MasteryEstimate => m !== undefined && m.level !== "non-evaluee")
    .map((m) => m.score);
  return scores.length ? Math.min(...scores) : null;
}

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  "non-evaluee": "Pas encore évaluée",
  fragile: "Fragile",
  "en-cours": "En cours",
  maitrisee: "Maîtrisée",
};
