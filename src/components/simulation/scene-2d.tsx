"use client";

/**
 * Version 2D de secours : vue de dessus en SVG, calculée avec les mêmes
 * trajectoires que la 3D. Fonctionne sans WebGL et sur les appareils lents.
 */
import type { SceneDefinition } from "@/lib/simulation/scene";
import { sampleTrajectory } from "@/lib/simulation/timeline";

const VIEW = 30;

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
  const W = scene.roadWidth;
  const L = scene.roadLength;
  return (
    <svg
      viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Vue 2D de dessus de la scène"
      className="block h-full w-full"
      onClick={() => onSelect(null)}
    >
      <rect x={-VIEW} y={-VIEW} width={VIEW * 2} height={VIEW * 2} fill="#9fbf8a" />
      {/* Trottoirs puis chaussées */}
      <rect x={-W / 2 - 2.5} y={-L / 2} width={W + 5} height={L} fill="#c9ced6" />
      <rect x={-L / 2} y={-W / 2 - 2.5} width={L} height={W + 5} fill="#c9ced6" />
      <rect x={-W / 2} y={-L / 2} width={W} height={L} fill="#5b6472" />
      <rect x={-L / 2} y={-W / 2} width={L} height={W} fill="#5b6472" />
      <g stroke="#f4f7fb" strokeWidth={0.15} strokeDasharray="3 3">
        <line x1={0} y1={-L / 2} x2={0} y2={-W / 2 - 1} />
        <line x1={0} y1={W / 2 + 1} x2={0} y2={L / 2} />
        <line x1={-L / 2} y1={0} x2={-W / 2 - 1} y2={0} />
        <line x1={W / 2 + 1} y1={0} x2={L / 2} y2={0} />
      </g>

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
        const [length, width] = actor.size;
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
            {selected === actor.id && <circle r={length * 0.7} fill="none" stroke="#ffd400" strokeWidth={0.5} />}
            <rect x={-width / 2} y={-length / 2} width={width} height={length} rx={0.4} fill={actor.color} stroke="#101b30" strokeWidth={0.1} />
            {/* Pare-brise : indique l'avant du véhicule */}
            <rect x={-width / 2 + 0.2} y={-length / 2 + 0.9} width={width - 0.4} height={0.7} fill="#1d2a40" />
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
