import { describe, expect, it } from "vitest";
import { buildDailyPlan, type DailyPlanInput } from "@/lib/pedagogy/daily-plan";
import { buildErrorLog } from "@/lib/pedagogy/error-log";
import { answeredOn, parseAnswerHistory, replayCards, type AnswerRecord } from "@/lib/pedagogy/history";
import { masteryByCompetence } from "@/lib/pedagogy/mastery";
import { scheduleNext } from "@/lib/pedagogy/scheduler";

const NOW = new Date("2026-10-22T12:00:00.000Z");
let counter = 0;
function answer(questionId: string, correct: boolean, minutesAgo: number, competenceIds = ["c1"]): AnswerRecord {
  counter += 1;
  return {
    id: `r${counter}`,
    questionId,
    competenceIds,
    selected: correct ? ["ok"] : ["ko"],
    correct,
    answeredAt: new Date(NOW.getTime() - minutesAgo * 60_000).toISOString(),
    context: "lesson",
  };
}

describe("carnet d’erreurs", () => {
  it("garde une question ratée jusqu’à deux bonnes réponses consécutives", () => {
    const base = [answer("q1", false, 50)];
    expect(buildErrorLog(base).map((e) => e.questionId)).toEqual(["q1"]);
    expect(buildErrorLog([...base, answer("q1", true, 40)])[0]?.correctSince).toBe(1);
    expect(buildErrorLog([...base, answer("q1", true, 40), answer("q1", true, 30)])).toEqual([]);
  });

  it("une nouvelle erreur remet le compteur à zéro et cumule les erreurs", () => {
    const log = buildErrorLog([answer("q1", false, 50), answer("q1", true, 40), answer("q1", false, 30)]);
    expect(log[0]).toMatchObject({ wrongCount: 2, correctSince: 0 });
  });

  it("ignore les questions jamais ratées et trie par erreur la plus récente", () => {
    const log = buildErrorLog([answer("a", false, 50), answer("b", true, 45), answer("c", false, 10)]);
    expect(log.map((e) => e.questionId)).toEqual(["c", "a"]);
  });

  it("ne dépend pas de l’ordre de stockage", () => {
    const records = [answer("q", false, 30), answer("q", true, 20), answer("q", true, 10)];
    expect(buildErrorLog([...records].reverse())).toEqual([]);
  });
});

describe("historique et cartes de révision", () => {
  it("rejoue l’historique dans l’ordre chronologique", () => {
    const records = [answer("q", true, 3000), answer("q", true, 1000)];
    const cards = replayCards([...records].reverse());
    expect(cards.get("q")).toMatchObject({ repetitions: 2, intervalTenths: 30 });
  });

  it("utilise la maîtrise connue au moment de chaque réponse", () => {
    // Compétence faible (3 erreurs), puis une question de cette compétence réussie.
    const history = [
      answer("x1", false, 100, ["faible"]),
      answer("x2", false, 90, ["faible"]),
      answer("x3", false, 80, ["faible"]),
      answer("q", true, 70, ["faible"]),
    ];
    const card = replayCards(history).get("q")!;
    expect(card.intervalTenths).toBe(10); // 1 jour minimum, même réduit
    const weakThird = replayCards([...history, answer("q", true, 60, ["faible"]), answer("q", true, 50, ["faible"])]).get("q")!;
    const strongThird = [true, true, true].reduce<ReturnType<typeof scheduleNext> | null>(
      (c, ok, i) => scheduleNext(c, ok, new Date(NOW.getTime() - (70 - i * 10) * 60_000), null),
      null,
    )!;
    expect(weakThird.intervalTenths).toBeLessThan(strongThird.intervalTenths);
  });

  it("ignore les enregistrements invalides à la lecture", () => {
    const valid = answer("q", true, 1);
    expect(parseAnswerHistory(JSON.stringify([valid, { ...valid, context: "autre" }, null]))).toEqual([valid]);
    expect(parseAnswerHistory("{}")).toBeNull();
  });

  it("compte les réponses du jour", () => {
    expect(answeredOn([answer("q", true, 5), answer("q", true, 60 * 30)], NOW)).toBe(1);
  });
});

describe("programme quotidien", () => {
  const questions = ["e1", "e2", "r1", "r2", "n-weak", "n-strong", "n-new"].map((id) => ({
    id,
    competenceIds: id === "n-weak" ? ["faible"] : id === "n-strong" ? ["forte"] : ["neutre"],
  }));

  function input(overrides: Partial<DailyPlanInput> = {}): DailyPlanInput {
    const history = [
      ...Array.from({ length: 4 }, (_, i) => answer(`w${i}`, false, 500 + i, ["faible"])),
      ...Array.from({ length: 6 }, (_, i) => answer(`s${i}`, true, 400 + i, ["forte"])),
    ];
    const due = new Date(NOW.getTime() - 3_600_000).toISOString();
    const later = new Date(NOW.getTime() + 5 * 86_400_000).toISOString();
    const card = (dueAt: string) => ({ ...scheduleNext(null, true, new Date(NOW.getTime() - 86_400_000)), dueAt });
    return {
      now: NOW,
      dailyGoal: 6,
      answeredToday: 0,
      questions,
      cards: new Map([
        ["r2", card(due)],
        ["r1", card(new Date(NOW.getTime() - 7_200_000).toISOString())],
        ["e1", card(due)],
        ["e2", card(later)],
      ]),
      errorLog: buildErrorLog([answer("e1", false, 30), answer("e2", false, 20)]),
      mastery: masteryByCompetence(history, NOW),
      lessons: [
        { id: "l2", title: "Leçon 2", position: 2, completed: false },
        { id: "l1", title: "Leçon 1", position: 1, completed: true },
      ],
      ...overrides,
    };
  }

  it("priorise erreurs, puis révisions dues, puis compétences faibles", () => {
    const plan = buildDailyPlan(input());
    expect(plan.items).toEqual([
      { questionId: "e2", reason: "erreur" },
      { questionId: "e1", reason: "erreur" },
      { questionId: "r1", reason: "revision" },
      { questionId: "r2", reason: "revision" },
      { questionId: "n-weak", reason: "competence-faible" },
      { questionId: "n-new", reason: "competence-faible" },
    ]);
  });

  it("respecte l’objectif quotidien, sans doublon", () => {
    const plan = buildDailyPlan(input({ dailyGoal: 3 }));
    expect(plan.items).toHaveLength(3);
    expect(new Set(plan.items.map((i) => i.questionId)).size).toBe(3);
    expect(plan.items.filter((i) => i.reason === "erreur")).toHaveLength(1); // 30 % de 3, arrondi au-dessus
  });

  it("tient compte des réponses déjà données aujourd’hui", () => {
    const plan = buildDailyPlan(input({ dailyGoal: 6, answeredToday: 6 }));
    expect(plan).toMatchObject({ budget: 0, items: [], goalReached: true });
  });

  it("propose la première leçon non terminée", () => {
    expect(buildDailyPlan(input()).lesson?.id).toBe("l2");
    expect(
      buildDailyPlan(input({ lessons: [{ id: "l1", title: "Leçon 1", position: 1, completed: true }] })).lesson,
    ).toBeNull();
  });

  it("ignore les questions qui ne sont plus disponibles (retirées)", () => {
    const plan = buildDailyPlan(input({ questions: questions.filter((q) => q.id !== "e1") }));
    expect(plan.items.map((i) => i.questionId)).not.toContain("e1");
  });

  it("est déterministe", () => {
    expect(buildDailyPlan(input())).toEqual(buildDailyPlan(input()));
  });
});
