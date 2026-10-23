import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildLock } from "@/lib/content/lock";
import { CATALOG, LESSONS, PLANNED_LESSON_TOTAL, QUESTIONS, UNIVERSES, lessonsOf } from "@/content/catalog";
import { checkAll } from "../../scripts/content";

describe("catalogue pédagogique", () => {
  it("est valide et identique aux fichiers de content/ (sinon « npm run content:build »)", () => {
    const { catalog, errors } = checkAll();
    expect(errors).toEqual([]);
    expect(CATALOG).toEqual(catalog);
  });

  it("a un fichier de statuts à jour", () => {
    const lock = JSON.parse(readFileSync("content/statuts.lock.json", "utf8"));
    expect(lock).toEqual(buildLock(CATALOG));
  });

  it("compte 10 univers et 72 leçons prévues", () => {
    expect(UNIVERSES).toHaveLength(10);
    expect(PLANNED_LESSON_TOTAL).toBe(72);
  });

  it("ne contient que quelques démonstrations, jamais validées", () => {
    const demos = [...QUESTIONS, ...LESSONS].filter((item) => item.demo);
    expect(demos.length).toBeGreaterThan(0);
    expect(demos.length).toBeLessThanOrEqual(10);
    expect(demos.every((d) => d.status === "brouillon")).toBe(true);
  });

  it("indique qui a relu chaque contenu validé, et quand", () => {
    const items = [...CATALOG.universes, ...CATALOG.competences, ...CATALOG.lessons, ...CATALOG.questions];
    for (const item of items.filter((i) => i.status === "valide")) {
      expect(item.review?.by, item.id).toBeTruthy();
      expect(item.review?.at, item.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("range les leçons par univers et par position", () => {
    for (const universe of UNIVERSES) {
      const positions = lessonsOf(universe.id).map((l) => l.position);
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    }
  });
});
