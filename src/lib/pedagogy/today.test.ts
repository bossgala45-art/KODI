import { describe, expect, it } from "vitest";
import type { AnswerRecord } from "@/lib/pedagogy/history";
import { createAnswerRecord, parseLessonProgress } from "@/lib/pedagogy/progress";
import { learnerOverview } from "@/lib/pedagogy/today";

const NOW = new Date("2026-10-23T10:00:00");
const answer = (questionId: string, correct: boolean, answeredAt: string): AnswerRecord => ({
  id: `${questionId}-${answeredAt}`,
  questionId,
  competenceIds: ["c1"],
  selected: ["a"],
  correct,
  answeredAt,
  context: "lesson",
});

const questions = ["q1", "q2", "q3", "q4"].map((id) => ({ id, competenceIds: ["c1"] }));
const lessons = [
  { id: "l2", title: "Deux", position: 102 },
  { id: "l1", title: "Une", position: 101 },
];

describe("vue d’ensemble de l’apprenant", () => {
  it("propose d’abord les erreurs, puis les questions nouvelles, et la prochaine leçon", () => {
    const overview = learnerOverview({
      history: [answer("q1", false, "2026-10-23T09:00:00"), answer("q2", true, "2026-10-23T09:01:00")],
      now: NOW,
      dailyGoal: 5,
      questions,
      lessons,
      completedLessons: { l1: "2026-10-22T10:00:00Z" },
    });
    expect(overview.answeredToday).toBe(2);
    expect(overview.plan.budget).toBe(3);
    expect(overview.plan.items[0]).toEqual({ questionId: "q1", reason: "erreur" });
    expect(overview.plan.items.map((i) => i.questionId)).toEqual(["q1", "q3", "q4"]);
    expect(overview.plan.lesson?.id).toBe("l2");
    expect(overview.errorLog.map((e) => e.questionId)).toEqual(["q1"]);
    // L'erreur revient 10 minutes plus tard : elle est due à 10 h.
    expect(overview.dueCount).toBe(1);
  });

  it("ignore les questions retirées du catalogue", () => {
    const overview = learnerOverview({
      history: [answer("q-retiree", false, "2026-10-23T09:00:00")],
      now: NOW,
      dailyGoal: 5,
      questions,
      lessons: [],
      completedLessons: {},
    });
    expect(overview.errorLog).toEqual([]);
    expect(overview.dueCount).toBe(0);
    expect(overview.plan.items.some((i) => i.questionId === "q-retiree")).toBe(false);
  });

  it("propose une série supplémentaire une fois l’objectif atteint", () => {
    const history = ["q1", "q2"].map((id, i) => answer(id, true, `2026-10-23T09:0${i}:00`));
    const overview = learnerOverview({ history, now: NOW, dailyGoal: 2, questions, lessons: [], completedLessons: {} });
    expect(overview.plan.goalReached).toBe(true);
    expect(overview.plan.items).toEqual([]);
    expect(overview.extraPlan.items.map((i) => i.questionId)).toEqual(["q3", "q4"]);
  });
});

describe("enregistrement des réponses", () => {
  const question = {
    id: "qm",
    kind: "multiple" as const,
    choices: [{ id: "a" }, { id: "b" }, { id: "c" }],
    correct: ["a", "c"],
    competenceIds: ["c1"],
  };

  it("corrige une réponse multiple en tout ou rien et garde le détail", () => {
    const { record, grade } = createAnswerRecord(question, ["a", "b", "a"], "review", NOW);
    expect(grade).toEqual({ correct: false, missed: ["c"], wrong: ["b"], expectedCount: 2 });
    expect(record).toMatchObject({
      questionId: "qm",
      competenceIds: ["c1"],
      selected: ["a", "b"],
      correct: false,
      context: "review",
      answeredAt: NOW.toISOString(),
    });
    expect(createAnswerRecord(question, ["c", "a"], "review", NOW).grade.correct).toBe(true);
  });

  it("refuse une réponse vide", () => {
    expect(() => createAnswerRecord(question, [], "lesson", NOW)).toThrow(/invalide/);
  });

  it("lit les leçons terminées en écartant les valeurs corrompues", () => {
    expect(parseLessonProgress('{"l1":"2026-10-22T10:00:00Z","l2":42,"l3":"pas une date"}')).toEqual({
      l1: "2026-10-22T10:00:00Z",
    });
    expect(parseLessonProgress("[1,2]")).toBeNull();
  });
});
