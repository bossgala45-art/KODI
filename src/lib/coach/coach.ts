/**
 * Coach pédagogique de KODI : règles déterministes, sans IA.
 *
 * Tout est déduit de l'historique des réponses, des leçons terminées et des
 * examens : mêmes données, même conseil. Chaque recommandation est
 * accompagnée de sa raison, pour que la personne comprenne pourquoi.
 */
import { buildErrorLog } from "@/lib/pedagogy/error-log";
import { learnerState, type AnswerRecord } from "@/lib/pedagogy/history";
import type { MasteryEstimate, MasteryLevel } from "@/lib/pedagogy/mastery";
import { isDue } from "@/lib/pedagogy/scheduler";
import { DAILY_GOALS, type DailyGoal } from "@/lib/profile";
import { dayKey } from "@/lib/history";

const DAY_MS = 86_400_000;

export interface CoachCompetence {
  id: string;
  title: string;
  universeId: string;
}

export interface CoachLesson {
  id: string;
  title: string;
  href: string;
  /** Ordre dans le programme. */
  order: number;
  competenceIds: readonly string[];
  completed: boolean;
}

export interface CoachQuestion {
  id: string;
  competenceIds: readonly string[];
  /** Question validée par une personne compétente. */
  validated: boolean;
}

export interface ExamSession {
  finishedAt: string;
  correct: number;
  total: number;
}

export interface CoachInput {
  now: Date;
  history: readonly AnswerRecord[];
  competences: readonly CoachCompetence[];
  lessons: readonly CoachLesson[];
  questions: readonly CoachQuestion[];
  exams: readonly ExamSession[];
  dailyGoal: DailyGoal;
}

// ---------------------------------------------------------------------------
// Compétences faibles
// ---------------------------------------------------------------------------
export interface WeakCompetence {
  competence: CoachCompetence;
  estimate: MasteryEstimate;
}

const LEVEL_PRIORITY: Record<MasteryLevel, number> = { fragile: 0, "en-cours": 1, "non-evaluee": 2, maitrisee: 3 };

/** Compétences évaluées et non maîtrisées, les plus faibles d'abord. */
export function weakCompetences(
  competences: readonly CoachCompetence[],
  mastery: ReadonlyMap<string, MasteryEstimate>,
): WeakCompetence[] {
  return competences
    .flatMap((competence) => {
      const estimate = mastery.get(competence.id);
      return estimate && (estimate.level === "fragile" || estimate.level === "en-cours") ? [{ competence, estimate }] : [];
    })
    .sort(
      (a, b) =>
        LEVEL_PRIORITY[a.estimate.level] - LEVEL_PRIORITY[b.estimate.level] ||
        a.estimate.score - b.estimate.score ||
        a.competence.id.localeCompare(b.competence.id),
    );
}

// ---------------------------------------------------------------------------
// Prochaines leçons
// ---------------------------------------------------------------------------
export interface LessonRecommendation {
  lesson: CoachLesson;
  reason: string;
}

export function recommendLessons(
  lessons: readonly CoachLesson[],
  competences: readonly CoachCompetence[],
  mastery: ReadonlyMap<string, MasteryEstimate>,
  limit = 3,
): LessonRecommendation[] {
  const title = (id: string) => competences.find((c) => c.id === id)?.title ?? id;
  const levelOf = (id: string): MasteryLevel => mastery.get(id)?.level ?? "non-evaluee";
  const ranked = lessons.flatMap((lesson) => {
    const weakest = [...lesson.competenceIds].sort((a, b) => LEVEL_PRIORITY[levelOf(a)] - LEVEL_PRIORITY[levelOf(b)])[0];
    if (!weakest) return [];
    const level = levelOf(weakest);
    // Une leçon terminée n'est reproposée que si sa compétence reste fragile.
    if (lesson.completed && level !== "fragile") return [];
    const reason = lesson.completed
      ? `À revoir : « ${title(weakest)} » reste fragile.`
      : level === "fragile"
        ? `Renforce « ${title(weakest)} », encore fragile.`
        : level === "en-cours"
          ? `Consolide « ${title(weakest)} », en cours d’acquisition.`
          : level === "non-evaluee"
            ? `Découvre « ${title(weakest)} ».`
            : "Suite du programme.";
    return [{ lesson, reason, priority: LEVEL_PRIORITY[level] + (lesson.completed ? 0.5 : 0) }];
  });
  return ranked
    .sort((a, b) => a.priority - b.priority || a.lesson.order - b.lesson.order)
    .slice(0, limit)
    .map(({ lesson, reason }) => ({ lesson, reason }));
}

