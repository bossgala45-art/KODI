/**
 * Vue d'ensemble de l'apprenant à un instant donné, déduite de l'historique :
 * maîtrise, cartes de révision, carnet d'erreurs et programme du jour.
 */
import { buildDailyPlan, type DailyPlan, type PlanQuestion } from "@/lib/pedagogy/daily-plan";
import { buildErrorLog, type ErrorEntry } from "@/lib/pedagogy/error-log";
import { answeredOn, learnerState, type AnswerRecord } from "@/lib/pedagogy/history";
import type { MasteryEstimate } from "@/lib/pedagogy/mastery";
import { isDue, type ReviewCard } from "@/lib/pedagogy/scheduler";

export interface TodayLesson {
  id: string;
  title: string;
  /** Ordre global dans le programme. */
  position: number;
}

export interface TodayInput {
  history: readonly AnswerRecord[];
  now: Date;
  dailyGoal: number;
  questions: readonly PlanQuestion[];
  lessons: readonly TodayLesson[];
  completedLessons: Readonly<Record<string, string>>;
}

export interface LearnerOverview {
  plan: DailyPlan;
  /** Série complète proposée même une fois l'objectif atteint. */
  extraPlan: DailyPlan;
  errorLog: ErrorEntry[];
  mastery: Map<string, MasteryEstimate>;
  cards: Map<string, ReviewCard>;
  /** Révisions arrivées à échéance (questions encore proposées). */
  dueCount: number;
  answeredToday: number;
}

export function learnerOverview(input: TodayInput): LearnerOverview {
  const available = new Set(input.questions.map((q) => q.id));
  const { cards, mastery } = learnerState(input.history, input.now);
  // Une question retirée du catalogue ne doit plus être proposée.
  const errorLog = buildErrorLog(input.history).filter((e) => available.has(e.questionId));
  const answeredToday = answeredOn(input.history, input.now);
  const base = {
    now: input.now,
    dailyGoal: input.dailyGoal,
    questions: input.questions,
    cards,
    errorLog,
    mastery,
    lessons: input.lessons.map((l) => ({ ...l, completed: Boolean(input.completedLessons[l.id]) })),
  };
  const plan = buildDailyPlan({ ...base, answeredToday });
  const extraPlan = buildDailyPlan({ ...base, answeredToday: 0 });
  const dueCount = [...cards.entries()].filter(([id, card]) => available.has(id) && isDue(card, input.now)).length;
  return { plan, extraPlan, errorLog, mastery, cards, dueCount, answeredToday };
}
