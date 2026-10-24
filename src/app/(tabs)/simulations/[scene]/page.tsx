import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/content-status";
import { Icon } from "@/components/icons";
import { SourceList } from "@/components/quiz-runner";
import { ScenePlayer } from "@/components/simulation/scene-player";
import { PageHeader } from "@/components/ui/display";
import { LESSONS, lessonHref, sourceLink } from "@/content/catalog";
import { SCENES, sceneBySlug } from "@/content/scenes";
import { sceneAccess } from "@/content/scenes/plan";
import { PremiumGate } from "@/components/billing/premium-gate";

export function generateStaticParams() {
  return SCENES.map((s) => ({ scene: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/simulations/[scene]">): Promise<Metadata> {
  const { scene } = await params;
  return { title: sceneBySlug(scene)?.title ?? "Scène introuvable" };
}

export default async function ScenePage({ params }: PageProps<"/simulations/[scene]">) {
  const { scene: slug } = await params;
  const scene = sceneBySlug(slug);
  if (!scene) notFound();
  const lesson = LESSONS.find((l) => l.id === scene.lessonId);

  return (
    <>
      {lesson && (
        <Link href={lessonHref(lesson)} className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-text">
          <Icon name="chevron-left" size={16} />
          {lesson.title}
        </Link>
      )}
      <PageHeader title={scene.title} description={scene.summary} />
      <div className="-mt-3 mb-5">
        <StatusBadge status={scene.status} />
      </div>
      {sceneAccess(scene.slug) === "decouverte" ? (
        <ScenePlayer scene={scene} />
      ) : (
        <PremiumGate title="Scène réservée à Premium" description="Les scènes de découverte sont gratuites ; toutes les autres scènes font partie de l’offre Premium.">
          <ScenePlayer scene={scene} />
        </PremiumGate>
      )}
      <section aria-labelledby="sources-scene" className="mt-8 text-sm">
        <h2 id="sources-scene" className="font-bold">
          Sources
        </h2>
        <SourceList sources={scene.sources.map(sourceLink)} />
      </section>
    </>
  );
}
