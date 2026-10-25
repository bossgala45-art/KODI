import { describe, expect, it } from "vitest";
import type { SessionRecord } from "@/lib/history";
import type { AnswerRecord } from "@/lib/pedagogy/history";
import { EMPTY_LEARNING, learningFromRow, mergeAnswers, mergeLearning, mergeSessions, sameLearning } from "@/lib/sync/learning";

const answer = (id: string, at: string): AnswerRecord => ({
  id,
  questionId: "q",
  competenceIds: ["c"],
  selected: ["a"],
  correct: true,
  answeredAt: at,
  context: "lesson",
});
const session = (id: string, at: string): SessionRecord => ({ id, mode: "entrainement", finishedAt: at, correct: 3, total: 5, demo: true });

describe("fusion de la progression", () => {
  it("est une union sans doublon, triée, quel que soit l’ordre", () => {
    const a = [answer("1", "2026-10-01T10:00:00Z"), answer("3", "2026-10-03T10:00:00Z")];
    const b = [answer("2", "2026-10-02T10:00:00Z"), answer("1", "2026-10-01T10:00:00Z")];
    expect(mergeAnswers(a, b).map((r) => r.id)).toEqual(["1", "2", "3"]);
    expect(mergeAnswers(b, a)).toEqual(mergeAnswers(a, b));
    expect(mergeSessions([session("s2", "2026-10-02T00:00:00Z")], [session("s1", "2026-10-01T00:00:00Z")]).map((s) => s.id)).toEqual([
      "s1",
      "s2",
    ]);
  });

  it("respecte les limites de l’appareil", () => {
    const many = Array.from({ length: 5003 }, (_, i) => answer(String(i), new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString()));
    const merged = mergeAnswers(many, []);
    expect(merged).toHaveLength(5000);
    expect(merged[0]!.id).toBe("3");
  });

  it("est idempotente et commutative", () => {
    const x = { ...EMPTY_LEARNING, answers: [answer("1", "2026-10-01T10:00:00Z")], lessons: { l: "2026-10-01T10:00:00Z" } };
    const y = { ...EMPTY_LEARNING, answers: [answer("2", "2026-10-02T10:00:00Z")] };
    expect(sameLearning(mergeLearning(x, y), mergeLearning(y, x))).toBe(true);
    expect(sameLearning(mergeLearning(x, x), x)).toBe(true);
  });

  it("ignore les données distantes abîmées", () => {
    expect(learningFromRow({ answers: [{ id: 1 }, answer("ok", "2026-10-01T10:00:00Z")], lessons: { l: "pas une date" }, sessions: "x" })).toEqual({
      answers: [answer("ok", "2026-10-01T10:00:00Z")],
      lessons: {},
      sessions: [],
    });
    expect(learningFromRow(null)).toEqual(EMPTY_LEARNING);
  });
});
