import { describe, expect, it } from "vitest";
import { SCENES } from "@/content/scenes";
import { INTERSECTION_SANS_SIGNALISATION as scene } from "@/content/scenes/intersection-sans-signalisation";
import { questionById } from "@/content/catalog";
import { SOURCES } from "@/content/sources";
import {
  PERFORMANCE_BUDGET,
  budgetViolations,
  createFrameStats,
  decideQuality,
  recordFrame,
  summarize,
  targetDpr,
} from "@/lib/simulation/performance";
import { learnerOf, passageOrderErrors, sceneErrors, zoneWindow } from "@/lib/simulation/scene";
import {
  MAX_STEP,
  activeCue,
  advance,
  cameraAt,
  ease,
  headingOf,
  play,
  sampleTrajectory,
  seek,
  type Keyframe,
} from "@/lib/simulation/timeline";

describe("trajectoires déterministes", () => {
  const keys: Keyframe[] = [
    { t: 0, x: 0, z: 10, easing: "ease-out" },
    { t: 2, x: 0, z: 0 },
    { t: 4, x: 0, z: 0 },
    { t: 6, x: 10, z: 0 },
  ];

  it("donne toujours la même position au même instant", () => {
    for (const t of [0, 0.37, 1, 2.5, 5.99]) {
      expect(sampleTrajectory(keys, t)).toEqual(sampleTrajectory(keys, t));
    }
  });

  it("interpole les clés, s’arrête puis repart, et reste immobile après la fin", () => {
    expect(sampleTrajectory(keys, -1)).toMatchObject({ x: 0, z: 10, speed: 0 });
    expect(sampleTrajectory(keys, 1).z).toBeCloseTo(2.5); // ease-out : 75 % du chemin à mi-temps
    expect(sampleTrajectory(keys, 2)).toMatchObject({ x: 0, z: 0 });
    expect(sampleTrajectory(keys, 3)).toMatchObject({ x: 0, z: 0, speed: 0 });
    expect(sampleTrajectory(keys, 5).x).toBeCloseTo(5);
    expect(sampleTrajectory(keys, 9)).toMatchObject({ x: 10, z: 0, speed: 0 });
  });

  it("calcule le cap : nord = 0, est = π/2, et le garde à l’arrêt", () => {
    expect(headingOf(0, -1)).toBeCloseTo(0);
    expect(headingOf(1, 0)).toBeCloseTo(Math.PI / 2);
    expect(sampleTrajectory(keys, 1).heading).toBeCloseTo(0); // vers le nord (z décroît)
    expect(sampleTrajectory(keys, 3).heading).toBeCloseTo(0); // à l'arrêt : cap conservé
    expect(sampleTrajectory(keys, 5).heading).toBeCloseTo(Math.PI / 2);
  });

  it("donne une vitesse cohérente avec la courbe", () => {
    expect(sampleTrajectory(keys, 0.001).speed).toBeCloseTo(10, 1); // ease-out : départ à 2 × 5 m/s
    expect(sampleTrajectory(keys, 1.999).speed).toBeCloseTo(0, 1);
    expect(sampleTrajectory(keys, 5).speed).toBeCloseTo(5);
  });

  it("borne les courbes d’animation", () => {
    for (const kind of ["linear", "ease-in", "ease-out", "ease-in-out"] as const) {
      expect(ease(kind, 0)).toBe(0);
      expect(ease(kind, 1)).toBe(1);
      expect(ease(kind, 2)).toBe(1);
    }
  });
});

describe("horloge de lecture", () => {
  const start = { t: 0, playing: true, duration: 10 };

  it("avance, limite les sauts et s’arrête à la fin", () => {
    expect(advance(start, 0.05).t).toBeCloseTo(0.05);
    expect(advance(start, 5).t).toBe(MAX_STEP);
    const end = advance({ ...start, t: 9.95 }, 0.1);
    expect(end).toMatchObject({ t: 10, playing: false });
    expect(advance({ ...start, playing: false }, 0.05).t).toBe(0);
  });

  it("se positionne dans les bornes et rejoue depuis le début", () => {
    expect(seek(start, -3).t).toBe(0);
    expect(seek(start, 30).t).toBe(10);
    expect(play({ t: 10, playing: false, duration: 10 })).toMatchObject({ t: 0, playing: true });
    expect(play({ t: 4, playing: false, duration: 10 })).toMatchObject({ t: 4, playing: true });
  });

  it("deux lectures avec des pas différents arrivent au même état", () => {
    let a = start;
    let b = start;
    for (let i = 0; i < 200; i += 1) a = advance(a, 1 / 60);
    for (let i = 0; i < 100; i += 1) b = advance(b, 1 / 30);
    expect(a.t).toBeCloseTo(b.t, 9);
    const pa = sampleTrajectory(scene.actors[0]!.trajectory, a.t);
    const pb = sampleTrajectory(scene.actors[0]!.trajectory, b.t);
    expect(pa.z).toBeCloseTo(pb.z, 6);
  });
});

describe("caméra explicative et sous-titres", () => {
  it("passe par chaque clé et interpole entre elles", () => {
    const first = scene.cameras.explain[0]!;
    expect(cameraAt(scene.cameras.explain, 0).position).toEqual([...first.position]);
    const last = scene.cameras.explain[scene.cameras.explain.length - 1]!;
    expect(cameraAt(scene.cameras.explain, 999).target).toEqual([...last.target]);
    const mid = cameraAt(scene.cameras.explain, 2.25).position;
    expect(mid[1]).toBeGreaterThan(first.position[1]);
  });

  it("affiche un sous-titre à chaque instant de la scène", () => {
    for (let t = 0; t < scene.duration; t += 0.25) {
      expect(activeCue(scene.cues, t), `t = ${t}`).not.toBeNull();
    }
    expect(activeCue(scene.cues, 5)?.text).toMatch(/voiture verte arrive de votre droite/);
  });
});

