/**
 * Décors réutilisables : un type de voirie (carrefour, carrefour en T, ligne
 * droite) est transformé en géométrie pure (rectangles), dessinée à
 * l'identique par la vue 3D et par la vue 2D. Tout est déterministe.
 *
 * Repère : x vers l'est, z vers le sud ; un rectangle est donné par son
 * centre (x, z) et ses dimensions (w selon x, d selon z).
 */

export type Direction = "nord" | "sud" | "est" | "ouest";

export type Layout =
  | { kind: "carrefour"; roadWidth: number; armLength: number }
  /** Route principale est-ouest, branche vers `branch` (nord ou sud). */
  | { kind: "carrefour-en-t"; roadWidth: number; armLength: number; branch: "nord" | "sud" }
  | { kind: "ligne-droite"; roadWidth: number; armLength: number; axis: "nord-sud" | "est-ouest" };

export const LAYOUT_KINDS = ["carrefour", "carrefour-en-t", "ligne-droite"] as const satisfies ReadonlyArray<Layout["kind"]>;

export interface Rect {
  x: number;
  z: number;
  w: number;
  d: number;
}

export interface Building extends Rect {
  h: number;
}

export interface LayoutGeometry {
  roads: Rect[];
  sidewalks: Rect[];
  markings: Rect[];
  buildings: Building[];
  trees: Array<{ x: number; z: number }>;
  /** Zone où les trajectoires se croisent (null : aucune intersection). */
  junction: Rect | null;
  /** Demi-côté du terrain. */
  extent: number;
}

export const SIDEWALK_WIDTH = 2.5;

const VECTORS: Record<Direction, readonly [number, number]> = {
  nord: [0, -1],
  sud: [0, 1],
  est: [1, 0],
  ouest: [-1, 0],
};

export function armsOf(layout: Layout): Direction[] {
  switch (layout.kind) {
    case "carrefour":
      return ["nord", "sud", "est", "ouest"];
    case "carrefour-en-t":
      return ["est", "ouest", layout.branch];
    case "ligne-droite":
      return layout.axis === "nord-sud" ? ["nord", "sud"] : ["est", "ouest"];
  }
}

/** Rectangle couvrant [x1, x2] × [z1, z2]. */
const box = (x1: number, x2: number, z1: number, z2: number): Rect => ({
  x: (x1 + x2) / 2,
  z: (z1 + z2) / 2,
  w: Math.abs(x2 - x1),
  d: Math.abs(z2 - z1),
});

/** Segment le long d'un bras, entre les distances `from` et `to` du centre, décalé latéralement. */
function along(dir: Direction, from: number, to: number, offset: number, width: number): Rect {
  const [ux, uz] = VECTORS[dir];
  const mid = (from + to) / 2;
  const length = to - from;
  // Axe latéral : perpendiculaire au bras.
  const cx = ux * mid + uz * offset;
  const cz = uz * mid + ux * offset;
  return ux !== 0 ? { x: cx, z: cz, w: length, d: width } : { x: cx, z: cz, w: width, d: length };
}

export function overlaps(a: Rect, b: Rect, margin = 0): boolean {
  return (
    Math.abs(a.x - b.x) < (a.w + b.w) / 2 + margin - 1e-9 && Math.abs(a.z - b.z) < (a.d + b.d) / 2 + margin - 1e-9
  );
}

export function layoutGeometry(layout: Layout): LayoutGeometry {
  const W = layout.roadWidth;
  const L = layout.armLength;
  const half = W / 2;
  const sw = SIDEWALK_WIDTH;
  const arms = armsOf(layout);
  const has = (d: Direction) => arms.includes(d);

  // Chaussée : carré central + bras.
  const center = box(-half, half, -half, half);
  const roads: Rect[] = [center, ...arms.map((dir) => along(dir, half, L, 0, W))];

  // Trottoirs : le long des bras, aux quatre angles, et le long des côtés sans bras.
  const sidewalks: Rect[] = [];
  for (const dir of arms) {
    for (const side of [-1, 1]) sidewalks.push(along(dir, half + sw, L, side * (half + sw / 2), sw));
  }
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      sidewalks.push(box(sx * half, sx * (half + sw), sz * half, sz * (half + sw)));
    }
  }
  for (const dir of (["nord", "sud", "est", "ouest"] as const).filter((d) => !has(d))) {
    sidewalks.push(along(dir, half, half + sw, 0, W));
  }

  // Marquage axial discontinu (schématique).
  const markings: Rect[] = [];
  const straight = layout.kind === "ligne-droite";
  for (const dir of arms) {
    for (let d = straight ? 0 : half + 2; d + 3 <= L; d += 6) {
      const r = along(dir, d, d + 3, 0, 0.15);
      markings.push(r);
    }
  }

  // Immeubles et arbres : derrière les trottoirs, jamais sur la voirie.
  const reserved = roads.map((r) => ({ ...r, w: r.w + 2 * (sw + 1), d: r.d + 2 * (sw + 1) }));
  const buildings: Building[] = [];
  const tryBuilding = (r: Rect, seed: number) => {
    if (Math.abs(r.x) + r.w / 2 > L || Math.abs(r.z) + r.d / 2 > L) return;
    if (reserved.some((z) => overlaps(r, z)) || buildings.some((b) => overlaps(r, b, 0.5))) return;
    buildings.push({ ...r, h: 6 + (seed % 4) * 2.5 });
  };
  let seed = 0;
  const depth = 8;
  for (const dir of ["nord", "sud", "est", "ouest"] as const) {
    for (const side of [-1, 1]) {
      for (let d = half + sw + 1; d + 9 <= L; d += 11) {
        seed += 3;
        tryBuilding(along(dir, d, d + 9, side * (half + sw + 1 + depth / 2), depth), seed);
      }
    }
  }

  const trees: Array<{ x: number; z: number }> = [];
  for (const dir of arms) {
    for (const side of [-1, 1]) {
      for (let d = half + 8; d <= L - 4; d += 12) {
        const r = along(dir, d, d, side * (half + 1.2), 0);
        trees.push({ x: r.x, z: r.z });
      }
    }
  }

  return {
    roads,
    sidewalks,
    markings,
    buildings,
    trees,
    junction: straight ? null : center,
    extent: L + 20,
  };
}
