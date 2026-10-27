import { describe, expect, it } from "vitest";
import {
  EXAM_MODES,
  OFFICIAL_RATIO,
  availabilityMessage,
  examStats,
  recommendations,
  unseenMessage,
  type ExamSummary,
} from "@/lib/exam/modes";

describe("modes d’examen", () => {
  it("respecte les formats demandés et le seuil officiel vérifié", () => {
    expect(EXAM_MODES.officiel).toMatchObject({ questionCount: 40, passMark: 35 });
    expect(EXAM_MODES.express).toMatchObject({ questionCount: 10, passMark: null });
    expect(EXAM_MODES.cible).toMatchObject({ questionCount: 20, passMark: null });
    expect(EXAM_MODES.revanche.passMark).toBeNull();
    expect(OFFICIAL_RATIO).toBe(0.875);
  });

  it("explique pourquoi un examen ne peut pas être composé", () => {
    expect(availabilityMessage({ required: 40, available: 0, unseen: 0, reason: "KODI_NOT_ENOUGH_QUESTIONS", target_refs: [] })).toBe(
      "Examen impossible pour le moment : 0 question validée disponible pour 40 nécessaires. Une question n’entre dans un examen qu’après avoir été relue et validée.",
    );
    expect(availabilityMessage({ required: 40, available: 12, unseen: 12, reason: "KODI_NOT_ENOUGH_QUESTIONS", target_refs: [] })).toMatch(
      /^Examen impossible pour le moment : 12 questions validées disponibles pour 40/,
    );
    expect(availabilityMessage({ required: 10, available: 0, unseen: 0, reason: "KODI_NO_FAILED_COMPETENCES", target_refs: [] })).toMatch(
      /Aucune compétence ratée/,
    );
    expect(availabilityMessage({ required: 10, available: 45, unseen: 3, reason: null, target_refs: [] })).toBeNull();
  });

  it("annonce les questions inédites", () => {
    const base = { required: 10, available: 45, reason: null, target_refs: [] };
    expect(unseenMessage({ ...base, unseen: 45 })).toBe("Toutes les questions seront inédites pour vous.");
    expect(unseenMessage({ ...base, unseen: 4 })).toMatch(/^4 questions inédites/);
    expect(unseenMessage({ ...base, unseen: 0 })).toMatch(/déjà vu toutes/);
  });
});

const exam = (overrides: Partial<ExamSummary>): ExamSummary => ({
  id: Math.random().toString(36),
  mode: "officiel",
  status: "submitted",
  question_count: 40,
  pass_mark: 35,
  score: 35,
  passed: true,
  started_at: "2026-10-20T10:00:00Z",
  submitted_at: "2026-10-20T10:30:00Z",
  ...overrides,
});

describe("statistiques d’examens", () => {
  it("ne compte que les examens remis, par mode, avec le taux de réussite officiel", () => {
    const stats = examStats([
      exam({ score: 30, passed: false, submitted_at: "2026-10-20T10:30:00Z" }),
      exam({ score: 38, passed: true, submitted_at: "2026-10-21T10:30:00Z" }),
      exam({ mode: "express", question_count: 10, pass_mark: null, passed: null, score: 6 }),
      exam({ status: "abandoned", score: null, passed: null, submitted_at: null }),
      exam({ status: "in_progress", score: null, passed: null, submitted_at: null }),
    ]);
    expect(stats.submitted).toBe(3);
    expect(stats.abandoned).toBe(1);
    expect(stats.byMode).toEqual([
      { mode: "officiel", count: 2, averageRatio: 0.85, bestRatio: 0.95, lastRatio: 0.95, passedCount: 1 },
      { mode: "express", count: 1, averageRatio: 0.6, bestRatio: 0.6, lastRatio: 0.6, passedCount: null },
    ]);
  });
});

describe("recommandations de révision", () => {
  it("retient les compétences sous 87,5 %, les plus faibles d’abord", () => {
    const result = recommendations([
      { competence_ref: "c-a", title: "A", correct: 7, total: 8 },
      { competence_ref: "c-b", title: "B", correct: 2, total: 5 },
      { competence_ref: "c-c", title: "C", correct: 1, total: 4 },
      { competence_ref: "c-d", title: "D", correct: 3, total: 4 },
      { competence_ref: "c-e", title: "E", correct: 0, total: 0 },
    ]);
    expect(result.map((r) => r.competenceRef)).toEqual(["c-c", "c-b", "c-d"]);
    expect(result[0]).toMatchObject({ correct: 1, total: 4, ratio: 0.25 });
  });

  it("ne recommande rien quand tout est au niveau de l’examen", () => {
    expect(recommendations([{ competence_ref: "c-a", title: "A", correct: 8, total: 8 }])).toEqual([]);
  });
});
