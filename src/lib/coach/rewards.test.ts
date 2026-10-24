import { describe, expect, it } from "vitest";
import { XP_RULES, challengesFor, computeRewards, levelOf, xpForLevel, type RewardsInput } from "@/lib/coach/rewards";
import type { AnswerRecord } from "@/lib/pedagogy/history";

const NOW = new Date("2026-10-24T20:00:00");
const at = (daysAgo: number, minute = 0, hour = 10) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
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

const base = (history: AnswerRecord[], overrides: Partial<RewardsInput> = {}): RewardsInput => ({
  history,
  now: NOW,
  competences: [
    { id: "c-a", title: "Priorités", universeId: "u1" },
    { id: "c-b", title: "Vitesses", universeId: "u2" },
  ],
  universeIds: ["u1", "u2"],
  completedLessons: {},
  openLessonCount: 1,
  exams: [],
  ...overrides,
});

const xpOf = (input: RewardsInput, reason?: string) =>
  computeRewards(input)
    .events.filter((e) => !reason || e.reason === reason)
    .reduce((s, e) => s + e.xp, 0);

describe("niveaux", () => {
  it("demandent de plus en plus d’XP", () => {
    expect([1, 2, 3, 4, 5].map(xpForLevel)).toEqual([0, 100, 300, 600, 1000]);
    expect(levelOf(0)).toMatchObject({ level: 1, progress: 0 });
    expect(levelOf(99).level).toBe(1);
    expect(levelOf(100)).toMatchObject({ level: 2, floor: 100, next: 300 });
    expect(levelOf(200).progress).toBeCloseTo(0.5);
  });
});

describe("XP de réponse : pas de récompense au hasard ni à la répétition", () => {
  it("une mauvaise réponse ne rapporte rien et ne retire rien", () => {
    expect(xpOf(base([answer("q1", false, at(0))]), "bonne-reponse")).toBe(0);
    expect(xpOf(base([answer("q1", true, at(0))]), "bonne-reponse")).toBe(XP_RULES.correctAnswer);
  });

  it("une même question ne rapporte qu’une fois par jour", () => {
    const history = [answer("q1", true, at(1, 0)), answer("q1", true, at(1, 1)), answer("q1", true, at(1, 2))];
    expect(xpOf(base(history), "bonne-reponse")).toBe(XP_RULES.correctAnswer);
  });

  it("plafonne les XP de réponse par jour", () => {
    const history = Array.from({ length: 60 }, (_, i) => answer(`q${i}`, true, at(1, i)));
    const rewards = computeRewards(base(history));
    const answerXp = rewards.events.filter((e) => e.reason === "bonne-reponse").reduce((s, e) => s + e.xp, 0);
    expect(answerXp).toBe(XP_RULES.dailyAnswerCap);
    expect(rewards.events.some((e) => e.withheld === "plafond")).toBe(true);
  });

  it("suspend les XP de réponse quand les réponses semblent données au hasard", () => {
    // 10 réponses dont 3 justes (30 %) : la bonne réponse suivante ne rapporte rien.
    const history = [
      ...Array.from({ length: 7 }, (_, i) => answer(`f${i}`, false, at(1, i))),
      answer("j1", true, at(1, 10)),
      answer("j2", true, at(1, 11)),
      answer("j3", true, at(1, 12)),
    ];
    const rewards = computeRewards(base(history));
    const last = rewards.events.find((e) => e.ref === "j3")!;
    expect(last).toMatchObject({ xp: 0, withheld: "hasard" });
    // Les deux premières bonnes réponses arrivent avant que la fenêtre de 10 soit pleine.
    expect(rewards.events.find((e) => e.ref === "j1")?.xp).toBe(XP_RULES.correctAnswer);
    expect(rewards.guessing).toBe(true);
  });

  it("répondre au hasard rapporte moins que répondre sérieusement", () => {
    const random = Array.from({ length: 100 }, (_, i) => answer(`r${i}`, i % 4 === 0, at(1, i % 60, 8 + Math.floor(i / 60))));
    const careful = Array.from({ length: 100 }, (_, i) => answer(`r${i}`, i % 10 !== 0, at(1, i % 60, 8 + Math.floor(i / 60))));
    expect(xpOf(base(random))).toBeLessThan(xpOf(base(careful)) / 3);
  });
});

