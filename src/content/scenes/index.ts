/** Scènes de simulation disponibles. */
import type { SceneDefinition } from "@/lib/simulation/scene";
import { INTERSECTION_SANS_SIGNALISATION } from "@/content/scenes/intersection-sans-signalisation";

export const SCENES: readonly SceneDefinition[] = [INTERSECTION_SANS_SIGNALISATION];

export function sceneBySlug(slug: string): SceneDefinition | undefined {
  return SCENES.find((s) => s.slug === slug);
}
