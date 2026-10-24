/**
 * Gamification équilibrée : XP, niveaux, badges, défis quotidiens et séries
 * de révisions, calculés par des règles déterministes à partir de
 * l'historique (rien n'est stocké à part : impossible de diverger).
 *
 * Garde-fous contre les réponses au hasard :
 *  - une mauvaise réponse ne rapporte rien (et ne retire rien) ;
 *  - une même question ne rapporte qu'une fois par jour ;
 *  - les XP de réponse sont plafonnés par jour ;
 *  - si moins de 40 % des 10 dernières réponses sont justes, les XP de
 *    réponse sont suspendus (cliquer au hasard ne paie pas) ;
 *  - les récompenses les plus fortes suivent les critères pédagogiques :
 *    compétence maîtrisée, erreur corrigée, leçon terminée, examen réussi.
 * Niveaux et badges mesurent l'activité : ils ne remplacent jamais la
 * maîtrise ni l'indicateur de préparation, calculés à part.
 */
import { chronological, type AnswerRecord } from "@/lib/pedagogy/history";
import { estimateMastery, type MasteryAttempt } from "@/lib/pedagogy/mastery";
import { scheduleNext, type ReviewCard } from "@/lib/pedagogy/scheduler";
import { ERROR_LOG_RESOLVE_AFTER } from "@/lib/pedagogy/error-log";
import { dayKey } from "@/lib/history";

export const XP_RULES = {
  correctAnswer: 5,
  correctReview: 10,
  errorResolved: 20,
  competenceMastered: 100,
  lessonCompleted: 30,
  officialExamPassed: 50,
  challengeCompleted: 25,
  dailyAnswerCap: 150,
  guessWindow: 10,
  guessMinAccuracy: 0.4,
} as const;

export type XpReason =
  | "bonne-reponse"
  | "revision-reussie"
  | "erreur-corrigee"
  | "competence-maitrisee"
  | "lecon-terminee"
  | "examen-reussi"
  | "defi-releve";

export interface XpEvent {
  at: string;
  reason: XpReason;
  xp: number;
  /** Détail : question, compétence, leçon ou défi concerné. */
  ref: string;
  /** XP retenus par un garde-fou (au hasard, plafond). */
  withheld?: "hasard" | "plafond";
}

export interface RewardsCompetence {
  id: string;
  title: string;
  universeId: string;
}

export interface RewardsInput {
  history: readonly AnswerRecord[];
  now: Date;
  competences: readonly RewardsCompetence[];
  universeIds: readonly string[];
  /** Leçons terminées : identifiant → date. */
  completedLessons: Readonly<Record<string, string>>;
  /** Leçons restant à faire (pour proposer un défi). */
  openLessonCount: number;
  /** Examens remis (hors démonstration). */
  exams: ReadonlyArray<{ finishedAt: string; correct: number; total: number }>;
}

// ---------------------------------------------------------------------------
// Niveaux
// ---------------------------------------------------------------------------
/** XP cumulés nécessaires pour atteindre un niveau : 0, 100, 300, 600, 1000… */
export function xpForLevel(level: number): number {
  return 50 * (level - 1) * level;
}

export function levelOf(xp: number): { level: number; floor: number; next: number; progress: number } {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level += 1;
  const floor = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, floor, next, progress: (xp - floor) / (next - floor) };
}

// ---------------------------------------------------------------------------
// Défis quotidiens
// ---------------------------------------------------------------------------
export type ChallengeKind = "revisions" | "bonnes-reponses" | "erreurs" | "lecon" | "competence";

export interface Challenge {
  id: string;
  kind: ChallengeKind;
  title: string;
  target: number;
  progress: number;
  done: boolean;
  competenceId?: string;
}

interface DayStart {
  due: number;
  activeErrors: number;
  weakest: string | null;
}

