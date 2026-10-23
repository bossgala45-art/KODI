import { describe, expect, it } from "vitest";
import {
  SCHEDULER_SETTINGS,
  isDue,
  masteryFactor,
  scheduleNext,
  type ReviewCard,
} from "@/lib/pedagogy/scheduler";

const T0 = new Date("2026-10-22T08:00:00.000Z");
const DAY = 86_400_000;
const at = (days: number) => new Date(T0.getTime() + days * DAY);

/** Applique une suite de réponses (1 = juste, 0 = faux), chacune à l'échéance de la précédente. */
function run(pattern: string, mastery: number | null = null): ReviewCard[] {
  const cards: ReviewCard[] = [];
  let card: ReviewCard | null = null;
  let when = T0;
  for (const c of pattern) {
    card = scheduleNext(card, c === "1", when, mastery);
    cards.push(card);
    when = new Date(card.dueAt);
  }
  return cards;
}

describe("révisions espacées — bonnes réponses", () => {
  it("espace les révisions : 1 jour, 3 jours, puis × facilité", () => {
    const [first, second, third, fourth] = run("1111");
    expect(first).toMatchObject({ intervalTenths: 10, repetitions: 1, ease: 260 });
    expect(second).toMatchObject({ intervalTenths: 30, repetitions: 2, ease: 270 });
    expect(third).toMatchObject({ intervalTenths: 81, repetitions: 3, ease: 280 }); // 30 × 2,70
    expect(fourth).toMatchObject({ intervalTenths: 227, repetitions: 4, ease: 290 }); // 81 × 2,80 = 226,8
  });

  it("calcule l’échéance à partir de l’intervalle", () => {
    const [first] = run("1");
    expect(first!.dueAt).toBe(at(1).toISOString());
  });

  it("plafonne la facilité à 3,00 et l’intervalle à 180 jours", () => {
    const cards = run("1".repeat(15));
    expect(Math.max(...cards.map((c) => c.ease))).toBe(SCHEDULER_SETTINGS.maxEase);
    expect(cards.at(-1)!.intervalTenths).toBe(SCHEDULER_SETTINGS.maxIntervalTenths);
  });

  it("produit des intervalles croissants", () => {
    const intervals = run("1".repeat(8)).map((c) => c.intervalTenths);
    for (let i = 1; i < intervals.length; i += 1) expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i - 1]!);
  });
});

describe("révisions espacées — erreurs", () => {
  it("remet la série à zéro, baisse la facilité et repropose 10 minutes plus tard", () => {
    const cards = run("1110");
    const lapse = cards.at(-1)!;
    expect(lapse).toMatchObject({ repetitions: 0, intervalTenths: 0, lapses: 1, ease: 260 });
    const previousDue = new Date(cards[2]!.dueAt).getTime();
    expect(Date.parse(lapse.dueAt) - previousDue).toBe(10 * 60_000);
  });

  it("ne descend jamais sous la facilité minimale", () => {
    expect(run("0".repeat(10)).at(-1)!.ease).toBe(SCHEDULER_SETTINGS.minEase);
  });

  it("reprend l’apprentissage à 1 jour après une erreur, avec une facilité réduite", () => {
    const cards = run("111101");
    // Facilité : 2,50 → 2,90 (4 justes) → 2,70 (erreur) → 2,80 (juste).
    expect(cards.at(-1)).toMatchObject({ intervalTenths: 10, repetitions: 1, lapses: 1, ease: 280 });
  });
});

describe("adaptation à la maîtrise", () => {
  it("raccourcit les intervalles d’une compétence faible", () => {
    expect(masteryFactor(null)).toBe(100);
    expect(masteryFactor(0.3)).toBe(60);
    expect(masteryFactor(0.6)).toBe(85);
    expect(masteryFactor(0.9)).toBe(100);
    const strong = run("111", 0.9).at(-1)!;
    const weak = run("111", 0.3).at(-1)!;
    expect(weak.intervalTenths).toBeLessThan(strong.intervalTenths);
  });

  it("ne descend jamais sous 1 jour après une bonne réponse", () => {
    expect(run("1", 0.1)[0]!.intervalTenths).toBe(SCHEDULER_SETTINGS.minIntervalTenths);
  });
});

describe("échéance", () => {
  it("indique si une carte est à réviser", () => {
    const [card] = run("1");
    expect(isDue(card!, at(0.5))).toBe(false);
    expect(isDue(card!, at(1))).toBe(true);
  });
});
