"use client";

/**
 * Rendu 3D d'une scène (Three.js / React Three Fiber).
 *
 * MODÈLES PROVISOIRES : véhicules, bâtiments et arbres sont des formes
 * géométriques simples créées ici, sans fichier 3D externe.
 *
 * Optimisations pour Safari sur iPhone : densité de pixels plafonnée à 2,
 * pas d'ombres portées ni de post-traitement, matériaux Lambert (éclairage
 * simple), éléments répétés en instances (un seul appel de dessin), rendu à
 * la demande quand la scène est en pause, texture unique de 256 × 64 pixels.
 */
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { memo, useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import type {
  Group,
  InstancedMesh,
  PerspectiveCamera} from "three";
import {
  CanvasTexture,
  Color,
  Object3D,
  SRGBColorSpace,
  Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Actor, SceneDefinition, SceneProp } from "@/lib/simulation/scene";
import { learnerOf } from "@/lib/simulation/scene";
import {
  createFrameStats,
  decideQuality,
  recordFrame,
  summarize,
  targetDpr,
  type FrameSummary,
} from "@/lib/simulation/performance";
import { cameraAt, sampleTrajectory } from "@/lib/simulation/timeline";

export type CameraMode = "conducteur" | "aerienne" | "libre" | "explicative";

export interface PerfReport {
  summary: FrameSummary | null;
  calls: number;
  triangles: number;
  dpr: number;
}

interface Scene3DProps {
  scene: SceneDefinition;
  /** Temps courant, lu à chaque image (pas de rendu React par image). */
  timeRef: RefObject<number>;
  playing: boolean;
  /** Change quand la scène est en pause et qu'il faut redessiner (déplacement, sélection…). */
  renderKey: string;
  mode: CameraMode;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onPerf: (report: PerfReport) => void;
  onSlow: () => void;
  onContextLost: () => void;
}

const COLORS = {
  grass: "#9fbf8a",
  road: "#5b6472",
  sidewalk: "#c9ced6",
  marking: "#f4f7fb",
  building: "#d8cbb8",
  roof: "#8f6f5a",
  trunk: "#7a5a3c",
  foliage: "#4e8a4a",
  glass: "#1d2a40",
  wheel: "#1a1a1a",
  highlight: "#ffd400",
};

// ---------------------------------------------------------------------------
// Décor
// ---------------------------------------------------------------------------
function Ground({ scene }: { scene: SceneDefinition }) {
  const L = scene.roadLength;
  const W = scene.roadWidth;
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.02}>
        <planeGeometry args={[L + 40, L + 40]} />
        <meshLambertMaterial color={COLORS.grass} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[W, L]} />
        <meshLambertMaterial color={COLORS.road} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.001}>
        <planeGeometry args={[L, W]} />
        <meshLambertMaterial color={COLORS.road} />
      </mesh>
    </group>
  );
}

/** Instances d'une même boîte : un seul appel de dessin pour N éléments. */
function Boxes({ items, color }: { items: ReadonlyArray<{ p: [number, number, number]; s: [number, number, number] }>; color: string }) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new Object3D();
    items.forEach((item, i) => {
      o.position.set(...item.p);
      o.scale.set(...item.s);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial color={color} />
    </instancedMesh>
  );
}