describe("récompenses pédagogiques", () => {
  it("récompense une erreur corrigée (2 bonnes réponses de suite après l’erreur)", () => {
    const history = [answer("q1", false, at(3)), answer("q1", true, at(2)), answer("q1", true, at(1))];
    const rewards = computeRewards(base(history));
    expect(rewards.events.filter((e) => e.reason === "erreur-corrigee")).toHaveLength(1);
    expect(rewards.resolvedErrors).toBe(1);
  });

  it("donne le bonus de maîtrise une seule fois, au moment où la compétence est maîtrisée", () => {
    const history = Array.from({ length: 15 }, (_, i) => answer(`q${i}`, true, at(1, i)));
    const rewards = computeRewards(base(history));
    const mastery = rewards.events.filter((e) => e.reason === "competence-maitrisee");
    expect(mastery).toHaveLength(1);
    expect(mastery[0]).toMatchObject({ xp: XP_RULES.competenceMastered, ref: "c-a" });
    expect(rewards.masteredCompetences).toEqual(["c-a"]);
  });

  it("récompense une révision réussie à échéance plus qu’une simple bonne réponse", () => {
    // Bonne réponse, puis nouvelle bonne réponse deux jours plus tard (révision due après 1 jour).
    const history = [answer("q1", true, at(3)), answer("q1", true, at(1))];
    const events = computeRewards(base(history)).events;
    expect(events.map((e) => [e.reason, e.xp])).toContainEqual(["revision-reussie", XP_RULES.correctReview]);
  });

  it("compte leçons terminées et examens officiels réussis (35/40 au moins)", () => {
    const rewards = computeRewards(
      base([], {
        completedLessons: { l1: at(2) },
        exams: [
          { finishedAt: at(1), correct: 35, total: 40 },
          { finishedAt: at(1), correct: 34, total: 40 },
          { finishedAt: at(1), correct: 10, total: 10 },
        ],
      }),
    );
    expect(rewards.events.filter((e) => e.reason === "lecon-terminee")).toHaveLength(1);
    expect(rewards.events.filter((e) => e.reason === "examen-reussi")).toHaveLength(1);
  });

  it("est déterministe", () => {
    const history = [answer("q1", false, at(3)), answer("q1", true, at(2)), answer("q2", true, at(0))];
    expect(computeRewards(base(history))).toEqual(computeRewards(base(history)));
  });
});

describe("séries de révisions", () => {
  // Pour chaque jour d : une question vue la veille au matin, due après 1 jour, revue à midi.
  const daily = (days: number[]) =>
    days.flatMap((d) => [answer(`q${d}`, true, at(d + 1, 0, 8)), answer(`q${d}`, true, at(d, 0, 12))]);

  it("compte les jours consécutifs avec une révision à échéance", () => {
    const rewards = computeRewards(base(daily([3, 2, 1])));
    expect(rewards.streak).toMatchObject({ current: 3, today: false, best: 3 });
  });

  it("s’interrompt après un jour sans révision", () => {
    const rewards = computeRewards(base(daily([6, 5, 1])));
    expect(rewards.streak.current).toBe(1);
  });
});

describe("défis quotidiens", () => {
  const competences = [{ id: "c-a", title: "Priorités", universeId: "u1" }];

  it("s’adaptent à l’état du jour", () => {
    expect(challengesFor({ due: 4, activeErrors: 3, weakest: "c-a" }, competences, 1).map((c) => [c.kind, c.target])).toEqual([
      ["revisions", 4],
      ["erreurs", 2],
      ["competence", 3],
    ]);
    expect(challengesFor({ due: 0, activeErrors: 0, weakest: null }, competences, 1).map((c) => c.kind)).toEqual([
      "bonnes-reponses",
      "lecon",
      "competence",
    ]);
  });

  it("progressent avec les réponses du jour et rapportent des XP une fois relevés", () => {
    const history = Array.from({ length: 5 }, (_, i) => answer(`q${i}`, true, at(0, i)));
    const rewards = computeRewards(base(history));
    const good = rewards.challenges.find((c) => c.kind === "bonnes-reponses")!;
    expect(good).toMatchObject({ progress: 5, done: true });
    const competence = rewards.challenges.find((c) => c.kind === "competence")!;
    expect(competence.done).toBe(true);
    expect(rewards.events.filter((e) => e.reason === "defi-releve")).toHaveLength(2);
  });

  it("une même question répétée ne fait pas avancer le défi « questions différentes »", () => {
    const history = Array.from({ length: 5 }, (_, i) => answer("q1", true, at(0, i)));
    expect(computeRewards(base(history)).challenges.find((c) => c.kind === "bonnes-reponses")?.progress).toBe(1);
  });
});

describe("badges", () => {
  it("suivent des critères pédagogiques, avec leur progression", () => {
    const history = [answer("q1", false, at(3)), answer("q1", true, at(2)), answer("q1", true, at(1)), answer("q2", true, at(1), ["c-b"])];
    const badges = computeRewards(base(history, { completedLessons: { l1: at(1) } })).badges;
    const byId = Object.fromEntries(badges.map((b) => [b.id, b]));
    expect(byId["premiere-lecon"]!.earned).toBe(true);
    expect(byId["erreur-corrigee"]!.earned).toBe(true);
    expect(byId["competence-maitrisee"]!.earned).toBe(false);
    expect(byId["explorateur"]).toMatchObject({ earned: true, progress: 2, target: 2 });
    expect(byId["serie-7"]).toMatchObject({ earned: false, target: 7 });
    expect(byId["examen-reussi"]!.earned).toBe(false);
  });
});
