/**
 * Révisions espacées adaptatives (variante de SM-2), sans IA.
 *
 * Valeurs entières pour un résultat identique en TypeScript et en SQL :
 * facilité en centièmes (250 = 2,5), intervalle en dixièmes de jour.
 *
 * Bonne réponse :
 *   1re : 1 jour ; 2e : 3 jours ; ensuite intervalle × facilité ;
 *   facilité + 0,10 (plafond 3,00) ;
 *   adaptation à la maîtrise de la compétence la plus faible de la question :
 *   < 50 % → × 0,60 ; < 80 % → × 0,85 ; sinon × 1 (minimum 1 jour, plafond 180).
 * Erreur :
 *   série remise à zéro, facilité − 0,20 (plancher 1,30), nouvelle
 *   présentation 10 minutes plus tard.
 */

export const SCHEDULER_SETTINGS = {
  initialEase: 250,
  minEase: 130,
  maxEase: 300,
  easeBonus: 10,
  easePenalty: 20,
  firstIntervalTenths: 10,
  secondIntervalTenths: 30,
  minIntervalTenths: 10,
  maxIntervalTenths: 1800,
  relearnMinutes: 10,
} as const;

export interface ReviewCard {
  /** Facilité × 100. */
  ease: number;
  /** Intervalle en dixièmes de jour (0 après une erreur). */
  intervalTenths: number;
  /** Bonnes réponses consécutives. */
  repetitions: number;
  /** Nombre d'erreurs. */
  lapses: number;
  dueAt: string;
  lastAnsweredAt: string;
}

const TENTH_OF_DAY_MS = 8_640_000;
const MINUTE_MS = 60_000;

/** Facteur d'adaptation (en %) selon la maîtrise, null si inconnue. */
export function masteryFactor(mastery: number | null): number {
  if (mastery === null) return 100;
  if (mastery < 0.5) return 60;
  if (mastery < 0.8) return 85;
  return 100;
}

export function scheduleNext(
  previous: ReviewCard | null,
  correct: boolean,
  answeredAt: Date,
  mastery: number | null = null,
): ReviewCard {
  const s = SCHEDULER_SETTINGS;
  const ease = previous?.ease ?? s.initialEase;
  const repetitions = previous?.repetitions ?? 0;
  const lapses = previous?.lapses ?? 0;
  const now = answeredAt.getTime();

  if (!correct) {
    return {
      ease: Math.max(ease - s.easePenalty, s.minEase),
      intervalTenths: 0,
      repetitions: 0,
      lapses: lapses + 1,
      dueAt: new Date(now + s.relearnMinutes * MINUTE_MS).toISOString(),
      lastAnsweredAt: answeredAt.toISOString(),
    };
  }

  const nextRepetitions = repetitions + 1;
  const base =
    nextRepetitions === 1
      ? s.firstIntervalTenths
      : nextRepetitions === 2
        ? s.secondIntervalTenths
        : Math.round((Math.max(previous?.intervalTenths ?? 0, s.minIntervalTenths) * ease) / 100);
  const adapted = Math.round((base * masteryFactor(mastery)) / 100);
  const intervalTenths = Math.min(Math.max(adapted, s.minIntervalTenths), s.maxIntervalTenths);

  return {
    ease: Math.min(ease + s.easeBonus, s.maxEase),
    intervalTenths,
    repetitions: nextRepetitions,
    lapses,
    dueAt: new Date(now + intervalTenths * TENTH_OF_DAY_MS).toISOString(),
    lastAnsweredAt: answeredAt.toISOString(),
  };
}

export function isDue(card: ReviewCard, now: Date): boolean {
  return Date.parse(card.dueAt) <= now.getTime();
}

export function intervalInDays(card: ReviewCard): number {
  return card.intervalTenths / 10;
}
