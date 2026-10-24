/**
 * Description d'une scène de simulation : données pures, partagées par la
 * vue 3D, la vue 2D de secours et les tests.
 */
import { keyframeErrors, sampleTrajectory, type CameraKey, type Cue, type Keyframe } from "@/lib/simulation/timeline";

export type ActorKind = "voiture";

export interface Actor {
  id: string;
  kind: ActorKind;
  label: string;
  /** Couleur de carrosserie (hexadécimal), aussi utilisée en 2D. */
  color: string;
  /** Ce que l'apprenant doit comprendre en sélectionnant l'élément. */
  description: string;
  /** Véhicule de l'apprenant (caméra conducteur). */
  isLearner?: boolean;
  trajectory: readonly Keyframe[];
  /** Dimensions (m) : longueur, largeur, hauteur. */
  size: readonly [number, number, number];
}

export interface SceneProp {
  id: string;
  kind: "plaque-rue";
  label: string;
  description: string;
  x: number;
  z: number;
  /** Orientation (radians, comme Sample.heading). */
  rotation: number;
  text: string;
}

export interface SceneDefinition {
  slug: string;
  title: string;
  summary: string;
  duration: number;
  /** Largeur de chaque route (m), croisement en (0, 0). */
  roadWidth: number;
  roadLength: number;
  actors: readonly Actor[];
  props: readonly SceneProp[];
  /** Caméra explicative animée. */
  explainCamera: readonly CameraKey[];
  cues: readonly Cue[];
  /** Question du catalogue associée (content/questions). */
  questionId: string;
  /** Leçon d'où l'on vient. */
  lessonId: string;
  /** Sources réglementaires (registre src/content/sources.ts). */
  sources: readonly string[];
  /** Éléments provisoires, affichés tels quels à l'écran. */
  provisional: readonly string[];
}

export function sceneErrors(scene: SceneDefinition): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const item of [...scene.actors, ...scene.props]) {
    if (ids.has(item.id)) errors.push(`identifiant en double : ${item.id}`);
    ids.add(item.id);
  }
  if (scene.actors.filter((a) => a.isLearner).length !== 1) errors.push("exactement un véhicule de l’apprenant");
  for (const actor of scene.actors) {
    for (const e of keyframeErrors(actor.trajectory)) errors.push(`${actor.id} : ${e}`);
    const last = actor.trajectory[actor.trajectory.length - 1];
    if (last && last.t > scene.duration) errors.push(`${actor.id} : trajectoire plus longue que la scène`);
  }
  if (scene.explainCamera.length === 0) errors.push("caméra explicative sans clé");
  for (const cue of scene.cues) {
    if (cue.from >= cue.to || cue.to > scene.duration) errors.push(`sous-titre mal placé : ${cue.text}`);
  }
  return errors;
}

export function learnerOf(scene: SceneDefinition): Actor {
  const actor = scene.actors.find((a) => a.isLearner);
  if (!actor) throw new Error("Scène sans véhicule de l’apprenant");
  return actor;
}

/** Le véhicule occupe-t-il le carré central du carrefour à l'instant t ? */
export function inIntersection(scene: SceneDefinition, actor: Actor, t: number): boolean {
  const { x, z } = sampleTrajectory(actor.trajectory, t);
  const half = scene.roadWidth / 2 + actor.size[0] / 2;
  return Math.abs(x) < half && Math.abs(z) < half;
}

/** Premier et dernier instant de présence dans le carrefour (pas de 0,05 s). */
export function intersectionWindow(scene: SceneDefinition, actor: Actor, step = 0.05): { enter: number; exit: number } | null {
  let enter: number | null = null;
  let exit: number | null = null;
  for (let t = 0; t <= scene.duration + 1e-9; t += step) {
    if (inIntersection(scene, actor, t)) {
      enter ??= t;
      exit = t;
    }
  }
  return enter === null || exit === null ? null : { enter, exit };
}
