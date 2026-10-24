/**
 * Description d'une scène de simulation : données pures, partagées par la
 * vue 3D, la vue 2D de secours et les tests. Une nouvelle scène se décrit
 * entièrement ici (décor, usagers, caméras, sous-titres, règle de passage),
 * sans écrire de code de rendu.
 */
import type { ContentStatus } from "@/lib/content/schema";
import { layoutGeometry, overlaps, type Layout, type Rect } from "@/lib/simulation/layout";
import { keyframeErrors, sampleTrajectory, type CameraKey, type CameraPose, type Cue, type Keyframe } from "@/lib/simulation/timeline";

/** Types d'usagers dessinables (formes provisoires). */
export const ACTOR_KINDS = ["voiture", "utilitaire", "velo", "pieton"] as const;
export type ActorKind = (typeof ACTOR_KINDS)[number];

/** Dimensions par défaut (m) : longueur, largeur, hauteur. */
export const ACTOR_SIZES: Record<ActorKind, readonly [number, number, number]> = {
  voiture: [4.2, 1.8, 1.45],
  utilitaire: [5.5, 2.1, 2.6],
  velo: [1.8, 0.6, 1.7],
  pieton: [0.5, 0.5, 1.75],
};

export interface Actor {
  id: string;
  kind: ActorKind;
  label: string;
  /** Couleur (hexadécimal), aussi utilisée en 2D. */
  color: string;
  /** Ce que l'apprenant doit comprendre en sélectionnant l'élément. */
  description: string;
  /** Usager incarné par l'apprenant (caméra conducteur). */
  isLearner?: boolean;
  trajectory: readonly Keyframe[];
  /** Dimensions (m) ; à défaut, celles du type. */
  size?: readonly [number, number, number];
}

/**
 * Éléments fixes. Seuls des éléments sans portée réglementaire sont
 * disponibles : un panneau de signalisation ne sera ajouté qu'après
 * vérification de sa forme et de son sens sur une source officielle.
 */
export const PROP_KINDS = ["plaque-rue"] as const;
export type PropKind = (typeof PROP_KINDS)[number];

export interface SceneProp {
  id: string;
  kind: PropKind;
  label: string;
  description: string;
  x: number;
  z: number;
  /** Orientation (radians, comme Sample.heading). */
  rotation: number;
  text: string;
}

export interface SceneRules {
  /** Zone de conflit ; par défaut le carré central du carrefour. */
  conflictZone?: Rect;
  /** Ordre de passage attendu dans la zone (identifiants d'usagers). */
  expectedOrder: readonly string[];
}

export interface SceneDefinition {
  slug: string;
  title: string;
  summary: string;
  status: ContentStatus;
  /** Univers pédagogique (content/univers.json). */
  universeId: string;
  duration: number;
  layout: Layout;
  actors: readonly Actor[];
  props: readonly SceneProp[];
  cameras: {
    aerial: CameraPose;
    /** Position de départ de la caméra libre (elle vise le centre). */
    free: readonly [number, number, number];
    /** Caméra explicative animée. */
    explain: readonly CameraKey[];
  };
  cues: readonly Cue[];
  rules: SceneRules;
  /** Question du catalogue associée (content/questions). */
  questionId: string;
  /** Leçon d'où l'on vient. */
  lessonId: string;
  /** Sources réglementaires (registre src/content/sources.ts). */
  sources: readonly string[];
  /** Éléments provisoires, affichés tels quels à l'écran. */
  provisional: readonly string[];
}

export function actorSize(actor: Actor): readonly [number, number, number] {
  return actor.size ?? ACTOR_SIZES[actor.kind];
}

export function learnerOf(scene: SceneDefinition): Actor {
  const actor = scene.actors.find((a) => a.isLearner);
  if (!actor) throw new Error("Scène sans usager de l’apprenant");
  return actor;
}

export function conflictZone(scene: SceneDefinition): Rect | null {
  return scene.rules.conflictZone ?? layoutGeometry(scene.layout).junction;
}

/** L'usager occupe-t-il la zone de conflit à l'instant t ? */
export function inZone(zone: Rect, actor: Actor, t: number): boolean {
  const { x, z } = sampleTrajectory(actor.trajectory, t);
  const r = actorSize(actor)[0] / 2;
  return overlaps({ x, z, w: 2 * r, d: 2 * r }, zone);
}

/** Premier et dernier instant de présence dans la zone (pas de 0,05 s). */
export function zoneWindow(scene: SceneDefinition, actor: Actor, step = 0.05): { enter: number; exit: number } | null {
  const zone = conflictZone(scene);
  if (!zone) return null;
  let enter: number | null = null;
  let exit: number | null = null;
  for (let i = 0; i * step <= scene.duration + 1e-9; i += 1) {
    const t = i * step;
    if (inZone(zone, actor, t)) {
      enter ??= t;
      exit = t;
    }
  }
  return enter === null || exit === null ? null : { enter, exit };
}

/**
 * Vérifie que les trajectoires respectent l'ordre de passage attendu :
 * chacun sort de la zone avant que le suivant n'y entre.
 */
export function passageOrderErrors(scene: SceneDefinition): string[] {
  const errors: string[] = [];
  const windows = scene.rules.expectedOrder.map((id) => {
    const actor = scene.actors.find((a) => a.id === id);
    if (!actor) {
      errors.push(`ordre de passage : usager inconnu « ${id} »`);
      return null;
    }
    const w = zoneWindow(scene, actor);
    if (!w) errors.push(`ordre de passage : « ${id} » ne traverse pas la zone`);
    return w ? { id, ...w } : null;
  });
  for (let i = 1; i < windows.length; i += 1) {
    const a = windows[i - 1];
    const b = windows[i];
    if (a && b && !(a.exit < b.enter)) errors.push(`ordre de passage : « ${b.id} » entre avant la sortie de « ${a.id} »`);
  }
  return errors;
}

export function sceneErrors(scene: SceneDefinition): string[] {
  const errors: string[] = [];
  if (!/^[a-z0-9-]+$/.test(scene.slug)) errors.push("identifiant de scène invalide");
  const ids = new Set<string>();
  for (const item of [...scene.actors, ...scene.props]) {
    if (ids.has(item.id)) errors.push(`identifiant en double : ${item.id}`);
    ids.add(item.id);
  }
  if (scene.actors.filter((a) => a.isLearner).length !== 1) errors.push("exactement un usager de l’apprenant");
  for (const actor of scene.actors) {
    if (!(ACTOR_KINDS as readonly string[]).includes(actor.kind)) errors.push(`${actor.id} : type inconnu`);
    if (!/^#[0-9a-f]{6}$/i.test(actor.color)) errors.push(`${actor.id} : couleur invalide`);
    for (const e of keyframeErrors(actor.trajectory)) errors.push(`${actor.id} : ${e}`);
    const last = actor.trajectory[actor.trajectory.length - 1];
    if (last && last.t > scene.duration) errors.push(`${actor.id} : trajectoire plus longue que la scène`);
  }
  for (const prop of scene.props) {
    if (!(PROP_KINDS as readonly string[]).includes(prop.kind)) errors.push(`${prop.id} : élément non disponible`);
  }
  if (scene.cameras.explain.length === 0) errors.push("caméra explicative sans clé");
  for (const cue of scene.cues) {
    if (cue.from >= cue.to || cue.to > scene.duration) errors.push(`sous-titre mal placé : ${cue.text}`);
  }
  if (scene.sources.length === 0) errors.push("au moins une source réglementaire");
  if (scene.provisional.length === 0) errors.push("lister les éléments provisoires");
  errors.push(...passageOrderErrors(scene));
  return errors;
}
