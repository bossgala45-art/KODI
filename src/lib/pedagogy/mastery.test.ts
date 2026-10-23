import { describe, expect, it } from "vitest";
import {
  attemptWeight,
  estimateMastery,
  masteryByCompetence,
  weakestScore,
  type MasteryAttempt,
} from "@/lib/pedagogy/mastery";

const NOW = new Date("2026-10-22T12:00:00.000Z");
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString();
const attempts = (pattern: string, ageDays = 0): MasteryAttempt[] =>
  [...pattern].map((c) => ({ correct: c === "1", answeredAt: daysAgo(ageDays) }));

describe("poids des réponses", () => {
  it("vaut 1 aujourd’hui, 0,5 après 30 jours, 0,25 après 60 jours", () => {
    expect(attemptWeight(daysAgo(0), NOW)).toBe(1);
    expect(attemptWeight(daysAgo(30), NOW)).toBeCloseTo(0.5, 10);
    expect(attemptWeight(daysAgo(60), NOW)).toBeCloseTo(0.25, 10);
  });

  it("ne dépasse jamais 1, même pour une date future", () => {
    expect(attemptWeight(new Date(NOW.getTime() + 86_400_000).toISOString(), NOW)).toBe(1);
  });
});

describe("estimation de la maîtrise", () => {
  it("vaut 50 % sans aucune réponse (a priori)", () => {
    expect(estimateMastery([], NOW)).toMatchObject({ score: 0.5, confidence: 0, attempts: 0, level: "non-evaluee" });
  });

  it("applique la formule (1 + justes) / (2 + total) pour des réponses du jour", () => {
    const m = estimateMastery(attempts("1110"), NOW);
    expect(m.score).toBeCloseTo(4 / 6, 10);
    expect(m.confidence).toBeCloseTo(4 / 9, 10);
  });

  it("n’évalue pas une compétence avant 3 réponses", () => {
    expect(estimateMastery(attempts("11"), NOW).level).toBe("non-evaluee");
    expect(estimateMastery(attempts("111"), NOW).level).toBe("en-cours");
  });

  it("déclare la maîtrise seulement avec un bon score ET assez de réponses récentes", () => {
    // 4/4 juste : score 5/6 ≈ 0,83 mais confiance 4/9 < 0,5 → encore « en cours ».
    expect(estimateMastery(attempts("1111"), NOW).level).toBe("en-cours");
    // 6/6 juste : score 7/8, confiance 6/11 → maîtrisée.
    expect(estimateMastery(attempts("111111"), NOW).level).toBe("maitrisee");
  });

  it("classe « fragile » une compétence souvent ratée", () => {
    expect(estimateMastery(attempts("0001"), NOW).level).toBe("fragile");
  });

  it("augmente avec une bonne réponse et baisse avec une erreur", () => {
    const base = estimateMastery(attempts("101"), NOW).score;
    expect(estimateMastery(attempts("1011"), NOW).score).toBeGreaterThan(base);
    expect(estimateMastery(attempts("1010"), NOW).score).toBeLessThan(base);
  });

  it("donne plus de poids aux réponses récentes", () => {
    const oldErrorsRecentSuccess = [...attempts("000", 90), ...attempts("111", 0)];
    const oldSuccessRecentErrors = [...attempts("111", 90), ...attempts("000", 0)];
    expect(estimateMastery(oldErrorsRecentSuccess, NOW).score).toBeGreaterThan(0.5);
    expect(estimateMastery(oldSuccessRecentErrors, NOW).score).toBeLessThan(0.5);
  });

  it("perd en confiance avec le temps : une maîtrise ancienne doit être revue", () => {
    const recent = estimateMastery(attempts("111111"), NOW);
    const old = estimateMastery(attempts("111111", 120), NOW);
    expect(recent.level).toBe("maitrisee");
    expect(old.confidence).toBeLessThan(recent.confidence);
    expect(old.level).toBe("en-cours");
  });

  it("reste entre 0 et 1", () => {
    for (const pattern of ["", "0", "1", "00000000", "11111111"]) {
      const m = estimateMastery(attempts(pattern), NOW);
      expect(m.score).toBeGreaterThan(0);
      expect(m.score).toBeLessThan(1);
    }
  });
});

describe("maîtrise par compétence", () => {
  it("compte une réponse pour chacune des compétences de la question", () => {
    const history = [
      { correct: true, answeredAt: daysAgo(0), competenceIds: ["priorites", "intersections"] },
      { correct: false, answeredAt: daysAgo(0), competenceIds: ["priorites"] },
    ];
    const byCompetence = masteryByCompetence(history, NOW);
    expect(byCompetence.get("priorites")?.attempts).toBe(2);
    expect(byCompetence.get("intersections")?.attempts).toBe(1);
  });

  it("retient la compétence évaluée la plus faible d’une question", () => {
    const mastery = masteryByCompetence(
      [
        ...attempts("1111").map((a) => ({ ...a, competenceIds: ["forte"] })),
        ...attempts("0001").map((a) => ({ ...a, competenceIds: ["faible"] })),
        ...attempts("0").map((a) => ({ ...a, competenceIds: ["non-evaluee"] })),
      ],
      NOW,
    );
    expect(weakestScore(["forte", "faible"], mastery)).toBeCloseTo(2 / 6, 10);
    expect(weakestScore(["non-evaluee"], mastery)).toBeNull();
    expect(weakestScore([], mastery)).toBeNull();
  });
});
