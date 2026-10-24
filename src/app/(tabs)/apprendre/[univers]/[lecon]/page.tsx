import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/content-status";
import { Icon } from "@/components/icons";
import { LessonPractice } from "@/components/learning";
import { PremiumGate } from "@/components/billing/premium-gate";
import { LessonBlocks } from "@/components/lesson-blocks";
import { SourceList } from "@/components/quiz-runner";
import { Alert, Badge, PageHeader } from "@/components/ui/display";
import {
  LESSONS,
  competenceById,
  lessonBySlug,
  questionsOfLesson,
  sourceLink,
  universeById,
  universeBySlug,
} from "@/content/catalog";

export function generateStaticParams() {
  return LESSONS.flatMap((lesson) => {
    const universe = universeById(lesson.universeId);
    return universe ? [{ univers: universe.slug, lecon: lesson.slug }] : [];
  });
}

function resolve(univers: string, lecon: string) {
  const universe = universeBySlug(univers);
  const lesson = universe ? lessonBySlug(universe.id, lecon) : undefined;
  return universe && lesson ? { universe, lesson } : null;
}

export async function generateMetadata({ params }: PageProps<"/apprendre/[univers]/[lecon]">): Promise<Metadata> {
  const { univers, lecon } = await params;
  return { title: resolve(univers, lecon)?.lesson.title ?? "Leçon introuvable" };
}

export default async function LessonPage({ params }: PageProps<"/apprendre/[univers]/[lecon]">) {
  const { univers, lecon } = await params;
  const found = resolve(univers, lecon);
  if (!found) notFound();
  const { universe, lesson } = found;
  const questionIds = questionsOfLesson(lesson.id).map((q) => q.id);

  return (
    <article>
      <Link
        href={`/apprendre/${universe.slug}`}
        className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-text"
      >
        <Icon name="chevron-left" size={16} />
        {universe.title}
      </Link>
      <PageHeader title={lesson.title} description={lesson.summary} />
      <div className="-mt-3 mb-5 flex flex-wrap gap-2">
        <StatusBadge status={lesson.status} demo={lesson.demo} />
        {lesson.access === "premium" && <Badge tone="brand">Premium</Badge>}
      </div>

      {lesson.status !== "valide" && (
        <Alert tone="info" role="note" className="mb-6">
          {lesson.demo
            ? "Leçon de démonstration, rédigée pour montrer le fonctionnement du moteur. Elle n’a pas été validée par une personne compétente : ne l’utilisez pas comme référence."
            : "Leçon pas encore validée par une personne compétente."}
        </Alert>
      )}

      {lesson.access === "premium" ? (
        <PremiumGate title="Leçon Premium" description="Les cours essentiels sont gratuits ; cette leçon fait partie de l’accès complet aux cours de l’offre Premium.">
          <LessonBlocks blocks={lesson.blocks} />
        </PremiumGate>
      ) : (
        <LessonBlocks blocks={lesson.blocks} />
      )}

      <section aria-labelledby="sources-lecon" className="mt-8 text-sm">
        <h2 id="sources-lecon" className="font-bold">
          Compétences et sources
        </h2>
        <p className="mt-1 text-muted">
          {lesson.competenceIds.map((id) => competenceById(id)?.title ?? id).join(" · ")}
        </p>
        <SourceList sources={lesson.sources.map(sourceLink)} />
      </section>

      <div className="mt-8">
        <LessonPractice lessonId={lesson.id} questionIds={questionIds} />
      </div>
    </article>
  );
}
