import type { Metadata } from "next";
import { QuizSession } from "@/components/quiz-session";
import { PageHeader } from "@/components/ui/display";
import { DEMO_QUESTIONS, SIMULATION_LENGTH } from "@/content/demo";

export const metadata: Metadata = { title: "Simuler" };

export default function SimulationPage() {
  return (
    <>
      <PageHeader
        title="Simuler"
        description="Un examen blanc : vous découvrez la correction seulement à la fin."
      />
      <QuizSession
        mode="simulation"
        bank={DEMO_QUESTIONS}
        length={SIMULATION_LENGTH}
        title="Examen blanc de démonstration"
        icon="flag"
        startLabel="Lancer l’examen blanc"
        details={[
          `${SIMULATION_LENGTH} questions à la suite`,
          "Aucune correction avant la fin",
          "Corrigé détaillé à l’issue de l’examen",
        ]}
        notice={
          <p>
            Ce format est une <strong>démonstration</strong> : il ne reproduit
            pas l’épreuve officielle, dont le nombre de questions, la durée et
            le seuil de réussite seront établis à partir de sources officielles
            avant d’être proposés.
          </p>
        }
      />
    </>
  );
}
