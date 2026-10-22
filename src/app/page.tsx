import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  features,
  phases,
  type FeatureStatus,
  type PhaseStatus,
} from "@/content/project";

const FEATURE_STATUS_LABEL: Record<FeatureStatus, string> = {
  available: "Disponible",
  planned: "Prévu",
};

const PHASE_STATUS_LABEL: Record<PhaseStatus, string> = {
  done: "Terminée",
  "in-progress": "En cours",
  todo: "À venir",
};

const PRINCIPLES = [
  {
    title: "Questions originales",
    text: "Chaque question est rédigée pour KODI. Aucune n’est présentée comme issue de l’examen officiel.",
  },
  {
    title: "Sources citées",
    text: "Chaque réponse renvoie au texte réglementaire qui la justifie, vérifié avant publication.",
  },
  {
    title: "Transparence",
    text: "Une fonctionnalité n’est annoncée comme disponible que lorsqu’elle fonctionne réellement.",
  },
] as const;

export default function Home() {
  const currentPhase = phases.find((phase) => phase.status === "in-progress");

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line bg-bg/85 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-brand text-sm text-on-brand"
            >
              K
            </span>
            <span className="text-lg">KODI</span>
          </Link>
          <ThemeSwitcher />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 sm:px-6">
        <section aria-labelledby="hero-title" className="py-12 sm:py-20">
          {currentPhase && (
            <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent">
              <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
              En développement · Phase {currentPhase.id}
            </p>
          )}
          <h1
            id="hero-title"
            className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl"
          >
            Préparez le code de la route, à votre rythme.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted text-pretty">
            KODI sera une application de préparation au code de la route,
            pensée pour le téléphone et installable sur iPhone, Android et
            ordinateur.
          </p>
          <div
            role="note"
            className="mt-6 max-w-2xl rounded-xl border border-line bg-surface p-4 text-sm text-muted"
          >
            <strong className="font-semibold text-fg">À ce jour, aucune leçon ni question n’est disponible.</strong>{" "}
            Cette page présente le projet et son avancement réel.
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#programme"
              className="rounded-xl bg-brand px-5 py-3 text-center font-semibold text-on-brand transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Découvrir le programme
            </a>
            <a
              href="#avancement"
              className="rounded-xl border border-line bg-surface px-5 py-3 text-center font-semibold transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Suivre l’avancement
            </a>
          </div>
        </section>

        <section aria-labelledby="programme" className="scroll-mt-20 py-10">
          <h2 id="programme" className="text-2xl font-bold tracking-tight">
            Ce que contiendra KODI
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <li
                key={feature.title}
                className="flex flex-col rounded-2xl border border-line bg-surface p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{feature.title}</h3>
                  <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
                    {FEATURE_STATUS_LABEL[feature.status]}
                  </span>
                </div>
                <p className="mt-2 flex-1 text-sm text-muted">{feature.description}</p>
                <p className="mt-4 text-sm font-semibold">{feature.target}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="principes" className="py-10">
          <h2 id="principes" className="text-2xl font-bold tracking-tight">
            Nos engagements sur le contenu
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {PRINCIPLES.map((principle) => (
              <li key={principle.title} className="rounded-2xl bg-brand-soft p-5">
                <h3 className="font-semibold text-brand">{principle.title}</h3>
                <p className="mt-2 text-sm">{principle.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="avancement" className="scroll-mt-20 py-10">
          <h2 id="avancement" className="text-2xl font-bold tracking-tight">
            Avancement
          </h2>
          <ol className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {phases.map((phase) => (
              <li
                key={phase.id}
                aria-current={phase.status === "in-progress" ? "step" : undefined}
                className="flex items-center justify-between gap-3 px-4 py-3 aria-[current=step]:bg-accent-soft"
              >
                <span className="flex items-baseline gap-3">
                  <span className="w-6 shrink-0 text-sm tabular-nums text-muted">
                    {phase.id}
                  </span>
                  <span className="font-medium">{phase.title}</span>
                </span>
                <span className="shrink-0 text-sm text-muted">
                  {PHASE_STATUS_LABEL[phase.status]}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-line pb-[env(safe-area-inset-bottom)]">
        <p className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted sm:px-6">
          KODI est un projet indépendant en cours de développement.
        </p>
      </footer>
    </>
  );
}
