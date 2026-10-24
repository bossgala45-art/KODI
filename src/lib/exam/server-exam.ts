"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CompetenceResult, ExamAvailability, ExamModeId, ExamSummary } from "@/lib/exam/modes";
import { unwrap, withNetworkRetry } from "@/lib/supabase/errors";

/** Examen tel que renvoyé par get_exam : aucune bonne réponse incluse. */
export interface ServerExamItem {
  position: number;
  question_id: string;
  prompt: string;
  answer_count: number;
  selected_choice_ids: string[] | null;
  choices: { id: string; label: string }[];
}

export interface ServerExam {
  id: string;
  mode: ExamModeId;
  status: "in_progress" | "submitted" | "abandoned";
  question_count: number;
  /** Seuil : mode officiel uniquement. */
  pass_mark: number | null;
  unseen_count: number;
  score: number | null;
  passed: boolean | null;
  items: ServerExamItem[];
}

export interface ServerSource {
  title: string;
  publisher?: string;
  url: string;
  consulted_at?: string;
}

export interface CorrectionItem extends ServerExamItem {
  correct_choice_ids: string[];
  is_correct: boolean;
  explanation: string;
  sources: ServerSource[];
  competence_refs: string[];
}

export interface ServerCorrection {
  id: string;
  mode: ExamModeId;
  score: number;
  passed: boolean | null;
  question_count: number;
  pass_mark: number | null;
  unseen_count: number;
  items: CorrectionItem[];
  /** Bilan par compétence de cet examen. */
  competences: CompetenceResult[];
}

export interface SubmitResult {
  mode: ExamModeId;
  score: number;
  passed: boolean | null;
  question_count: number;
  pass_mark: number | null;
}

const SUMMARY_COLUMNS = "id, mode, status, question_count, pass_mark, score, passed, started_at, submitted_at";

/** Appels RPC de l'examen blanc. Les lectures sont réessayées en cas de coupure réseau. */
export function examApi(client: SupabaseClient) {
  return {
    availability: (mode: ExamModeId, competenceRefs: string[] | null = null): Promise<ExamAvailability> =>
      withNetworkRetry(
        async () =>
          unwrap(
            await client.rpc("exam_availability", { p_mode: mode, p_competence_refs: competenceRefs }),
          ) as ExamAvailability,
      ),
    start: async (mode: ExamModeId, competenceRefs: string[] | null = null): Promise<string> =>
      unwrap(await client.rpc("start_exam_mode", { p_mode: mode, p_competence_refs: competenceRefs })) as string,
    /** Examens de la personne connectée (RLS), du plus récent au plus ancien. */
    history: (): Promise<ExamSummary[]> =>
      withNetworkRetry(
        async () =>
          unwrap(
            await client.from("exams").select(SUMMARY_COLUMNS).order("started_at", { ascending: false }).limit(100),
          ) as ExamSummary[],
      ),
    competenceStats: (): Promise<CompetenceResult[]> =>
      withNetworkRetry(async () => unwrap(await client.rpc("get_exam_competence_stats")) as CompetenceResult[]),
    get: (examId: string): Promise<ServerExam> =>
      withNetworkRetry(async () => unwrap(await client.rpc("get_exam", { p_exam_id: examId })) as ServerExam),
    // Rejouable sans risque : la même réponse remplace la précédente.
    answer: (examId: string, position: number, choiceIds: string[]): Promise<void> =>
      withNetworkRetry(async () => {
        unwrap(
          await client.rpc("answer_exam_question", {
            p_exam_id: examId,
            p_position: position,
            p_choice_ids: choiceIds,
          }),
        );
      }),
    submit: async (examId: string): Promise<SubmitResult> =>
      unwrap(await client.rpc("submit_exam", { p_exam_id: examId })) as SubmitResult,
    correction: (examId: string): Promise<ServerCorrection> =>
      withNetworkRetry(
        async () => unwrap(await client.rpc("get_exam_correction", { p_exam_id: examId })) as ServerCorrection,
      ),
    abandon: async (examId: string): Promise<void> => {
      unwrap(await client.rpc("abandon_exam", { p_exam_id: examId }));
    },
  };
}

export type ExamApi = ReturnType<typeof examApi>;

/** Première question sans réponse (pour reprendre un examen en cours). */
export function firstUnanswered(exam: ServerExam): number {
  const index = exam.items.findIndex((item) => !item.selected_choice_ids?.length);
  return index === -1 ? exam.items.length - 1 : index;
}

export function sourceLabel(source: ServerSource): string {
  const publisher = source.publisher?.split(" (")[0];
  const date = source.consulted_at?.split("-").reverse().join("/");
  return [publisher, `« ${source.title} »`, date && `consulté le ${date}`].filter(Boolean).join(" — ");
}
