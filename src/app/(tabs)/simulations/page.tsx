import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/content-status";
import { Icon } from "@/components/icons";
import { Alert, Badge, PageHeader } from "@/components/ui/display";
import { UNIVERSES } from "@/content/catalog";
import { SCENES } from "@/content/scenes";
import { SCENE_PLAN } from "@/content/scenes/plan";

export const metadata: Metadata = { title: "Simulations" };

export default function SimulationsPage() {
  const available = SCENE_PLAN.filter((p) => p.available).length;
  return (
    <>
      <PageHeader
        title="Simulations"
        description={`${SCENE_PLAN.length} situations de conduite prévues, ${available} disponible${available > 1 ? "s" : ""}.`}
      />
      <Alert tone="info" role="note" className="mb-6" title="Programme en cours de production">
        Les scènes prévues ne sont pas encore produites : aucune règle n’y est encore rédigée. Chacune sera
        vérifiée sur une source officielle et relue avant d’être proposée.
      </Alert>
      <ol className="space-y-3">
        {SCENE_PLAN.map((plan, index) => {
          const universe = UNIVERSES.find((u) => u.id === plan.universeId);
          const scene = SCENES.find((s) => s.slug === plan.slug);
          const body = (
            <>
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-soft font-bold text-brand-text">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{plan.title}</span>
                <span className="mt-0.5 block text-sm text-muted">{universe?.title}</span>
                <span className="mt-1.5 flex flex-wrap gap-2">
                  {scene ? <StatusBadge status={scene.status} /> : <Badge tone="neutral">Prévue · pas encore produite</Badge>}
                </span>
              </span>
            </>
          );
          return (
            <li key={plan.slug}>
              {scene ? (
                <Link
                  href={`/simulations/${plan.slug}`}
                  className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 shadow-card transition-colors hover:border-line-strong"
                >
                  {body}
                  <Icon name="chevron-right" className="shrink-0 text-muted" />
                </Link>
              ) : (
                <div className="flex items-center gap-4 rounded-3xl border border-dashed border-line-strong p-4">
                  {body}
                  <Icon name="lock" className="shrink-0 text-muted" />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