function Decor({ scene }: { scene: SceneDefinition }) {
  const W = scene.roadWidth;
  const half = scene.roadLength / 2;
  const { sidewalks, buildings, markings, trunks, crowns } = useMemo(() => {
    const sidewalks: Array<{ p: [number, number, number]; s: [number, number, number] }> = [];
    const buildings: typeof sidewalks = [];
    const markings: typeof sidewalks = [];
    const trunks: typeof sidewalks = [];
    const crowns: typeof sidewalks = [];
    const sw = 2.5; // largeur du trottoir
    const edge = W / 2;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const len = half - edge;
        // Trottoirs le long des deux routes, de chaque côté du carrefour.
        sidewalks.push({ p: [sx * (edge + sw / 2), 0.07, sz * (edge + len / 2)], s: [sw, 0.15, len] });
        sidewalks.push({ p: [sx * (edge + sw + (len - sw) / 2), 0.07, sz * (edge + sw / 2)], s: [len - sw, 0.15, sw] });
        // Immeubles bas (déterministes, hauteurs variées).
        for (let i = 0; i < 4; i += 1) {
          const h = 6 + ((i * 7 + (sx + 2) * 3 + (sz + 2) * 5) % 4) * 2.5;
          const d = edge + sw + 4 + i * 11;
          buildings.push({ p: [sx * (edge + sw + 5), h / 2, sz * d], s: [8, h, 9] });
          if (i > 0) buildings.push({ p: [sx * d, h / 2 + 1, sz * (edge + sw + 5)], s: [9, h + 2, 8] });
        }
        // Arbres d'alignement.
        for (let i = 0; i < 3; i += 1) {
          const d = edge + 8 + i * 12;
          trunks.push({ p: [sx * (edge + 1.2), 1.2, sz * d], s: [0.3, 2.4, 0.3] });
          crowns.push({ p: [sx * (edge + 1.2), 3.2, sz * d], s: [2.2, 2.2, 2.2] });
        }
      }
    }
    // Lignes axiales discontinues (schématiques), hors du carrefour.
    for (let d = edge + 2; d < half; d += 6) {
      for (const s of [-1, 1]) {
        markings.push({ p: [0, 0.02, s * (d + 1.5)], s: [0.15, 0.01, 3] });
        markings.push({ p: [s * (d + 1.5), 0.02, 0], s: [3, 0.01, 0.15] });
      }
    }
    return { sidewalks, buildings, markings, trunks, crowns };
  }, [W, half]);

  return (
    <group>
      <Boxes items={sidewalks} color={COLORS.sidewalk} />
      <Boxes items={buildings} color={COLORS.building} />
      <Boxes items={markings} color={COLORS.marking} />
      <Boxes items={trunks} color={COLORS.trunk} />
      <Boxes items={crowns} color={COLORS.foliage} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Éléments sélectionnables
// ---------------------------------------------------------------------------
function SelectionRing({ radius }: { radius: number }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.05}>
      <ringGeometry args={[radius, radius + 0.35, 32]} />
      <meshBasicMaterial color={COLORS.highlight} />
    </mesh>
  );
}

const Car = memo(function Car({
  actor,
  timeRef,
  selected,
  onSelect,
}: {
  actor: Actor;
  timeRef: RefObject<number>;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<Group>(null);
  const [length, width, height] = actor.size;
  const color = useMemo(() => new Color(actor.color), [actor.color]);

  useFrame(() => {
    const group = ref.current;
    if (!group) return;
    const s = sampleTrajectory(actor.trajectory, timeRef.current);
    group.position.set(s.x, 0, s.z);
    group.rotation.y = -s.heading;
  });

  const wheels = [
    [-width / 2, -length * 0.32],
    [width / 2, -length * 0.32],
    [-width / 2, length * 0.32],
    [width / 2, length * 0.32],
  ] as const;

  return (
    <group
      ref={ref}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onSelect(actor.id);
      }}
    >
      <mesh position-y={0.35 + height * 0.25}>
        <boxGeometry args={[width, height * 0.5, length]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.35 + height * 0.68, 0.25]}>
        <boxGeometry args={[width * 0.86, height * 0.4, length * 0.5]} />
        <meshLambertMaterial color={COLORS.glass} />
      </mesh>
      {wheels.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.33, z]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.33, 0.33, 0.25, 10]} />
          <meshLambertMaterial color={COLORS.wheel} />
        </mesh>
      ))}
      {selected && <SelectionRing radius={length * 0.62} />}
    </group>
  );
});

