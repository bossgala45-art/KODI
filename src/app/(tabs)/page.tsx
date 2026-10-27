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

      <Alert tone="info" role="note" title="Édition personnelle">
        Les questions sont originales, rédigées à partir des pages officielles
        citées sous chaque correction, mais pas encore relues par une personne
        compétente : en cas de doute, la source officielle fait foi. Les leçons
        existantes sont des démonstrations, marquées « Démonstration · non
        validé ». Pensez à télécharger une sauvegarde chaque semaine (Profil).
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
