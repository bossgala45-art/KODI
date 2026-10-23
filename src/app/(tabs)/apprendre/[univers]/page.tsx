import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/content-status";
import { Icon } from "@/components/icons";
import { CompetenceMastery, LessonDoneMark } from "@/components/learning";
import { PageHeader, SectionTitle } from "@/components/ui/display";
import { UNIVERSES, lessonsOf, universeBySlug } from "@/content/catalog";

export function generateStaticParams() {
  return UNIVERSES.map((u) => ({ univers: u.slug }));
}

export async function generateMetadata({ params }: PageProps<"/apprendre/[univers]">): Promise<Metadata> {
  const { univers } = await params;
  return { title: universeBySlug(univers)?.title ?? "Univers introuvable" };
}

export default async function UniversePage({ params }: PageProps<"/apprendre/[univers]">) {
  const { univers } = await params;
  const universe = universeBySlug(univers);
  if (!universe) notFound();
  const lessons = lessonsOf(universe.id);
  const missing = Math.max(0, universe.plannedLessons - lessons.length);

  return (
    <>
      <Link href="/apprendre" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-text">
        <Icon name="chevron-left" size={16} />
        Tous les univers
      </Link>
      <PageHeader title={universe.title} description={universe.description} aside={<StatusBadge status={universe.status} />} />

      <section aria-labelledby="lecons">
        <SectionTitle id="lecons">
          Leçons ({lessons.length} / {universe.plannedLessons})
        </SectionTitle>
        <ol className="space-y-3">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <Link
                href={`/apprendre/${universe.slug}/${lesson.slug}`}
                className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 shadow-card transition-colors hover:border-line-strong"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-soft font-bold text-brand-text">
                  {lesson.position}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{lesson.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{lesson.summary}</span>
                  <span className="mt-1.5 flex flex-wrap gap-2">
                    <StatusBadge status={lesson.status} demo={lesson.demo} />
                    <LessonDoneMark lessonId={lesson.id} />
                  </span>
                </span>
                <Icon name="chevron-right" className="shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ol>
        {missing > 0 && (
          <p className="mt-3 flex items-center gap-2 rounded-2xl border border-dashed border-line-strong p-4 text-sm text-muted">
            <Icon name="lock" size={16} />
            {missing} leçon{missing > 1 ? "s" : ""} prévue{missing > 1 ? "s" : ""}, pas encore rédigée
            {missing > 1 ? "s" : ""}.
          </p>
        )}
      </section>

      <section aria-labelledby="competences" className="mt-8">
        <SectionTitle id="competences">Compétences</SectionTitle>
        <CompetenceMastery universeId={universe.id} />
      </section>
    </>
  );
}
