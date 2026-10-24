"use client";

/**
 * Version 2D de secours : vue de dessus en SVG, dessinée avec la même
 * géométrie de voirie et les mêmes trajectoires que la 3D. Fonctionne sans
 * WebGL et sur les appareils lents.
 */
import { useMemo } from "react";
import { layoutGeometry, type Rect } from "@/lib/simulation/layout";
import { actorSize, type Actor, type SceneDefinition } from "@/lib/simulation/scene";
import { sampleTrajectory } from "@/lib/simulation/timeline";

const VIEW = 30;
const rect = (r: Rect) => ({ x: r.x - r.w / 2, y: r.z - r.d / 2, width: r.w, height: r.d });

function ActorMark({ actor, selected }: { actor: Actor; selected: boolean }) {
  const [length, width] = actorSize(actor);
  const ring = selected && <circle r={Math.max(length * 0.7, 1)} fill="none" stroke="#ffd400" strokeWidth={0.5} />;
  if (actor.kind === "pieton") {
    return (
      <>
        {ring}
        <circle r={0.45} fill={actor.color} stroke="#101b30" strokeWidth={0.1} />
      </>
    );
  }
  return (
    <>
      {ring}
      <rect x={-width / 2} y={-length / 2} width={width} height={length} rx={0.3} fill={actor.color} stroke="#101b30" strokeWidth={0.1} />
      {actor.kind !== "velo" && (
        // Pare-brise : indique l'avant du véhicule.
        <rect x={-width / 2 + 0.2} y={-length / 2 + 0.9} width={width - 0.4} height={0.7} fill="#1d2a40" />
      )}
    </>
  );
}

export function Scene2D({
  scene,
  t,
  selected,
  onSelect,
}: {
  scene: SceneDefinition;
  t: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const geometry = useMemo(() => layoutGeometry(scene.layout), [scene.layout]);
  const view = Math.min(VIEW, geometry.extent);
  return (
    <svg
      viewBox={`${-view} ${-view} ${view * 2} ${view * 2}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Vue 2D de dessus de la scène"
      className="block h-full w-full"
      onClick={() => onSelect(null)}
    >
      <rect x={-geometry.extent} y={-geometry.extent} width={geometry.extent * 2} height={geometry.extent * 2} fill="#9fbf8a" />
      {geometry.buildings.map((b, i) => (
        <rect key={`b${i}`} {...rect(b)} fill="#d8cbb8" />
      ))}
      {geometry.sidewalks.map((r, i) => (
        <rect key={`s${i}`} {...rect(r)} fill="#c9ced6" />
      ))}
      {geometry.roads.map((r, i) => (
        <rect key={`r${i}`} {...rect(r)} fill="#5b6472" />
      ))}
      {geometry.markings.map((r, i) => (
        <rect key={`m${i}`} {...rect(r)} fill="#f4f7fb" />
      ))}
      {geometry.trees.map((tree, i) => (
        <circle key={`t${i}`} cx={tree.x} cy={tree.z} r={1.1} fill="#4e8a4a" />
      ))}

      {scene.props.map((prop) => (
        <g
          key={prop.id}
          transform={`translate(${prop.x} ${prop.z})`}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(prop.id);
          }}
          className="cursor-pointer"
        >
          {selected === prop.id && <circle r={1.4} fill="none" stroke="#ffd400" strokeWidth={0.4} />}
          <rect x={-0.8} y={-0.25} width={1.6} height={0.5} fill="#1f3f8f" stroke="#ffffff" strokeWidth={0.08} />
        </g>
      ))}

      {scene.actors.map((actor) => {
        const s = sampleTrajectory(actor.trajectory, t);
        const deg = (s.heading * 180) / Math.PI;
        return (
          <g
            key={actor.id}
            transform={`translate(${s.x.toFixed(3)} ${s.z.toFixed(3)}) rotate(${deg.toFixed(2)})`}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(actor.id);
            }}
            className="cursor-pointer"
          >
            <ActorMark actor={actor} selected={selected === actor.id} />
          </g>
        );
      })}
      {scene.actors
        .filter((a) => a.isLearner)
        .map((actor) => {
          const s = sampleTrajectory(actor.trajectory, t);
          return (
            <text key="label" x={s.x + 2.6} y={s.z + 0.6} fontSize={1.8} fontWeight={700} fill="#101b30">
              Vous
            </text>
          );
        })}
    </svg>
  );
}