// ---------------------------------------------------------------------------
// Révisions espacées planifiées
// ---------------------------------------------------------------------------
export interface ReviewPlan {
  dueNow: number;
  /** Révisions prévues pour chacun des 7 prochains jours. */
  upcoming: Array<{ day: string; count: number }>;
}

export function reviewPlan(cards: ReadonlyMap<string, { dueAt: string }>, available: ReadonlySet<string>, now: Date): ReviewPlan {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i + 1);
    return dayKey(d);
  });
  const counts = new Map(days.map((d) => [d, 0]));
  let dueNow = 0;
  for (const [id, card] of cards) {
    if (!available.has(id)) continue;
    if (Date.parse(card.dueAt) <= now.getTime()) {
      dueNow += 1;
      continue;
    }
    const key = dayKey(new Date(card.dueAt));
    if (counts.has(key)) counts.set(key, counts.get(key)! + 1);
    // Plus tard aujourd'hui : compté avec les révisions du jour.
    else if (key === dayKey(now)) dueNow += 1;
  }
  return { dueNow, upcoming: days.map((day) => ({ day, count: counts.get(day)! })) };
}

// ---------------------------------------------------------------------------
// Examens récents
// ---------------------------------------------------------------------------
export const OFFICIAL_QUESTIONS = 40;
export const OFFICIAL_PASS_MARK = 35;

export interface ExamFollowUp {
  recent: ExamSession[];
  officialLast30: number;
  officialPassedLast30: number;
  /** Comparaison du dernier examen avec la moyenne des trois précédents. */
  trend: "hausse" | "baisse" | "stable" | null;
}

export function followExams(exams: readonly ExamSession[], now: Date): ExamFollowUp {
  const sorted = [...exams].sort((a, b) => Date.parse(b.finishedAt) - Date.parse(a.finishedAt));
  const since = now.getTime() - 30 * DAY_MS;
  const official = sorted.filter((e) => e.total === OFFICIAL_QUESTIONS && Date.parse(e.finishedAt) >= since);
  const ratio = (e: ExamSession) => e.correct / e.total;
  let trend: ExamFollowUp["trend"] = null;
  if (sorted.length >= 2) {
    const previous = sorted.slice(1, 4);
    const mean = previous.reduce((s, e) => s + ratio(e), 0) / previous.length;
    const diff = ratio(sorted[0]!) - mean;
    trend = diff > 0.05 ? "hausse" : diff < -0.05 ? "baisse" : "stable";
  }
  return {
    recent: sorted.slice(0, 5),
    officialLast30: official.length,
    officialPassedLast30: official.filter((e) => e.correct >= OFFICIAL_PASS_MARK).length,
    trend,
  };
}

// ---------------------------------------------------------------------------
// Objectif quotidien proposé
// ---------------------------------------------------------------------------
export interface GoalAdvice {
  current: DailyGoal;
  suggested: DailyGoal;
  reason: string;
}

/**
 * Règles, dans cet ordre :
 *  1. moins de la moitié de l'objectif réalisée en moyenne sur 7 jours :
 *     objectif inférieur (mieux vaut un objectif tenu) ;
 *  2. plus de révisions et d'erreurs en attente que l'objectif : supérieur ;
 *  3. sinon, objectif conservé.
 */
