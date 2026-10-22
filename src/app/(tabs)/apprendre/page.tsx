import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { DemoBadge, EmptyState, PageHeader, ProgressBar, SectionTitle } from "@/components/ui/display";
import { DEMO_UNIVERSES } from "@/content/demo";
import { formatPercent } from "@/lib/history";

export const metadata: Metadata = { title: "Apprendre" };

export default function LearnPage() {
  const totalLessons = DEMO_UNIVERSES.reduce((sum, u) => sum + u.lessons, 0);

  return (
    <>
      <PageHeader
        title="Apprendre"
        description="Le programme sera organisé en 10 univers et 72 leçons."
      />

      <EmptyState
        icon="book"
        title="Aucune leçon disponible pour le moment"
        action={
          <ButtonLink href="/entrainement" variant="secondary">
            Essayer une série de démonstration
          </ButtonLink>
        }
      >
        Les leçons sont en cours de préparation. Chacune sera relue et
        rattachée à une source réglementaire avant d’être publiée.
      </EmptyState>

      <section aria-labelledby="apercu" className="mt-10">
        <SectionTitle id="apercu" aside={<DemoBadge />}>
          Aperçu de l’organisation
        </SectionTitle>
        <p className="mb-4 text-sm text-muted">
          Noms, nombres de leçons ({totalLessons} au total) et progression
          ci-dessous sont des exemples inventés pour illustrer l’interface.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {DEMO_UNIVERSES.map((universe, i) => (
            <li key={universe.id}>
              <details className="group rounded-3xl border border-line bg-surface shadow-card">
                <summary className="flex cursor-pointer list-none items-center gap-4 rounded-3xl p-4 [&::-webkit-details-marker]:hidden">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-lg font-bold text-brand-text">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{universe.title}</span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {universe.lessons} leçons · {formatPercent(universe.progress)}
                    </span>
                    <ProgressBar
                      value={universe.progress}
                      label={`Progression fictive, ${universe.title}`}
                      className="mt-2 h-1.5"
                    />
                  </span>
                  <Icon
                    name="chevron-right"
                    className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-90"
                  />
                </summary>
                <div className="border-t border-line px-4 pb-4 pt-3 text-sm text-muted">
                  <p className="flex items-center gap-2">
                    <Icon name="lock" size={16} />
                    Contenu non disponible : univers d’exemple.
                  </p>
                </div>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
