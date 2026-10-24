import { describe, expect, it } from "vitest";
import {
  adviseDailyGoal,
  buildCoachReport,
  followExams,
  readiness,
  recommendLessons,
  repeatedErrors,
  reviewPlan,
  weakCompetences,
  wilsonLowerBound,
  type CoachCompetence,
  type CoachLesson,
  type CoachQuestion,
} from "@/lib/coach/coach";
import type { AnswerRecord } from "@/lib/pedagogy/history";
import { estimateMastery, type MasteryEstimate } from "@/lib/pedagogy/mastery";

const NOW = new Date("2026-10-24T18:00:00");
const iso = (daysAgo: number, hour = 10) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
let seq = 0;
const answer = (questionId: string, correct: boolean, answeredAt: string, competenceIds = ["c-a"]): AnswerRecord => ({
  id: String((seq += 1)),
  questionId,
  competenceIds,
  selected: ["a"],
  correct,
  answeredAt,
  context: "practice",
});

const competences: CoachCompetence[] = [
  { id: "c-a", title: "Priorités", universeId: "u1" },
  { id: "c-b", title: "Vitesses", universeId: "u2" },
  { id: "c-c", title: "Tunnels", universeId: "u3" },
];
const estimate = (correct: number, total: number): MasteryEstimate =>
  estimateMastery(
    Array.from({ length: total }, (_, i) => ({ correct: i < correct, answeredAt: NOW.toISOString() })),
    NOW,
  );

describe("compétences faibles", () => {
  it("liste les fragiles puis les en cours, de la plus faible à la plus forte", () => {
    const mastery = new Map([
      ["c-a", estimate(5, 6)], // en cours
      ["c-b", estimate(1, 6)], // fragile
      ["c-c", estimate(1, 2)], // non évaluée (2 réponses)
    ]);
    expect(weakCompetences(competences, mastery).map((w) => [w.competence.id, w.estimate.level])).toEqual([
      ["c-b", "fragile"],
      ["c-a", "en-cours"],
    ]);
  });
});

describe("prochaines leçons", () => {
  const lessons: CoachLesson[] = [
    { id: "l1", title: "L1", href: "/l1", order: 101, competenceIds: ["c-a"], completed: false },
    { id: "l2", title: "L2", href: "/l2", order: 201, competenceIds: ["c-b"], completed: false },
    { id: "l3", title: "L3", href: "/l3", order: 301, competenceIds: ["c-c"], completed: false },
    { id: "l4", title: "L4", href: "/l4", order: 102, competenceIds: ["c-a"], completed: true },
  ];

  it("propose d’abord ce qui renforce une compétence fragile, puis la suite du programme", () => {
    const mastery = new Map([["c-b", estimate(1, 6)]]);
    const result = recommendLessons(lessons, competences, mastery);
    expect(result.map((r) => r.lesson.id)).toEqual(["l2", "l1", "l3"]);
    expect(result[0]!.reason).toBe("Renforce « Vitesses », encore fragile.");
    expect(result[1]!.reason).toBe("Découvre « Priorités ».");
  });

  it("ne repropose une leçon terminée que si sa compétence reste fragile", () => {
    expect(recommendLessons(lessons, competences, new Map()).some((r) => r.lesson.id === "l4")).toBe(false);
    const fragileA = new Map([["c-a", estimate(1, 6)]]);
    const result = recommendLessons(lessons, competences, fragileA, 4);
    expect(result.find((r) => r.lesson.id === "l4")?.reason).toBe("À revoir : « Priorités » reste fragile.");
    // Une leçon non faite passe avant une leçon à revoir, à niveau égal.
    expect(result.map((r) => r.lesson.id).indexOf("l1")).toBeLessThan(result.map((r) => r.lesson.id).indexOf("l4"));
  });
});

describe("révisions planifiées", () => {
  it("compte les révisions dues et les répartit sur les 7 prochains jours", () => {
    const at = (days: number, hour = 9) => {
      const d = new Date(NOW);
      d.setDate(d.getDate() + days);
      d.setHours(hour, 0, 0, 0);
      return { dueAt: d.toISOString() };
    };
    const cards = new Map([
      ["q1", at(-1)],
      ["q2", at(0, 20)], // plus tard aujourd'hui
      ["q3", at(1)],
      ["q4", at(1)],
      ["q5", at(3)],
      ["q6", at(30)],
      ["retiree", at(-2)],
    ]);
    const plan = reviewPlan(cards, new Set(["q1", "q2", "q3", "q4", "q5", "q6"]), NOW);
    expect(plan.dueNow).toBe(2);
    expect(plan.upcoming.map((d) => d.count)).toEqual([2, 0, 1, 0, 0, 0, 0]);
  });
});

describe("examens récents", () => {
  it("suit les examens officiels réussis sur 30 jours et la tendance", () => {
    const follow = followExams(
      [
        { finishedAt: iso(40), correct: 38, total: 40 },
        { finishedAt: iso(10), correct: 30, total: 40 },
        { finishedAt: iso(5), correct: 7, total: 10 },
        { finishedAt: iso(1), correct: 36, total: 40 },
      ],
      NOW,
    );
    expect(follow.officialLast30).toBe(2);
    expect(follow.officialPassedLast30).toBe(1);
    expect(follow.recent[0]!.correct).toBe(36);
    expect(follow.trend).toBe("hausse");
    expect(followExams([], NOW).trend).toBeNull();
  });
});