export function adviseDailyGoal(history: readonly AnswerRecord[], current: DailyGoal, workload: number, now: Date): GoalAdvice {
  // Les 7 journées calendaires précédant aujourd'hui.
  const previousDays = new Set(
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (i + 1));
      return dayKey(d);
    }),
  );
  const lastWeek = history.filter((r) => previousDays.has(dayKey(new Date(r.answeredAt)))).length;
  const average = lastWeek / 7;
  const index = DAILY_GOALS.indexOf(current);
  const lower = DAILY_GOALS[index - 1];
  const higher = DAILY_GOALS[index + 1];
  if (history.length > 0 && average < current / 2 && lower !== undefined) {
    return {
      current,
      suggested: lower,
      reason: `Ces 7 derniers jours : ${average.toFixed(1).replace(".", ",")} réponses par jour en moyenne. Un objectif de ${lower} questions est plus facile à tenir chaque jour.`,
    };
  }
  if (workload > current && higher !== undefined) {
    return {
      current,
      suggested: higher,
      reason: `${workload} révisions et erreurs vous attendent : un objectif de ${higher} questions permet de les rattraper.`,
    };
  }
  return { current, suggested: current, reason: "Votre objectif actuel correspond à votre rythme et à vos révisions." };
}

// ---------------------------------------------------------------------------
// Erreurs répétées
// ---------------------------------------------------------------------------
export interface RepeatedError {
  questionId: string;
  wrongCount: number;
  lastWrongAt: string;
}

export function repeatedErrors(history: readonly AnswerRecord[], available: ReadonlySet<string>, minimum = 2): RepeatedError[] {
  return buildErrorLog(history)
    .filter((e) => available.has(e.questionId) && e.wrongCount >= minimum)
    .sort((a, b) => b.wrongCount - a.wrongCount || Date.parse(b.lastWrongAt) - Date.parse(a.lastWrongAt))
    .map(({ questionId, wrongCount, lastWrongAt }) => ({ questionId, wrongCount, lastWrongAt }));
}

// ---------------------------------------------------------------------------
// Indicateur de préparation, volontairement prudent
// ---------------------------------------------------------------------------
export type ReadinessLevel = "donnees-insuffisantes" | "a-consolider" | "en-progres" | "proche" | "pret";

export const READINESS_LABELS: Record<ReadinessLevel, string> = {
  "donnees-insuffisantes": "Pas assez de réponses pour estimer",
  "a-consolider": "À consolider",
  "en-progres": "En progrès",
  proche: "Proche du niveau attendu",
  pret: "Prêt à tenter l’examen (estimation)",
};

export const READINESS_SETTINGS = {
  windowDays: 30,
  minAnswers: 50,
  /** Niveau attendu à l'examen : 35/40. */
  target: 35 / 40,
  minValidatedShare: 0.9,
} as const;

export interface Readiness {
  level: ReadinessLevel;
  label: string;
  /** Borne basse (95 %) du taux de bonnes réponses récent : estimation pessimiste. */
  lowerBound: number | null;
  answers: number;
  coverage: number;
  validatedShare: number;
  reasons: string[];
}

/** Borne basse de l'intervalle de Wilson à 95 %. */
export function wilsonLowerBound(successes: number, total: number, z = 1.96): number {
  if (total === 0) return 0;
  const p = successes / total;
  const z2 = z * z;
  return (p + z2 / (2 * total) - z * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total))) / (1 + z2 / total);
}

const percent = (x: number) => `${Math.round(x * 100)} %`;