/** Trois défis tirés de l'état au début de la journée (déterministe). */
export function challengesFor(start: DayStart, competences: readonly RewardsCompetence[], openLessons: number): Challenge[] {
  const list: Challenge[] = [];
  if (start.due > 0) {
    const target = Math.min(start.due, 10);
    list.push({ id: "revisions", kind: "revisions", title: `Faire ${target} révision${target > 1 ? "s" : ""} arrivée${target > 1 ? "s" : ""} à échéance`, target, progress: 0, done: false });
  } else {
    list.push({ id: "bonnes-reponses", kind: "bonnes-reponses", title: "Répondre juste à 5 questions différentes", target: 5, progress: 0, done: false });
  }
  if (start.activeErrors > 0) {
    const target = Math.min(start.activeErrors, 2);
    list.push({ id: "erreurs", kind: "erreurs", title: `Corriger ${target} erreur${target > 1 ? "s" : ""} du carnet`, target, progress: 0, done: false });
  } else if (openLessons > 0) {
    list.push({ id: "lecon", kind: "lecon", title: "Terminer une leçon", target: 1, progress: 0, done: false });
  }
  const weakest = competences.find((c) => c.id === start.weakest) ?? competences[0];
  if (weakest) {
    list.push({
      id: `competence-${weakest.id}`,
      kind: "competence",
      title: `Répondre juste à 3 questions sur « ${weakest.title} »`,
      target: 3,
      progress: 0,
      done: false,
      competenceId: weakest.id,
    });
  }
  return list;
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------
export interface Badge {
  id: string;
  title: string;
  criteria: string;
  earned: boolean;
  progress: number;
  target: number;
}

// ---------------------------------------------------------------------------
// Calcul complet, en un seul passage chronologique
// ---------------------------------------------------------------------------
export interface Rewards {
  events: XpEvent[];
  totalXp: number;
  level: ReturnType<typeof levelOf>;
  streak: { current: number; best: number; today: boolean };
  challenges: Challenge[];
  badges: Badge[];
  /** Les XP de réponse sont-ils suspendus à cet instant (réponses au hasard) ? */
  guessing: boolean;
  masteredCompetences: string[];
  resolvedErrors: number;
  reviewAnswers: number;
  dueNow: number;
}

function previousDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number) as [number, number, number];
  return dayKey(new Date(y, m - 1, d - 1));
}

