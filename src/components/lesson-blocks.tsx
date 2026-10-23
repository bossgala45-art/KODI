import Image from "next/image";
import { Icon } from "@/components/icons";
import { Card } from "@/components/ui/display";
import type { LessonBlock } from "@/lib/content/schema";

const CAMERA_LABELS = {
  conducteur: "vue conducteur",
  aerienne: "vue aérienne",
  arriere: "vue arrière",
  usager: "vue d’un autre usager",
} as const;

function Block({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case "text":
      return (
        <section className="space-y-3">
          {block.title && <h2 className="text-lg font-bold">{block.title}</h2>}
          {block.paragraphs.map((p, i) => (
            <p key={i} className="leading-relaxed text-pretty">
              {p}
            </p>
          ))}
        </section>
      );
    case "image":
      return (
        <figure>
          <Image
            src={block.src}
            alt={block.alt}
            width={block.width}
            height={block.height}
            unoptimized={block.src.endsWith(".svg")}
            className="h-auto w-full rounded-2xl border border-line"
          />
          <figcaption className="mt-2 text-sm text-muted">
            {block.caption}
            <span className="block text-xs">Crédit : {block.credit}</span>
          </figcaption>
        </figure>
      );
    case "video":
      return (
        <Card className="bg-surface-2">
          <h2 className="flex items-center gap-2 font-bold">
            <Icon name="play" size={20} className="text-brand-text" />
            {block.title}
          </h2>
          {block.src ? (
            <video controls preload="metadata" poster={block.poster} className="mt-3 w-full rounded-2xl">
              <source src={block.src} />
            </video>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Vidéo à produire : elle n’existe pas encore. La transcription prévue est disponible ci-dessous.
            </p>
          )}
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-semibold text-brand-text">Transcription</summary>
            <p className="mt-2 leading-relaxed">{block.transcript}</p>
          </details>
          {block.credit && <p className="mt-2 text-xs text-muted">Crédit : {block.credit}</p>}
        </Card>
      );
    case "simulation":
      return (
        <Card className="bg-surface-2">
          <h2 className="flex items-center gap-2 font-bold">
            <Icon name="cube" size={20} className="text-brand-text" />
            Simulation 3D
            {block.camera && <span className="font-normal text-muted">({CAMERA_LABELS[block.camera]})</span>}
          </h2>
          <p className="mt-2 text-sm">{block.instructions}</p>
          <p className="mt-2 flex items-start gap-2 text-sm text-muted">
            <Icon name="lock" size={16} className="mt-0.5 shrink-0" />
            Scène prévue (« {block.sceneSlug} »), pas encore disponible : les scènes 3D arriveront dans une phase
            ultérieure.
          </p>
        </Card>
      );
  }
}

export function LessonBlocks({ blocks }: { blocks: readonly LessonBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
