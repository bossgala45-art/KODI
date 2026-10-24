/**
 * Budget et suivi de performance des scènes 3D.
 *
 * Le budget est un plafond vérifié automatiquement (tests et navigateur de
 * test), pas une mesure sur iPhone : aucune mesure n'a été faite sur un
 * appareil réel à ce stade.
 */

export const PERFORMANCE_BUDGET = {
  /** Appels de dessin par image (renderer.info.render.calls). */
  maxDrawCalls: 80,
  /** Triangles par image. */
  maxTriangles: 40_000,
  /** Côté maximal d'une texture générée (pixels). */
  maxTextureSize: 512,
  /** Densité de pixels maximale : 2 au lieu de 3 sur iPhone. */
  maxDpr: 2,
  /** En dessous (images/s, moyenne glissante), on baisse la résolution. */
  lowFps: 30,
  /** Toujours en dessous après la baisse : on propose la version 2D. */
  fallbackFps: 20,
} as const;

/** Densité de pixels retenue pour l'appareil. */
export function targetDpr(deviceDpr: number, max: number = PERFORMANCE_BUDGET.maxDpr): number {
  if (!Number.isFinite(deviceDpr) || deviceDpr <= 0) return 1;
  return Math.min(deviceDpr, max);
}

export interface FrameStats {
  /** Durées d'image en secondes, les plus récentes à la fin. */
  frames: number[];
  capacity: number;
}

export function createFrameStats(capacity = 120): FrameStats {
  return { frames: [], capacity };
}

export function recordFrame(stats: FrameStats, dt: number): FrameStats {
  if (!(dt > 0) || dt > 1) return stats; // pause, onglet en arrière-plan
  const frames = [...stats.frames, dt].slice(-stats.capacity);
  return { ...stats, frames };
}

export interface FrameSummary {
  samples: number;
  averageFps: number;
  /** 95e centile de la durée d'image, en millisecondes. */
  p95FrameMs: number;
}

export function summarize(stats: FrameStats): FrameSummary | null {
  const n = stats.frames.length;
  if (n === 0) return null;
  const total = stats.frames.reduce((s, f) => s + f, 0);
  const sorted = [...stats.frames].sort((a, b) => a - b);
  const p95 = sorted[Math.min(n - 1, Math.ceil(n * 0.95) - 1)]!;
  return { samples: n, averageFps: n / total, p95FrameMs: p95 * 1000 };
}

export type QualityDecision = "keep" | "lower-dpr" | "suggest-2d";

/**
 * Décide d'une adaptation, seulement avec assez d'images mesurées
 * (au moins 60, soit environ une seconde à 60 images/s).
 */
export function decideQuality(summary: FrameSummary | null, currentDpr: number): QualityDecision {
  if (!summary || summary.samples < 60) return "keep";
  if (summary.averageFps >= PERFORMANCE_BUDGET.lowFps) return "keep";
  if (currentDpr > 1) return "lower-dpr";
  return summary.averageFps < PERFORMANCE_BUDGET.fallbackFps ? "suggest-2d" : "keep";
}

export interface RenderInfo {
  calls: number;
  triangles: number;
}

export function budgetViolations(info: RenderInfo): string[] {
  const errors: string[] = [];
  if (info.calls > PERFORMANCE_BUDGET.maxDrawCalls) {
    errors.push(`${info.calls} appels de dessin (plafond ${PERFORMANCE_BUDGET.maxDrawCalls})`);
  }
  if (info.triangles > PERFORMANCE_BUDGET.maxTriangles) {
    errors.push(`${info.triangles} triangles (plafond ${PERFORMANCE_BUDGET.maxTriangles})`);
  }
  return errors;
}
