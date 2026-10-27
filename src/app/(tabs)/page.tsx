import { DailyGoalCard, Greeting, OnboardingPrompt, Shortcuts } from "@/components/home-dashboard";
import { CoachSummaryCard } from "@/components/coach";
import { DailyProgramCard } from "@/components/learning";
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

    </div>
  );
}