describe("objectif quotidien proposé", () => {
  const days = (count: number, perDay: number) =>
    Array.from({ length: count }, (_, d) => Array.from({ length: perDay }, (_, i) => answer(`q${i}`, true, iso(d + 1)))).flat();

  it("baisse un objectif rarement atteint", () => {
    const advice = adviseDailyGoal(days(7, 3), 20, 0, NOW);
    expect(advice).toMatchObject({ current: 20, suggested: 10 });
    expect(advice.reason).toMatch(/3,0 réponses par jour/);
  });

  it("monte l’objectif quand les révisions s’accumulent, sinon le garde", () => {
    expect(adviseDailyGoal(days(7, 20), 20, 25, NOW).suggested).toBe(40);
    expect(adviseDailyGoal(days(7, 20), 20, 5, NOW).suggested).toBe(20);
    expect(adviseDailyGoal(days(7, 40), 40, 90, NOW).suggested).toBe(40);
    // Aucun historique : on ne juge pas le rythme.
    expect(adviseDailyGoal([], 20, 0, NOW).suggested).toBe(20);
  });
});

describe("erreurs répétées", () => {
  it("retient les questions manquées au moins deux fois et encore dans le carnet", () => {
    const history = [
      answer("q1", false, iso(3)),
      answer("q1", false, iso(2)),
      answer("q2", false, iso(2)),
      answer("q3", false, iso(4)),
      answer("q3", false, iso(3)),
      answer("q3", true, iso(2)),
      answer("q3", true, iso(1)), // corrigée deux fois de suite : sortie du carnet
      answer("q4", false, iso(3)),
      answer("q4", false, iso(2)),
      answer("q4", false, iso(1)),
    ];
    expect(repeatedErrors(history, new Set(["q1", "q2", "q3", "q4"]))).toEqual([
      { questionId: "q4", wrongCount: 3, lastWrongAt: iso(1) },
      { questionId: "q1", wrongCount: 2, lastWrongAt: iso(2) },
    ]);
  });
});

describe("indicateur de préparation prudent", () => {
  const questions: CoachQuestion[] = Array.from({ length: 40 }, (_, i) => ({ id: `q${i}`, competenceIds: ["c-a"], validated: true }));
  const allMastered = new Map(competences.map((c) => [c.id, estimate(20, 20)]));
  const history = (n: number, rate: number) =>
    Array.from({ length: n }, (_, i) => answer(`q${i % 40}`, i < Math.round(n * rate), iso(i % 20)));
  const passedExams = followExams(
    [1, 2, 3].map((d) => ({ finishedAt: iso(d), correct: 38, total: 40 })),
    NOW,
  );

  it("utilise une borne basse : 50/50 ne donne pas 100 %", () => {
    expect(wilsonLowerBound(50, 50)).toBeGreaterThan(0.9);
    expect(wilsonLowerBound(50, 50)).toBeLessThan(1);
    expect(wilsonLowerBound(0, 0)).toBe(0);
  });

  it("refuse d’estimer avec trop peu de réponses", () => {
    const r = readiness({ history: history(30, 1), questions, competences, mastery: allMastered, exams: passedExams, now: NOW });
    expect(r.level).toBe("donnees-insuffisantes");
    expect(r.lowerBound).toBeNull();
  });

  it("n’annonce « prêt » qu’avec un taux élevé, une couverture large et des examens réussis", () => {
    const strong = history(400, 0.97);
    expect(readiness({ history: strong, questions, competences, mastery: allMastered, exams: passedExams, now: NOW }).level).toBe("pret");
    // Sans examen officiel récent : au mieux « en progrès ».
    const noExam = followExams([], NOW);
    expect(readiness({ history: strong, questions, competences, mastery: allMastered, exams: noExam, now: NOW }).level).toBe("en-progres");
    // Un examen échoué parmi les récents : pas « prêt ».
    const mixed = followExams(
      [...[1, 2, 3].map((d) => ({ finishedAt: iso(d), correct: 38, total: 40 })), { finishedAt: iso(4), correct: 30, total: 40 }],
      NOW,
    );
    expect(readiness({ history: strong, questions, competences, mastery: allMastered, exams: mixed, now: NOW }).level).toBe("proche");
    // Taux insuffisant.
    expect(readiness({ history: history(400, 0.5), questions, competences, mastery: allMastered, exams: passedExams, now: NOW }).level).toBe("a-consolider");
  });

  it("plafonne l’indicateur tant que les questions ne sont pas validées", () => {
    const unvalidated = questions.map((q) => ({ ...q, validated: false }));
    const r = readiness({ history: history(400, 0.97), questions: unvalidated, competences, mastery: allMastered, exams: passedExams, now: NOW });
    expect(r.level).toBe("en-progres");
    expect(r.reasons.at(-1)).toMatch(/plafonné/);
  });
});

describe("rapport du coach", () => {
  it("est déterministe et ignore les questions retirées du catalogue", () => {
    const input = {
      now: NOW,
      history: [answer("q1", false, iso(1)), answer("q1", false, iso(0, 9)), answer("retiree", false, iso(1))],
      competences,
      lessons: [{ id: "l1", title: "L1", href: "/l1", order: 1, competenceIds: ["c-a"], completed: false }],
      questions: [{ id: "q1", competenceIds: ["c-a"], validated: false }],
      exams: [],
      dailyGoal: 20 as const,
    };
    const a = buildCoachReport(input);
    expect(buildCoachReport(input)).toEqual(a);
    expect(a.repeatedErrors.map((e) => e.questionId)).toEqual(["q1"]);
    expect(a.readiness.level).toBe("donnees-insuffisantes");
    expect(a.lessons[0]?.lesson.id).toBe("l1");
  });
});
