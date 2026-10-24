/**
 * Modes d'examen, disponibilité, statistiques et recommandations.
 * Le tirage et la correction sont faits par le serveur (migration
 * « exam_modes ») ; ce module ne fait que présenter les résultats.
 */

export type ExamModeId = "officiel" | "express" | "cible" | "revanche";

export interface ExamMode {
  id: ExamModeId;
  title: string;
  questionCount: number;
  /** Seuil de réussite : seulement pour le format officiel (35/40, vérifié). */
  passMark: number | null;
  summary: string;
}

export const EXAM_MODES: Record<ExamModeId, ExamMode> = {
  officiel: {
    id: "officiel",
    title: "Examen officiel simulé",
    questionCount: 40,
    passMark: 35,
    summary: "40 questions, réussi à partir de 35 bonnes réponses.",
  },
  express: {
    id: "express",
    title: "Examen express",
    questionCount: 10,
    passMark: null,
    summary: "10 questions pour faire le point rapidement.",
  },
  cible: {
    id: "cible",
    title: "Examen ciblé",
    questionCount: 20,
    passMark: null,
    summary: "20 questions sur les univers de votre choix.",
  },
  revanche: {
    id: "revanche",
    title: "Mode revanche",
    questionCount: 10,
    passMark: null,
    summary: "10 questions sur les compétences où vous avez commis des erreurs.",
  },
};

export const EXAM_MODE_ORDER: readonly ExamModeId[] = ["officiel", "express", "cible", "revanche"];

/** Questions validées du catalogue utilisables en examen (affiché sans compte). */
export function validatedExamQuestionCount(
  questions: ReadonlyArray<{ status: string; examEligible: boolean; demo: boolean }>,
): number {
  return questions.filter((q) => q.status === "valide" && q.examEligible && !q.demo).length;
}

/** Proportion de bonnes réponses exigée à l'examen réel (35/40 = 87,5 %). */
export const OFFICIAL_RATIO = 35 / 40;

export interface ExamAvailability {
  required: number;
  available: number;
  unseen: number;
  reason: string | null;
  target_refs: string[];
}

/** Message explicite quand un examen complet ne peut pas être composé, sinon null. */
export function availabilityMessage(availability: ExamAvailability): string | null {
  if (availability.reason === "KODI_NO_FAILED_COMPETENCES") {
    return "Aucune compétence ratée pour l’instant : la revanche s’ouvre quand vous avez commis des erreurs sur des questions validées.";
  }
  if (availability.reason === "KODI_NO_TARGET") {
    return "Choisissez au moins un univers dont les compétences sont validées.";
  }
  if (availability.available < availability.required) {
    const { available, required } = availability;
    return `Examen impossible pour le moment : ${available} question${available > 1 ? "s" : ""} validée${available > 1 ? "s" : ""} disponible${available > 1 ? "s" : ""} pour ${required} nécessaires. Une question n’entre dans un examen qu’après avoir été relue et validée.`;
  }
  return null;
}

/** Nombre de questions inédites annoncé avant le lancement. */
export function unseenMessage(availability: ExamAvailability): string {
  const unseen = Math.min(availability.unseen, availability.required);
  if (unseen === availability.required) return "Toutes les questions seront inédites pour vous.";
  if (unseen === 0) return "Vous avez déjà vu toutes les questions disponibles : les moins récentes seront reprises.";
  return `${unseen} question${unseen > 1 ? "s" : ""} inédite${unseen > 1 ? "s" : ""}, complétée${unseen > 1 ? "s" : ""} par les questions vues il y a le plus longtemps.`;
}

// ---------------------------------------------------------------------------
// Historique et statistiques
// ---------------------------------------------------------------------------
export interface ExamSummary {
  id: string;
  mode: ExamModeId;
  status: "in_progress" | "submitted" | "abandoned";
  question_count: number;
  pass_mark: number | null;
  score: number | null;
  passed: boolean | null;
  started_at: string;
  submitted_at: string | null;
}

export interface ModeStats {
  mode: ExamModeId;
  count: number;
  averageRatio: number;
  bestRatio: number;
  lastRatio: number;
  /** Mode officiel uniquement. */
  passedCount: number | null;
}

export interface ExamStats {
  submitted: number;
  abandoned: number;
  byMode: ModeStats[];
}

const ratio = (e: ExamSummary) => (e.score ?? 0) / e.question_count;

export function examStats(exams: readonly ExamSummary[]): ExamStats {
  const submitted = exams
    .filter((e) => e.status === "submitted" && e.score !== null)
    .sort((a, b) => Date.parse(a.submitted_at ?? a.started_at) - Date.parse(b.submitted_at ?? b.started_at));
  const byMode = EXAM_MODE_ORDER.flatMap((mode): ModeStats[] => {
    const list = submitted.filter((e) => e.mode === mode);
    if (list.length === 0) return [];
    const ratios = list.map(ratio);
    return [
      {
        mode,
        count: list.length,
        averageRatio: ratios.reduce((s, r) => s + r, 0) / ratios.length,
        bestRatio: Math.max(...ratios),
        lastRatio: ratios[ratios.length - 1]!,
        passedCount: mode === "officiel" ? list.filter((e) => e.passed === true).length : null,
      },
    ];
  });
  return {
    submitted: submitted.length,
    abandoned: exams.filter((e) => e.status === "abandoned").length,
    byMode,
  };
}

// ---------------------------------------------------------------------------
// Bilan par compétence et recommandations
// ---------------------------------------------------------------------------
export interface CompetenceResult {
  competence_ref: string;
  title: string;
  correct: number;
  total: number;
}

export interface Recommendation {
  competenceRef: string;
  title: string;
  correct: number;
  total: number;
  ratio: number;
}

/**
 * Compétences à retravailler : sous le niveau exigé à l'examen réel
 * (87,5 %), les plus faibles d'abord. Sans IA : simple comparaison.
 */
export function recommendations(report: readonly CompetenceResult[], limit = 3): Recommendation[] {
  return report
    .filter((line) => line.total > 0 && line.correct / line.total < OFFICIAL_RATIO)
    .map((line) => ({
      competenceRef: line.competence_ref,
      title: line.title,
      correct: line.correct,
      total: line.total,
      ratio: line.correct / line.total,
    }))
    .sort((a, b) => a.ratio - b.ratio || b.total - a.total || a.competenceRef.localeCompare(b.competenceRef))
    .slice(0, limit);
}