function plateTexture(text: string): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#1f3f8f";
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 56);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 33);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function StreetPlate({ prop, selected, onSelect }: { prop: SceneProp; selected: boolean; onSelect: (id: string) => void }) {
  const texture = useMemo(() => plateTexture(prop.text), [prop.text]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group
      position={[prop.x, 0, prop.z]}
      rotation-y={-prop.rotation}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onSelect(prop.id);
      }}
    >
      <mesh position-y={1.3}>
        <cylinderGeometry args={[0.05, 0.05, 2.6, 6]} />
        <meshLambertMaterial color="#6b7280" />
      </mesh>
      <mesh position={[0, 2.5, 0.06]}>
        <planeGeometry args={[1.6, 0.4]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {selected && <SelectionRing radius={0.9} />}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Caméras
// ---------------------------------------------------------------------------
const AERIAL: { position: [number, number, number]; target: [number, number, number] } = {
  position: [0, 46, 16],
  target: [0, 0, 0],
};
const FREE_START: [number, number, number] = [0, 30, 34];

function CameraRig({ scene, timeRef, mode }: { scene: SceneDefinition; timeRef: RefObject<number>; mode: CameraMode }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const learner = useMemo(() => learnerOf(scene), [scene]);
  const controls = useRef<OrbitControls | null>(null);
  const look = useMemo(() => new Vector3(), []);

  useEffect(() => {
    if (mode !== "libre") return;
    camera.position.set(...FREE_START);
    const orbit = new OrbitControls(camera, gl.domElement);
    orbit.target.set(0, 0, 0);
    orbit.enableDamping = true;
    orbit.minDistance = 6;
    orbit.maxDistance = 90;
    orbit.maxPolarAngle = Math.PI / 2 - 0.05; // jamais sous le sol
    orbit.update();
    const onChange = () => invalidate();
    orbit.addEventListener("change", onChange);
    controls.current = orbit;
    invalidate();
    return () => {
      orbit.removeEventListener("change", onChange);
      orbit.dispose();
      controls.current = null;
    };
  }, [mode, camera, gl, invalidate]);

  useFrame(() => {
    const t = timeRef.current;
    if (mode === "libre") {
      controls.current?.update();
      return;
    }
    if (mode === "conducteur") {
      const s = sampleTrajectory(learner.trajectory, t);
      const fx = Math.sin(s.heading);
      const fz = -Math.cos(s.heading);
      // Place du conducteur : à gauche (conduite à droite), à hauteur des yeux.
      const side = -0.4;
      camera.position.set(s.x + fz * -side + fx * 0.4, 1.3, s.z - fx * -side + fz * 0.4);
      look.set(s.x + fx * 20, 0.9, s.z + fz * 20);
      camera.lookAt(look);
      return;
    }
    const pose = mode === "aerienne" ? AERIAL : cameraAt(scene.explainCamera, t);
    camera.position.set(...pose.position);
    look.set(...pose.target);
    camera.lookAt(look);
  });
  return null;
}

// ---------------------------------------------------------------------------
// Performance
// ---------------------------------------------------------------------------
function PerfProbe({ onPerf, onSlow }: { onPerf: (r: PerfReport) => void; onSlow: () => void }) {
  const stats = useRef(createFrameStats());
  const elapsed = useRef(0);
  const slowSent = useRef(false);
  const gl = useThree((s) => s.gl);
  const setDpr = useThree((s) => s.setDpr);
  const viewport = useThree((s) => s.viewport);

  useFrame((_, delta) => {
    stats.current = recordFrame(stats.current, delta);
    elapsed.current += delta;
    if (elapsed.current < 1) return;
    elapsed.current = 0;
    const summary = summarize(stats.current);
    const dpr = viewport.dpr;
    onPerf({ summary, calls: gl.info.render.calls, triangles: gl.info.render.triangles, dpr });
    const decision = decideQuality(summary, dpr);
    if (decision === "lower-dpr") {
      setDpr(1);
      stats.current = createFrameStats();
    } else if (decision === "suggest-2d" && !slowSent.current) {
      slowSent.current = true;
      onSlow();
    }
  });
  return null;
}

/** Redessine une image quand la scène est en pause et que quelque chose change. */
function Invalidator({ renderKey }: { renderKey: string }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [renderKey, invalidate]);
  return null;
}

// ---------------------------------------------------------------------------
// Scène complète
// ---------------------------------------------------------------------------
export const Scene3D = memo(function Scene3D({
  scene,
  timeRef,
  playing,
  renderKey,
  mode,
  selected,
  onSelect,
  onPerf,
  onSlow,
  onContextLost,
}: Scene3DProps) {
  const dpr = useMemo(() => targetDpr(typeof window === "undefined" ? 1 : window.devicePixelRatio), []);
  return (
    <Canvas
      dpr={dpr}
      frameloop={playing || mode === "libre" ? "always" : "demand"}
      gl={{ antialias: true, alpha: false, stencil: false, powerPreference: "default" }}
      camera={{ fov: 55, near: 0.1, far: 400, position: AERIAL.position }}
      onPointerMissed={() => onSelect(null)}
      onCreated={({ gl, scene: three }) => {
        three.background = new Color("#cfe3f5");
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onContextLost();
        });
      }}
      aria-label="Vue 3D de la scène"
      role="img"
    >
      <hemisphereLight args={["#ffffff", "#7a8a6a", 1.6]} />
      <directionalLight position={[30, 50, 20]} intensity={1.4} />
      <Ground scene={scene} />
      <Decor scene={scene} />
      {scene.actors.map((actor) => (
        <Car key={actor.id} actor={actor} timeRef={timeRef} selected={selected === actor.id} onSelect={onSelect} />
      ))}
      {scene.props.map((prop) => (
        <StreetPlate key={prop.id} prop={prop} selected={selected === prop.id} onSelect={onSelect} />
      ))}
      <CameraRig scene={scene} timeRef={timeRef} mode={mode} />
      <PerfProbe onPerf={onPerf} onSlow={onSlow} />
      <Invalidator renderKey={`${renderKey}|${mode}|${selected ?? ""}`} />
    </Canvas>
  );
});

export default Scene3D;
