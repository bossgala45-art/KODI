import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/content-status";
import { Icon } from "@/components/icons";
import { Alert, PageHeader } from "@/components/ui/display";
import { PLANNED_LESSON_TOTAL, UNIVERSES, lessonsOf } from "@/content/catalog";

export const metadata: Metadata = { title: "Apprendre" };

export default function LearnPage() {
  const written = UNIVERSES.reduce((sum, u) => sum + lessonsOf(u.id).length, 0);

  return (
    <>
      <PageHeader
        title="Apprendre"
        description={`10 univers, construits sur les thèmes de l’examen du code, et ${PLANNED_LESSON_TOTAL} leçons prévues.`}
      />

      <Alert tone="info" role="note" title="Programme en cours de rédaction" className="mb-6">
        {written} leçon{written > 1 ? "s" : ""} sur {PLANNED_LESSON_TOTAL} rédigée{written > 1 ? "s" : ""}, à
        titre de démonstration et non validée{written > 1 ? "s" : ""}. Chaque leçon sera relue et rattachée à
        une source réglementaire avant d’être publiée.
      </Alert>

      <ul className="grid gap-3 sm:grid-cols-2">
        {UNIVERSES.map((universe) => {
          const count = lessonsOf(universe.id).length;
          return (
            <li key={universe.id}>
              <Link
                href={`/apprendre/${universe.slug}`}
                className="flex h-full items-center gap-4 rounded-3xl border border-line bg-surface p-4 shadow-card transition-colors hover:border-line-strong"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-lg font-bold text-brand-text">
                  {universe.position}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{universe.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">
                    {count} / {universe.plannedLessons} leçons rédigées
                  </span>
                  <StatusBadge status={universe.status} className="mt-1.5" />
                </span>
                <Icon name="chevron-right" className="shrink-0 text-muted" />
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
