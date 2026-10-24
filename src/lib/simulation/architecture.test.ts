import { describe, expect, it } from "vitest";
import { COMPETENCES, LESSONS, UNIVERSES, questionById } from "@/content/catalog";
import { SCENES } from "@/content/scenes";
import { SCENE_PLAN } from "@/content/scenes/plan";
import { SOURCES } from "@/content/sources";
import { LAYOUT_KINDS, SIDEWALK_WIDTH, armsOf, layoutGeometry, overlaps, type Layout } from "@/lib/simulation/layout";
import { ACTOR_KINDS, passageOrderErrors, sceneErrors, type SceneDefinition } from "@/lib/simulation/scene";

const LAYOUTS: Layout[] = [
  { kind: "carrefour", roadWidth: 7, armLength: 50 },
  { kind: "carrefour-en-t", roadWidth: 7, armLength: 50, branch: "sud" },
  { kind: "carrefour-en-t", roadWidth: 6, armLength: 40, branch: "nord" },
  { kind: "ligne-droite", roadWidth: 6, armLength: 60, axis: "nord-sud" },
  { kind: "ligne-droite", roadWidth: 6, armLength: 60, axis: "est-ouest" },
];

describe("décors réutilisables", () => {
  it("couvre chaque type de voirie", () => {
    expect(new Set(LAYOUTS.map((l) => l.kind))).toEqual(new Set(LAYOUT_KINDS));
  });

  for (const layout of LAYOUTS) {
    const label = `${layout.kind} ${"branch" in layout ? layout.branch : "axis" in layout ? layout.axis : ""}`;
    describe(label, () => {
      const g = layoutGeometry(layout);

      it("est déterministe", () => {
        expect(layoutGeometry(layout)).toEqual(g);
      });

      it("ne pose aucun trottoir, immeuble ou arbre sur la chaussée", () => {
        for (const road of g.roads) {
          for (const s of g.sidewalks) expect(overlaps(s, road), JSON.stringify(s)).toBe(false);
          for (const b of g.buildings) expect(overlaps(b, road, SIDEWALK_WIDTH)).toBe(false);
          for (const t of g.trees) expect(overlaps({ ...t, w: 0.3, d: 0.3 }, road)).toBe(false);
        }
      });

      it("ne superpose pas les trottoirs ni les immeubles entre eux", () => {
        g.sidewalks.forEach((a, i) => g.sidewalks.slice(i + 1).forEach((b) => expect(overlaps(a, b)).toBe(false)));
        g.buildings.forEach((a, i) => g.buildings.slice(i + 1).forEach((b) => expect(overlaps(a, b)).toBe(false)));
        expect(g.buildings.length).toBeGreaterThan(0);
      });

      it("borde chaque côté de chaussée d’un trottoir", () => {
        const W = layout.roadWidth;
        // Points juste au bord de la chaussée, de chaque côté de chaque bras et du carré central.
        const probes: Array<[number, number]> = [];
        for (const d of [W, 15, 30]) {
          if (armsOf(layout).includes("nord")) probes.push([W / 2 + 1, -d], [-W / 2 - 1, -d]);
          if (armsOf(layout).includes("est")) probes.push([d, W / 2 + 1], [d, -W / 2 - 1]);
        }
        for (const dir of ["nord", "sud", "est", "ouest"] as const) {
          if (armsOf(layout).includes(dir)) continue;
          const sides: Record<typeof dir, [number, number]> = {
            nord: [0, -W / 2 - 1],
            sud: [0, W / 2 + 1],
            est: [W / 2 + 1, 0],
            ouest: [-W / 2 - 1, 0],
          };
          probes.push(sides[dir]);
        }
        for (const [x, z] of probes) {
          expect(
            g.sidewalks.some((s) => overlaps(s, { x, z, w: 0.01, d: 0.01 })),
            `(${x}, ${z})`,
          ).toBe(true);
        }
      });

      it("reste léger (chaque type d’élément est dessiné en une seule instance)", () => {
        for (const list of [g.roads, g.sidewalks, g.markings, g.buildings, g.trees]) expect(list.length).toBeLessThan(500);
      });
    });
  }

  it("ligne droite : pas de zone de carrefour", () => {
    expect(layoutGeometry(LAYOUTS[3]!).junction).toBeNull();
    expect(layoutGeometry(LAYOUTS[1]!).junction).not.toBeNull();
  });
});

describe("règle de passage vérifiée automatiquement", () => {
  const base = SCENES[0]!;
  it("détecte un ordre de passage non respecté", () => {
    const wrong: SceneDefinition = { ...base, rules: { expectedOrder: ["rouge", "vous", "verte"] } };
    expect(passageOrderErrors(wrong).length).toBeGreaterThan(0);
    const unknown: SceneDefinition = { ...base, rules: { expectedOrder: ["fantome"] } };
    expect(passageOrderErrors(unknown)).toEqual(["ordre de passage : usager inconnu « fantome »"]);
  });

  it("refuse une scène incomplète ou un élément non disponible", () => {
    const broken = {
      ...base,
      sources: [],
      provisional: [],
      props: [{ ...base.props[0]!, kind: "panneau-inexistant" }],
    } as unknown as SceneDefinition;
    const errors = sceneErrors(broken);
    expect(errors).toContain("au moins une source réglementaire");
    expect(errors).toContain("lister les éléments provisoires");
    expect(errors).toContain("plaque : élément non disponible");
  });
});

describe("toutes les scènes produites", () => {
  for (const scene of SCENES) {
    it(`${scene.slug} : bien formée et cohérente avec le catalogue`, () => {
      expect(sceneErrors(scene)).toEqual([]);
      expect(UNIVERSES.some((u) => u.id === scene.universeId)).toBe(true);
      const question = questionById(scene.questionId);
      expect(question?.lessonId).toBe(scene.lessonId);
      expect(question?.competenceIds.every((c) => COMPETENCES.find((x) => x.id === c)?.universeId === scene.universeId)).toBe(true);
      const lesson = LESSONS.find((l) => l.id === scene.lessonId)!;
      expect(lesson.blocks.some((b) => b.type === "simulation" && b.sceneSlug === scene.slug)).toBe(true);
      for (const id of scene.sources) expect(SOURCES[id as keyof typeof SOURCES], id).toBeDefined();
      for (const actor of scene.actors) expect(ACTOR_KINDS).toContain(actor.kind);
    });
  }
});

describe("programme des 20 scènes", () => {
  it("compte 20 scènes, sans doublon, réparties sur les univers", () => {
    expect(SCENE_PLAN).toHaveLength(20);
    expect(new Set(SCENE_PLAN.map((p) => p.slug)).size).toBe(20);
    for (const p of SCENE_PLAN) expect(UNIVERSES.some((u) => u.id === p.universeId), p.slug).toBe(true);
    expect(new Set(SCENE_PLAN.map((p) => p.universeId)).size).toBe(10);
  });

  it("marque disponibles exactement les scènes produites", () => {
    expect(SCENE_PLAN.filter((p) => p.available).map((p) => p.slug).sort()).toEqual(SCENES.map((s) => s.slug).sort());
  });

  it("référence chaque scène prévue dans les leçons", () => {
    const slugs = new Set(SCENE_PLAN.map((p) => p.slug));
    for (const lesson of LESSONS) {
      for (const block of lesson.blocks) {
        if (block.type === "simulation") expect(slugs.has(block.sceneSlug), block.sceneSlug).toBe(true);
      }
    }
  });

  it("n’utilise que des types d’usagers existants", () => {
    for (const p of SCENE_PLAN) for (const kind of p.actors) expect(ACTOR_KINDS).toContain(kind);
  });
});
