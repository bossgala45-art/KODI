/**
 * Programme quotidien personnalisé, sans IA : des règles simples et
 * déterministes, appliquées dans cet ordre de priorité.
 *
 *  1. Carnet d'erreurs (au plus 30 % du programme).
 *  2. Révisions arrivées à échéance aujourd'hui, les plus en retard d'abord.
 *  3. Questions nouvelles des compétences les plus faibles.
 *  4. Prochaine leçon non terminée (en plus des questions).
 *
 * Le nombre de questions est l'objectif quotidien moins les réponses déjà
 * données aujourd'hui.
 */
import type { ErrorEntry } from "@/lib/pedagogy/error-log";
import type { MasteryEstimate } from "@/lib/pedagogy/mastery";
import type { ReviewCard } from "@/lib/pedagogy/scheduler";

export interface PlanQuestion {
  id: string;
  competenceIds: readonly string[];
}

export interface PlanLesson {
  id: string;
  title: string;
  position: number;
  completed: boolean;
}

export interface DailyPlanInput {
  now: Date;
  dailyGoal: number;
  answeredToday: number;
  questions: readonly PlanQuestion[];
  cards: ReadonlyMap<string, ReviewCard>;
  errorLog: readonly ErrorEntry[];
  mastery: ReadonlyMap<string, MasteryEstimate>;
  lessons: readonly PlanLesson[];
}

export type PlanReason = "erreur" | "revision" | "competence-faible";

export interface PlanItem {
  questionId: string;
  reason: PlanReason;
}

export interface DailyPlan {
  budget: number;
  items: PlanItem[];
  lesson: PlanLesson | null;
  /** Objectif du jour déjà atteint. */
  goalReached: boolean;
}

export const ERROR_SHARE = 0.3;

function endOfDay(now: Date): number {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end.getTime();
}

/** Score de priorité d'une compétence : non évaluée ≈ 0,5 ; plus bas = plus faible. */
function competenceScore(id: string, mastery: ReadonlyMap<string, MasteryEstimate>): number {
  const m = mastery.get(id);
  return m && m.level !== "non-evaluee" ? m.score : 0.5;
}

export function buildDailyPlan(input: DailyPlanInput): DailyPlan {
  const budget = Math.max(0, input.dailyGoal - input.answeredToday);
  const available = new Set(input.questions.map((q) => q.id));
  const items: PlanItem[] = [];
  const taken = new Set<string>();
  const add = (questionId: string, reason: PlanReason) => {
    if (items.length >= budget || taken.has(questionId) || !available.has(questionId)) return;
    taken.add(questionId);
    items.push({ questionId, reason });
  };

  // 1. Carnet d'erreurs.
  const errorQuota = Math.ceil(budget * ERROR_SHARE);
  for (const entry of input.errorLog) {
    if (items.length >= errorQuota) break;
    add(entry.questionId, "erreur");
  }

  // 2. Révisions dues avant la fin de la journée.
  const limit = endOfDay(input.now);
  [...input.cards.entries()]
    .filter(([, card]) => Date.parse(card.dueAt) <= limit)
    .sort(([idA, a], [idB, b]) => Date.parse(a.dueAt) - Date.parse(b.dueAt) || idA.localeCompare(idB))
    .forEach(([questionId]) => add(questionId, "revision"));

  // 3. Questions jamais vues, compétences les plus faibles d'abord.
  input.questions
    .filter((q) => !input.cards.has(q.id))
    .map((q) => ({
      q,
      score: q.competenceIds.length
        ? Math.min(...q.competenceIds.map((id) => competenceScore(id, input.mastery)))
        : 0.5,
    }))
    .sort((a, b) => a.score - b.score || a.q.id.localeCompare(b.q.id))
    .forEach(({ q }) => add(q.id, "competence-faible"));

  const lesson =
    [...input.lessons].sort((a, b) => a.position - b.position).find((l) => !l.completed) ?? null;

  return { budget, items, lesson, goalReached: budget === 0 };
}
