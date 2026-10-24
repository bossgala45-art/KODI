import Link from "next/link";
import { DailyGoalCard, Greeting, OnboardingPrompt, Shortcuts } from "@/components/home-dashboard";
import { CoachSummaryCard } from "@/components/coach";
import { DailyProgramCard } from "@/components/learning";
import { Icon } from "@/components/icons";
import { Alert, SectionTitle } from "@/components/ui/display";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header className="pt-2">
        <Greeting />
        <p className="mt-2 text-muted">Prêt pour une petite session ?</p>
      </header>

      <Alert tone="info" role="note" title="Version de développement">
        Les leçons sont en cours de rédaction : celles qui existent sont des
        démonstrations, marquées « Démonstration · non validé ». Les
        questions, pas encore relues par une personne compétente, portent le
        badge « À vérifier » ; les examens n’utiliseront que des questions
        validées.
      </Alert>

      <OnboardingPrompt />
      <DailyProgramCard />
      <CoachSummaryCard />
      <DailyGoalCard />

      <section aria-labelledby="raccourcis">
        <SectionTitle id="raccourcis">Que voulez-vous faire ?</SectionTitle>
        <Shortcuts />
      </section>

      <Link
        href="/premium"
        className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 shadow-card transition-colors hover:border-line-strong"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-night text-on-brand">
          <Icon name="crown" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">KODI Premium</span>
          <span className="block text-sm text-muted">Découvrir ce qui est prévu</span>
        </span>
        <Icon name="chevron-right" className="text-muted" />
      </Link>
    </div>
  );
}
