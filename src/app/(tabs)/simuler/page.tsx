import type { Metadata } from "next";
import { ExamModeSwitch } from "@/components/exam-mode-switch";
import { QuizSession } from "@/components/quiz-session";
import { PageHeader } from "@/components/ui/display";
import { EXAM_FORMAT, EXAM_QUIZ_BANK } from "@/content/exam-questions";
import { formatConsultedAt } from "@/content/sources";

export const metadata: Metadata = { title: "Simuler" };

export default function SimulationPage() {
  const { questionCount, passMark, source } = EXAM_FORMAT;

  return (
    <>
      <PageHeader
        title="Simuler"
        description="Un examen blanc au format de l’épreuve : la correction s’affiche seulement à la fin."
      />
      <ExamModeSwitch>
        <QuizSession
          mode="simulation"
          content="non-relue"
          passMark={passMark}
          bank={EXAM_QUIZ_BANK}
          length={questionCount}
          title="Examen blanc"
          icon="flag"
          startLabel="Lancer l’examen blanc"
          details={[
            `${questionCount} questions tirées au hasard, comme à l’examen`,
            `Réussi à partir de ${passMark} bonnes réponses sur ${questionCount}`,
            "Une réponse n’est juste que si toutes les bonnes propositions sont cochées",
            "Corrigé détaillé et sources à la fin",
          ]}
          notice={
            <div className="space-y-2">
              <p>
                <strong>Format vérifié :</strong> {questionCount} questions et
                seuil de {passMark} bonnes réponses, d’après{" "}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-text underline underline-offset-2"
                >
                  Service-Public.gouv.fr
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>{" "}
                (consulté le {formatConsultedAt(source.consultedAt)}).
              </p>
              <p>
                <strong>Questions :</strong> rédigées pour KODI à partir des
                pages officielles de la Sécurité routière. Ce ne sont pas les
                questions de l’examen officiel, qui ne sont pas publiques. Elles
                n’ont pas encore été relues par un professionnel : le badge
                « Non relues » le rappelle.
              </p>
              <p>
                À l’examen, les questions s’appuient sur des photos et des
                vidéos ; ici, les situations sont décrites par écrit.
              </p>
            </div>
          }
        />
      </ExamModeSwitch>
    </>
  );
}