export function readiness(input: {
  history: readonly AnswerRecord[];
  questions: readonly CoachQuestion[];
  competences: readonly CoachCompetence[];
  mastery: ReadonlyMap<string, MasteryEstimate>;
  exams: ExamFollowUp;
  now: Date;
}): Readiness {
  const s = READINESS_SETTINGS;
  const since = input.now.getTime() - s.windowDays * DAY_MS;
  const recent = input.history.filter((r) => Date.parse(r.answeredAt) >= since);
  const validated = new Set(input.questions.filter((q) => q.validated).map((q) => q.id));
  const n = recent.length;
  const coverage = input.competences.length
    ? input.competences.filter((c) => {
        const level = input.mastery.get(c.id)?.level;
        return level !== undefined && level !== "non-evaluee";
      }).length / input.competences.length
    : 0;
  const validatedShare = n ? recent.filter((r) => validated.has(r.questionId)).length / n : 0;
  const reasons: string[] = [];

  if (n < s.minAnswers) {
    reasons.push(`${n} réponse${n > 1 ? "s" : ""} ces ${s.windowDays} derniers jours : il en faut au moins ${s.minAnswers} pour une estimation.`);
    return { level: "donnees-insuffisantes", label: READINESS_LABELS["donnees-insuffisantes"], lowerBound: null, answers: n, coverage, validatedShare, reasons };
  }

  const lb = wilsonLowerBound(recent.filter((r) => r.correct).length, n);
  reasons.push(`Taux de bonnes réponses récent, estimation basse : ${percent(lb)} (l’examen demande ${percent(s.target)}).`);
  reasons.push(`Compétences déjà évaluées : ${percent(coverage)}.`);
  const { officialLast30, officialPassedLast30 } = input.exams;
  reasons.push(
    officialLast30
      ? `Examens officiels simulés ces 30 derniers jours : ${officialPassedLast30} réussi${officialPassedLast30 > 1 ? "s" : ""} sur ${officialLast30}.`
      : "Aucun examen officiel simulé ces 30 derniers jours.",
  );

  let level: ReadinessLevel;
  if (lb >= s.target && coverage >= 0.9 && officialLast30 >= 3 && officialPassedLast30 === officialLast30) level = "pret";
  else if (lb >= 0.8 && coverage >= 0.7 && officialLast30 >= 1) level = "proche";
  else if (lb >= 0.6) level = "en-progres";
  else level = "a-consolider";

  // Sans questions validées, l'indicateur ne peut pas annoncer plus qu'« En progrès ».
  if (validatedShare < s.minValidatedShare && (level === "pret" || level === "proche")) {
    level = "en-progres";
    reasons.push("La plupart des questions ne sont pas encore validées : l’indicateur est plafonné à « En progrès ».");
  }
  return { level, label: READINESS_LABELS[level], lowerBound: lb, answers: n, coverage, validatedShare, reasons };
}

// ---------------------------------------------------------------------------
// Rapport complet
// ---------------------------------------------------------------------------
export interface CoachReport {
  weak: WeakCompetence[];
  undiscovered: number;
  lessons: LessonRecommendation[];
  reviews: ReviewPlan;
  exams: ExamFollowUp;
  goal: GoalAdvice;
  repeatedErrors: RepeatedError[];
  readiness: Readiness;
  mastery: Map<string, MasteryEstimate>;
}

export function buildCoachReport(input: CoachInput): CoachReport {
  const available = new Set(input.questions.map((q) => q.id));
  const history = input.history.filter((r) => available.has(r.questionId));
  const { cards, mastery } = learnerState(history, input.now);
  const reviews = reviewPlan(cards, available, input.now);
  const errors = buildErrorLog(history);
  const exams = followExams(input.exams, input.now);
  const dueNow = [...cards.values()].filter((c) => isDue(c, input.now)).length;
  return {
    weak: weakCompetences(input.competences, mastery),
    undiscovered: input.competences.filter((c) => (mastery.get(c.id)?.level ?? "non-evaluee") === "non-evaluee").length,
    lessons: recommendLessons(input.lessons, input.competences, mastery),
    reviews,
    exams,
    goal: adviseDailyGoal(history, input.dailyGoal, dueNow + errors.length, input.now),
    repeatedErrors: repeatedErrors(history, available),
    readiness: readiness({ history, questions: input.questions, competences: input.competences, mastery, exams, now: input.now }),
    mastery,
  };
}