describe("scène 1 : intersection sans signalisation", () => {
  it("est bien formée", () => {
    for (const s of SCENES) expect(sceneErrors(s), s.slug).toEqual([]);
    expect(new Set(SCENES.map((s) => s.slug)).size).toBe(SCENES.length);
  });

  it("respecte la priorité à droite : verte, puis vous, puis rouge, sans chevauchement", () => {
    expect(passageOrderErrors(scene)).toEqual([]);
    const window = (id: string) => zoneWindow(scene, scene.actors.find((a) => a.id === id)!);
    const verte = window("verte")!;
    const vous = window("vous")!;
    const rouge = window("rouge")!;
    expect(verte.exit).toBeLessThan(vous.enter);
    expect(vous.exit).toBeLessThan(rouge.enter);
  });

  it("place les véhicules sur leurs voies (circulation à droite)", () => {
    const vous = learnerOf(scene);
    // Vers le nord : voie de droite = côté est (x > 0).
    expect(vous.trajectory.every((k) => k.x > 0)).toBe(true);
    const verte = scene.actors.find((a) => a.id === "verte")!;
    // Vers l'ouest : voie de droite = côté nord (z < 0).
    expect(verte.trajectory.every((k) => k.z < 0)).toBe(true);
    const rouge = scene.actors.find((a) => a.id === "rouge")!;
    // Vers l'est : voie de droite = côté sud (z > 0).
    expect(rouge.trajectory.every((k) => k.z > 0)).toBe(true);
    // La voiture verte vient bien de la droite de l'apprenant (est), la rouge de sa gauche (ouest).
    expect(verte.trajectory[0]!.x).toBeGreaterThan(0);
    expect(rouge.trajectory[0]!.x).toBeLessThan(0);
  });

  it("l’apprenant et la voiture rouge marquent un arrêt avant de céder le passage", () => {
    const vous = learnerOf(scene);
    expect(sampleTrajectory(vous.trajectory, 6).speed).toBe(0);
    const rouge = scene.actors.find((a) => a.id === "rouge")!;
    expect(sampleTrajectory(rouge.trajectory, 9).speed).toBe(0);
  });

  it("est reliée à une question du catalogue et à des sources consultées", () => {
    const question = questionById(scene.questionId);
    expect(question?.lessonId).toBe(scene.lessonId);
    expect(question?.correct).toEqual(["a", "b"]);
    for (const id of scene.sources) expect(SOURCES[id as keyof typeof SOURCES]).toBeDefined();
    expect(scene.provisional.length).toBeGreaterThan(0);
  });
});

describe("contrôles de performance", () => {
  it("plafonne la densité de pixels (iPhone : 3 → 2)", () => {
    expect(targetDpr(3)).toBe(2);
    expect(targetDpr(1)).toBe(1);
    expect(targetDpr(Number.NaN)).toBe(1);
  });

  it("résume les images mesurées et ignore les pauses", () => {
    let stats = createFrameStats(10);
    for (let i = 0; i < 12; i += 1) stats = recordFrame(stats, 1 / 50);
    stats = recordFrame(stats, 5);
    const summary = summarize(stats)!;
    expect(summary.samples).toBe(10);
    expect(summary.averageFps).toBeCloseTo(50);
    expect(summary.p95FrameMs).toBeCloseTo(20);
    expect(summarize(createFrameStats())).toBeNull();
  });

  it("baisse la résolution puis propose la 2D si les images restent lentes", () => {
    const slow = (fps: number) => {
      let stats = createFrameStats();
      for (let i = 0; i < 90; i += 1) stats = recordFrame(stats, 1 / fps);
      return summarize(stats);
    };
    expect(decideQuality(slow(55), 2)).toBe("keep");
    expect(decideQuality(slow(24), 2)).toBe("lower-dpr");
    expect(decideQuality(slow(24), 1)).toBe("keep");
    expect(decideQuality(slow(12), 1)).toBe("suggest-2d");
    expect(decideQuality(summarize(recordFrame(createFrameStats(), 0.5)), 1)).toBe("keep");
  });

  it("signale tout dépassement du budget de rendu", () => {
    expect(budgetViolations({ calls: 10, triangles: 1000 })).toEqual([]);
    expect(budgetViolations({ calls: PERFORMANCE_BUDGET.maxDrawCalls + 1, triangles: 1 })).toHaveLength(1);
  });
});

describe("sons synthétisés", async () => {
  const { engineParams, noiseSamples, passByGain, sceneSoundLevels } = await import("@/lib/simulation/audio");

  it("règle le moteur selon la vitesse et le trafic selon la distance", () => {
    expect(engineParams(0).gain).toBeLessThan(engineParams(10).gain);
    expect(engineParams(10).frequency).toBeGreaterThan(engineParams(0).frequency);
    expect(passByGain(0)).toBeGreaterThan(passByGain(30));
    // À l'arrêt devant le carrefour, la voiture verte qui passe s'entend nettement.
    expect(sceneSoundLevels(scene, 5.5).traffic).toBeGreaterThan(sceneSoundLevels(scene, 0).traffic);
  });

  it("génère toujours le même bruit de fond", () => {
    expect(noiseSamples(64)).toEqual(noiseSamples(64));
    expect(Math.max(...noiseSamples(1000))).toBeLessThanOrEqual(1);
  });
});