export function computeRewards(input: RewardsInput): Rewards {
  const R = XP_RULES;
  const events: XpEvent[] = [];
  const cards = new Map<string, ReviewCard>();
  const attempts = new Map<string, MasteryAttempt[]>();
  const mastered = new Set<string>();
  const errors = new Map<string, number>(); // question → bonnes réponses depuis la dernière erreur
  const reviewDays = new Set<string>();
  const window: boolean[] = [];
  const answeredCorrect = new Set<string>(); // univers touchés avec succès
  let resolvedErrors = 0;
  let reviewAnswers = 0;

  let currentDay: string | null = null;
  let dayXp = 0;
  let dayRewarded = new Set<string>();
  let dayChallenges: Challenge[] = [];
  const dayCorrect = new Set<string>();

  const universeOf = new Map(input.competences.map((c) => [c.id, c.universeId]));
  const weakestNow = (at: Date): string | null => {
    let best: { id: string; score: number } | null = null;
    for (const c of input.competences) {
      const list = attempts.get(c.id);
      if (!list) continue;
      const e = estimateMastery(list, at);
      if (e.level === "non-evaluee" || e.level === "maitrisee") continue;
      if (!best || e.score < best.score) best = { id: c.id, score: e.score };
    }
    return best?.id ?? input.competences.find((c) => !attempts.has(c.id))?.id ?? null;
  };

  const closeDay = () => {
    for (const challenge of dayChallenges) {
      if (challenge.done) {
        events.push({ at: `${currentDay}T23:59:59`, reason: "defi-releve", xp: R.challengeCompleted, ref: challenge.id });
      }
    }
  };

  const lessonsByDay = new Map<string, number>();
  for (const at of Object.values(input.completedLessons)) {
    const key = dayKey(new Date(at));
    lessonsByDay.set(key, (lessonsByDay.get(key) ?? 0) + 1);
  }

  const openDay = (key: string, at: Date) => {
    currentDay = key;
    dayXp = 0;
    dayRewarded = new Set();
    dayCorrect.clear();
    const endOfDay = new Date(at);
    endOfDay.setHours(23, 59, 59, 999);
    const due = [...cards.values()].filter((c) => Date.parse(c.dueAt) <= endOfDay.getTime()).length;
    dayChallenges = challengesFor({ due, activeErrors: errors.size, weakest: weakestNow(at) }, input.competences, input.openLessonCount);
    const lessons = lessonsByDay.get(key) ?? 0;
    for (const c of dayChallenges) {
      if (c.kind === "lecon") {
        c.progress = Math.min(c.target, lessons);
        c.done = c.progress >= c.target;
      }
    }
  };

  const bump = (kind: ChallengeKind, competenceIds: readonly string[] = []) => {
    for (const c of dayChallenges) {
      if (c.done || c.kind !== kind) continue;
      if (kind === "competence" && !competenceIds.includes(c.competenceId ?? "")) continue;
      c.progress += 1;
      c.done = c.progress >= c.target;
    }
  };

  for (const record of chronological(input.history)) {
    const at = new Date(record.answeredAt);
    const key = dayKey(at);
    if (key !== currentDay) {
      if (currentDay) closeDay();
      openDay(key, at);
    }

    const card = cards.get(record.questionId);
    const isReview = Boolean(card && Date.parse(card.dueAt) <= at.getTime());
    if (isReview) {
      reviewAnswers += 1;
      reviewDays.add(key);
      bump("revisions");
    }

    // Garde-fou « au hasard » : précision des 10 dernières réponses.
    window.push(record.correct);
    if (window.length > R.guessWindow) window.shift();
    const guessing = window.length === R.guessWindow && window.filter(Boolean).length / window.length < R.guessMinAccuracy;

    if (record.correct && !dayRewarded.has(record.questionId)) {
      dayRewarded.add(record.questionId);
      const base = isReview ? R.correctReview : R.correctAnswer;
      const reason: XpReason = isReview ? "revision-reussie" : "bonne-reponse";
      if (guessing) events.push({ at: record.answeredAt, reason, xp: 0, ref: record.questionId, withheld: "hasard" });
      else {
        const xp = Math.max(0, Math.min(base, R.dailyAnswerCap - dayXp));
        dayXp += xp;
        events.push({ at: record.answeredAt, reason, xp, ref: record.questionId, ...(xp < base ? { withheld: "plafond" as const } : {}) });
      }
    }
    if (record.correct) {
      if (!dayCorrect.has(record.questionId)) {
        dayCorrect.add(record.questionId);
        bump("bonnes-reponses");
      }
      bump("competence", record.competenceIds);
      for (const c of record.competenceIds) {
        const u = universeOf.get(c);
        if (u) answeredCorrect.add(u);
      }
    }

    // Carnet d'erreurs : corrigée après 2 bonnes réponses de suite.
    if (!record.correct) errors.set(record.questionId, 0);
    else if (errors.has(record.questionId)) {
      const streak = errors.get(record.questionId)! + 1;
      if (streak >= ERROR_LOG_RESOLVE_AFTER) {
        errors.delete(record.questionId);
        resolvedErrors += 1;
        events.push({ at: record.answeredAt, reason: "erreur-corrigee", xp: R.errorResolved, ref: record.questionId });
        bump("erreurs");
      } else errors.set(record.questionId, streak);
    }

    // Maîtrise (réponses antérieures) pour la révision, puis mise à jour.
    const before = record.competenceIds
      .map((c) => attempts.get(c))
      .filter((l): l is MasteryAttempt[] => Boolean(l))
      .map((l) => estimateMastery(l, at))
      .filter((e) => e.level !== "non-evaluee")
      .map((e) => e.score);
    cards.set(record.questionId, scheduleNext(card ?? null, record.correct, at, before.length ? Math.min(...before) : null));
    for (const c of record.competenceIds) {
      const list = attempts.get(c) ?? [];
      list.push({ correct: record.correct, answeredAt: record.answeredAt });
      attempts.set(c, list);
      if (!mastered.has(c) && estimateMastery(list, at).level === "maitrisee") {
        mastered.add(c);
        events.push({ at: record.answeredAt, reason: "competence-maitrisee", xp: R.competenceMastered, ref: c });
      }
    }
  }

  const todayKey = dayKey(input.now);
  if (currentDay && currentDay !== todayKey) {
    closeDay();
    currentDay = null;
  }
  if (!currentDay) openDay(todayKey, input.now);
  const challenges = dayChallenges.map((c) => ({ ...c }));
  // Défis du jour : leurs XP sont comptés dès qu'ils sont relevés.
  for (const c of challenges) {
    if (c.done) events.push({ at: input.now.toISOString(), reason: "defi-releve", xp: R.challengeCompleted, ref: c.id });
  }

  for (const [id, at] of Object.entries(input.completedLessons)) {
    events.push({ at, reason: "lecon-terminee", xp: R.lessonCompleted, ref: id });
  }
  for (const exam of input.exams) {
    if (exam.total === 40 && exam.correct >= 35) {
      events.push({ at: exam.finishedAt, reason: "examen-reussi", xp: R.officialExamPassed, ref: exam.finishedAt });
    }
  }
  events.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));

  // Série de révisions : jours consécutifs avec au moins une révision à échéance.
  const today = reviewDays.has(todayKey);
  let current = 0;
  for (let key = today ? todayKey : previousDay(todayKey); reviewDays.has(key); key = previousDay(key)) current += 1;
  let best = 0;
  for (const key of reviewDays) {
    if (reviewDays.has(previousDay(key))) continue;
    let length = 0;
    for (let k = key; reviewDays.has(k); ) {
      length += 1;
      const [y, m, d] = k.split("-").map(Number) as [number, number, number];
      k = dayKey(new Date(y, m - 1, d + 1));
    }
    best = Math.max(best, length);
  }

  const dueNow = [...cards.values()].filter((c) => Date.parse(c.dueAt) <= input.now.getTime()).length;
  const totalXp = events.reduce((s, e) => s + e.xp, 0);
  const masteredNow = input.competences
    .filter((c) => {
      const list = attempts.get(c.id);
      return list && estimateMastery(list, input.now).level === "maitrisee";
    })
    .map((c) => c.id);
  const lessonsDone = Object.keys(input.completedLessons).length;
  const passedExams = input.exams.filter((e) => e.total === 40 && e.correct >= 35).length;
  const universeMastered = input.universeIds.some((u) => {
    const list = input.competences.filter((c) => c.universeId === u);
    return list.length > 0 && list.every((c) => masteredNow.includes(c.id));
  });

  const badge = (id: string, title: string, criteria: string, progress: number, target: number): Badge => ({
    id,
    title,
    criteria,
    progress: Math.min(progress, target),
    target,
    earned: progress >= target,
  });
  const badges: Badge[] = [
    badge("premiere-lecon", "Première leçon", "Terminer une leçon.", lessonsDone, 1),
    badge("erreur-corrigee", "Erreur corrigée", "Sortir une question du carnet d’erreurs (2 bonnes réponses de suite).", resolvedErrors, 1),
    badge("competence-maitrisee", "Compétence maîtrisée", "Atteindre le niveau « Maîtrisée » sur une compétence.", masteredNow.length, 1),
    badge("univers-maitrise", "Univers maîtrisé", "Maîtriser toutes les compétences d’un univers.", universeMastered ? 1 : 0, 1),
    badge("serie-7", "Régularité", "Réviser 7 jours de suite.", best, 7),
    badge("revisions-a-jour", "À jour", "Aucune révision en retard, après au moins 20 révisions.", dueNow === 0 ? Math.min(reviewAnswers, 20) : 0, 20),
    badge("examen-reussi", "Examen blanc réussi", "Obtenir au moins 35/40 à l’examen officiel simulé.", passedExams, 1),
    badge("explorateur", "Explorateur", "Répondre juste dans chacun des univers.", answeredCorrect.size, Math.max(1, input.universeIds.length)),
  ];

  const lastWindow = window.length === R.guessWindow && window.filter(Boolean).length / window.length < R.guessMinAccuracy;
  return {
    events,
    totalXp,
    level: levelOf(totalXp),
    streak: { current, best, today },
    challenges,
    badges,
    guessing: lastWindow,
    masteredCompetences: masteredNow,
    resolvedErrors,
    reviewAnswers,
    dueNow,
  };
}
