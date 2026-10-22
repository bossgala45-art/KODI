import { describe, expect, it } from "vitest";
import {
  HISTORY_LIMIT,
  appendSession,
  computeStats,
  dayKey,
  formatPercent,
  parseHistory,
  type SessionRecord,
} from "@/lib/history";

function record(partial: Partial<SessionRecord> & { finishedAt: string }): SessionRecord {
  return {
    id: Math.random().toString(36),
    mode: "entrainement",
    correct: 3,
    total: 5,
    demo: true,
    ...partial,
  };
}

// Midi, heure locale, pour éviter les effets de fuseau horaire.
const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12).toISOString();

describe("parseHistory", () => {
  it("rejette un contenu qui n’est pas une liste", () => {
    expect(parseHistory("{}")).toBeNull();
    expect(parseHistory("pas du json")).toBeNull();
  });

  it("écarte les enregistrements invalides", () => {
    const valid = record({ finishedAt: at(2026, 10, 1) });
    const raw = JSON.stringify([
      valid,
      { ...valid, correct: 9 },
      { ...valid, total: 0 },
      { ...valid, mode: "inconnu" },
      { ...valid, finishedAt: "pas une date" },
      null,
    ]);
    expect(parseHistory(raw)).toEqual([valid]);
  });
});

describe("appendSession", () => {
  it("conserve au plus HISTORY_LIMIT sessions", () => {
    const history = Array.from({ length: HISTORY_LIMIT }, (_, i) =>
      record({ id: String(i), finishedAt: at(2026, 1, 1) }),
    );
    const next = appendSession(history, record({ id: "new", finishedAt: at(2026, 1, 2) }));
    expect(next).toHaveLength(HISTORY_LIMIT);
    expect(next.at(-1)?.id).toBe("new");
    expect(next[0]?.id).toBe("1");
  });
});

describe("computeStats", () => {
  const now = new Date(2026, 9, 22, 18);

  it("renvoie des statistiques vides sans historique", () => {
    const stats = computeStats([], now);
    expect(stats.sessions).toBe(0);
    expect(stats.accuracy).toBeNull();
    expect(stats.streakDays).toBe(0);
    expect(stats.recent).toEqual([]);
  });

  it("additionne les résultats par mode et calcule la réussite", () => {
    const stats = computeStats(
      [
        record({ finishedAt: at(2026, 10, 22), correct: 4, total: 5 }),
        record({ finishedAt: at(2026, 10, 21), mode: "simulation", correct: 6, total: 10 }),
      ],
      now,
    );
    expect(stats.questions).toBe(15);
    expect(stats.correct).toBe(10);
    expect(stats.accuracy).toBeCloseTo(10 / 15);
    expect(stats.byMode.simulation).toEqual({ sessions: 1, questions: 10, correct: 6 });
    expect(stats.questionsToday).toBe(5);
  });

  it("compte les jours consécutifs jusqu’à aujourd’hui", () => {
    const stats = computeStats(
      [
        record({ finishedAt: at(2026, 10, 22) }),
        record({ finishedAt: at(2026, 10, 21) }),
        record({ finishedAt: at(2026, 10, 20) }),
        record({ finishedAt: at(2026, 10, 18) }),
      ],
      now,
    );
    expect(stats.streakDays).toBe(3);
  });

  it("garde la série si la dernière activité date d’hier", () => {
    const stats = computeStats(
      [record({ finishedAt: at(2026, 10, 21) }), record({ finishedAt: at(2026, 10, 20) })],
      now,
    );
    expect(stats.streakDays).toBe(2);
    expect(stats.questionsToday).toBe(0);
  });

  it("remet la série à zéro après un jour sans activité", () => {
    const stats = computeStats([record({ finishedAt: at(2026, 10, 19) })], now);
    expect(stats.streakDays).toBe(0);
  });

  it("liste les cinq sessions les plus récentes d’abord", () => {
    const history = [1, 2, 3, 4, 5, 6, 7].map((d) =>
      record({ id: `s${d}`, finishedAt: at(2026, 10, d) }),
    );
    expect(computeStats(history, now).recent.map((r) => r.id)).toEqual([
      "s7",
      "s6",
      "s5",
      "s4",
      "s3",
    ]);
  });
});

describe("utilitaires", () => {
  it("formate une clé de jour local", () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("formate un pourcentage arrondi", () => {
    expect(formatPercent(2 / 3)).toBe("67 %");
  });
});
