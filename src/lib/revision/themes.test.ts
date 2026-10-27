import { describe, expect, it } from "vitest";
import { groupByUniverse, seriesLength } from "@/lib/revision/themes";

const universes = [
  { id: "u1", title: "Priorités" },
  { id: "u2", title: "Signalisation" },
  { id: "u3", title: "Vide" },
];
const universeOf = (id: string) => ({ c1: "u1", c2: "u2" })[id];

describe("groupByUniverse", () => {
  it("range chaque question dans les univers de ses compétences, sans thème vide", () => {
    const questions = [
      { id: "a", competenceIds: ["c1"] },
      { id: "b", competenceIds: ["c1", "c2"] },
      { id: "c", competenceIds: [] },
      { id: "d" },
    ];
    const themes = groupByUniverse(questions, universeOf, universes);
    expect(themes.map((t) => [t.id, t.questions.map((q) => q.id)])).toEqual([
      ["u1", ["a", "b"]],
      ["u2", ["b"]],
    ]);
  });
});

describe("seriesLength", () => {
  it("ne dépasse jamais la taille de la banque", () => {
    expect(seriesLength(69, 10)).toBe(10);
    expect(seriesLength(4, 10)).toBe(4);
    expect(seriesLength(0, 10)).toBe(0);
  });
});
