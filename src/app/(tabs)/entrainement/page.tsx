import type { Metadata } from "next";
import { QuizSession } from "@/components/quiz-session";
import { PageHeader } from "@/components/ui/display";
import { DEMO_QUESTIONS, TRAINING_LENGTH } from "@/content/demo";

export const metadata: Metadata = { title: "S’entraîner" };

export default function TrainingPage() {
  return (
    <>
      <PageHeader
        title="S’entraîner"
        description="Répondez à votre rythme : la correction s’affiche après chaque question."
      />
      <QuizSession
        mode="entrainement"
        content="fictive"
        bank={DEMO_QUESTIONS}
        length={TRAINING_LENGTH}
        title="Série d’entraînement"
        icon="target"
        startLabel="Commencer la série"
        details={[
          `${TRAINING_LENGTH} questions tirées au hasard`,
          "Correction et explication immédiates",
          "Résultat enregistré sur cet appareil",
        ]}
        notice={
          <p>
            Les questions de cette série sont <strong>fictives</strong> : elles
            portent sur l’application elle-même, pas sur le code de la route.
            Les vraies questions, vérifiées et sourcées, arriveront dans une
            phase ultérieure.
          </p>
        }
      />
    </>
  );
}
