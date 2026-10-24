/**
 * Animations déterministes : la position de chaque élément est une fonction
 * pure du temps t (secondes). Aucune physique, aucun hasard : à un instant
 * donné, la scène est toujours identique (2D, 3D, tests).
 *
 * Repère : x vers l'est, z vers le sud (convention de Three.js, le nord est
 * vers -z), unités en mètres.
 */

export type Easing = "linear" | "ease-in" | "ease-out" | "ease-in-out";

export interface Keyframe {
  t: number;
  x: number;
  z: number;
  /** Courbe d'animation du segment qui commence à cette clé. */
  easing?: Easing;
}

export interface Sample {
  x: number;
  z: number;
  /** Cap en radians : 0 = vers le nord (-z), sens horaire positif. */
  heading: number;
  /** Vitesse instantanée, m/s. */
  speed: number;
}

export function ease(kind: Easing, u: number): number {
  const v = Math.min(1, Math.max(0, u));
  switch (kind) {
    case "linear":
      return v;
    case "ease-in":
      return v * v;
    case "ease-out":
      return 1 - (1 - v) * (1 - v);
    case "ease-in-out":
      return v < 0.5 ? 2 * v * v : 1 - 2 * (1 - v) * (1 - v);
  }
}

/** Dérivée de la courbe (pour la vitesse). */
function easeSlope(kind: Easing, u: number): number {
  const v = Math.min(1, Math.max(0, u));
  switch (kind) {
    case "linear":
      return 1;
    case "ease-in":
      return 2 * v;
    case "ease-out":
      return 2 * (1 - v);
    case "ease-in-out":
      return v < 0.5 ? 4 * v : 4 * (1 - v);
  }
}

export function headingOf(dx: number, dz: number): number {
  return Math.atan2(dx, -dz);
}

/** Vérifie qu'une trajectoire est exploitable (au moins une clé, temps croissants). */
export function keyframeErrors(keys: readonly Keyframe[]): string[] {
  if (keys.length === 0) return ["aucune clé"];
  const errors: string[] = [];
  for (let i = 1; i < keys.length; i += 1) {
    if (keys[i]!.t <= keys[i - 1]!.t) errors.push(`clé ${i} : temps non croissant`);
  }
  return errors;
}

export function sampleTrajectory(keys: readonly Keyframe[], t: number): Sample {
  const first = keys[0];
  if (!first) throw new Error("Trajectoire vide");
  let heading = 0;
  // Cap initial : celui du premier segment en mouvement.
  for (let i = 1; i < keys.length; i += 1) {
    const a = keys[i - 1]!;
    const b = keys[i]!;
    if (a.x !== b.x || a.z !== b.z) {
      heading = headingOf(b.x - a.x, b.z - a.z);
      break;
    }
  }
  if (t <= first.t || keys.length === 1) return { x: first.x, z: first.z, heading, speed: 0 };

  for (let i = 1; i < keys.length; i += 1) {
    const a = keys[i - 1]!;
    const b = keys[i]!;
    const moving = a.x !== b.x || a.z !== b.z;
    if (moving) heading = headingOf(b.x - a.x, b.z - a.z);
    if (t <= b.t) {
      const kind = a.easing ?? "linear";
      const u = (t - a.t) / (b.t - a.t);
      const k = ease(kind, u);
      const length = Math.hypot(b.x - a.x, b.z - a.z);
      return {
        x: a.x + (b.x - a.x) * k,
        z: a.z + (b.z - a.z) * k,
        heading,
        speed: moving ? (length / (b.t - a.t)) * easeSlope(kind, u) : 0,
      };
    }
  }
  const last = keys[keys.length - 1]!;
  return { x: last.x, z: last.z, heading, speed: 0 };
}

// ---------------------------------------------------------------------------
// Horloge de lecture
// ---------------------------------------------------------------------------
/** Pas maximal : après une mise en arrière-plan, l'animation ne « saute » pas. */
export const MAX_STEP = 0.1;

export interface PlaybackState {
  t: number;
  playing: boolean;
  duration: number;
}

export function advance(state: PlaybackState, dt: number): PlaybackState {
  if (!state.playing) return state;
  const t = Math.min(state.duration, state.t + Math.min(Math.max(dt, 0), MAX_STEP));
  return { ...state, t, playing: t < state.duration };
}

export function seek(state: PlaybackState, t: number): PlaybackState {
  return { ...state, t: Math.min(state.duration, Math.max(0, t)) };
}

export function play(state: PlaybackState): PlaybackState {
  // Rejouer depuis le début si la scène est terminée.
  return { ...state, playing: true, t: state.t >= state.duration ? 0 : state.t };
}

// ---------------------------------------------------------------------------
// Caméra explicative et sous-titres
// ---------------------------------------------------------------------------
export interface CameraKey {
  t: number;
  position: readonly [number, number, number];
  target: readonly [number, number, number];
}

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
}

const lerp3 = (a: readonly number[], b: readonly number[], k: number): [number, number, number] => [
  a[0]! + (b[0]! - a[0]!) * k,
  a[1]! + (b[1]! - a[1]!) * k,
  a[2]! + (b[2]! - a[2]!) * k,
];

export function cameraAt(keys: readonly CameraKey[], t: number): CameraPose {
  const first = keys[0];
  if (!first) throw new Error("Caméra sans clé");
  if (t <= first.t) return { position: [...first.position], target: [...first.target] };
  for (let i = 1; i < keys.length; i += 1) {
    const a = keys[i - 1]!;
    const b = keys[i]!;
    if (t <= b.t) {
      const k = ease("ease-in-out", (t - a.t) / (b.t - a.t));
      return { position: lerp3(a.position, b.position, k), target: lerp3(a.target, b.target, k) };
    }
  }
  const last = keys[keys.length - 1]!;
  return { position: [...last.position], target: [...last.target] };
}

export interface Cue {
  from: number;
  to: number;
  text: string;
}

export function activeCue(cues: readonly Cue[], t: number): Cue | null {
  return cues.find((c) => t >= c.from && t < c.to) ?? null;
}
