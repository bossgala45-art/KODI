import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EXAM_FORMAT, EXAM_QUESTIONS, EXAM_QUIZ_BANK } from "@/content/exam-questions";
import { SOURCES } from "@/content/sources";

describe("banque de l’examen blanc", () => {
  it("respecte le format vérifié : 40 questions, seuil de 35", () => {
    expect(EXAM_FORMAT.questionCount).toBe(40);
    expect(EXAM_FORMAT.passMark).toBe(35);
    expect(EXAM_FORMAT.source.url).toMatch(/^https:\/\/www\.service-public\.gouv\.fr\//);
  });

  it("contient assez de questions pour un examen complet", () => {
    expect(EXAM_QUESTIONS.length).toBeGreaterThanOrEqual(EXAM_FORMAT.questionCount);
  });

  it("a des questions cohérentes", () => {
    const ids = new Set(EXAM_QUESTIONS.map((q) => q.id));
    expect(ids.size).toBe(EXAM_QUESTIONS.length);
    for (const question of EXAM_QUESTIONS) {
      const choiceIds = question.choices.map((c) => c.id);
      expect(choiceIds.length).toBeGreaterThanOrEqual(2);
      expect(choiceIds.length).toBeLessThanOrEqual(4);
      expect(new Set(question.choices.map((c) => c.label)).size).toBe(choiceIds.length);
      expect(question.correct.length).toBeGreaterThan(0);
      expect(question.correct.length).toBeLessThan(choiceIds.length);
      expect(question.correct.every((id) => choiceIds.includes(id))).toBe(true);
      expect(question.explanation.trim().length).toBeGreaterThan(20);
    }
  });

  it("rattache chaque question à au moins une source officielle consultée", () => {
    for (const question of EXAM_QUESTIONS) {
      expect(question.sources.length).toBeGreaterThan(0);
      for (const id of question.sources) {
        const source = SOURCES[id];
        expect(source.url).toMatch(/^https:\/\/www\.(securite-routiere|service-public)\.gouv\.fr\//);
        expect(source.consultedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("n’est « relue » que si la question est validée dans le catalogue", () => {
    for (const question of EXAM_QUESTIONS) {
      expect(question.review === "relue").toBe(question.status === "valide");
    }
  });

  it("n’inclut ni démonstration ni contenu retiré", () => {
    expect(EXAM_QUESTIONS.some((q) => q.id.startsWith("q-demo"))).toBe(false);
    expect(EXAM_QUESTIONS.some((q) => q.status === "retire")).toBe(false);
  });

  it("ne se présente jamais comme une question officielle", () => {
    for (const question of EXAM_QUESTIONS) {
      expect(question.prompt.toLowerCase()).not.toMatch(/officiel/);
    }
  });

  it("expose les sources au moteur de quiz", () => {
    expect(EXAM_QUIZ_BANK.every((q) => (q.sources?.length ?? 0) > 0)).toBe(true);
    expect(EXAM_QUIZ_BANK[0]?.sources?.[0]?.label).toMatch(/consulté le 22\/10\/2026/);
  });
});

describe("document de relecture", () => {
  it("est à jour (sinon lancer « npm run relecture »)", () => {
    const doc = readFileSync("docs/RELECTURE.md", "utf8");
    expect(doc).toContain(`Total : **${EXAM_QUESTIONS.length} questions**`);
    for (const question of EXAM_QUESTIONS) {
      expect(doc).toContain(`### ${question.id} `);
      expect(doc).toContain(question.prompt);
    }
  });
});
