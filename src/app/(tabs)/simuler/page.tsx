import type { Metadata } from "next";
import { ExamCenter } from "@/components/exam-center";
import { Card, PageHeader } from "@/components/ui/display";
import { QUESTIONS } from "@/content/catalog";
import { SOURCES, formatConsultedAt } from "@/content/sources";
import { validatedExamQuestionCount } from "@/lib/exam/modes";

export const metadata: Metadata = { title: "Simuler" };

function SourceLinkInline({ id }: { id: "examen" | "preparationCode" }) {
  const source = SOURCES[id];
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-brand-text underline underline-offset-2"
    >
      {source.publisher.split(" (")[0]} — « {source.title} »<span className="sr-only"> (nouvel onglet)</span>
    </a>
  );
}

export default function SimulationPage() {
  return (
    <>
      <PageHeader
        title="Simuler"
        description="Quatre modes d’examen, tirés parmi les questions validées et corrigés par le serveur."
      />
      <ExamCenter validated={validatedExamQuestionCount(QUESTIONS)} />

      <section aria-labelledby="fidelite" className="mt-10">
        <Card>
          <h2 id="fidelite" className="font-bold">
            Fidélité à l’examen réel
          </h2>
          <p className="mt-2 text-sm">
            <strong>Conforme, d’après les sources officielles consultées :</strong> 40 questions à choix
            multiples, réussite à partir de 35 bonnes réponses (mode officiel simulé) ; pour une question à
            plusieurs réponses, le nombre de réponses attendues est indiqué.
          </p>
          <p className="mt-2 text-sm">
            <strong>Différent de l’examen réel :</strong> les questions sont originales, rédigées pour KODI ;
            elles ne viennent pas de la banque officielle (1 037 questions, non publique). Les situations sont
            décrites par écrit, alors que l’examen s’appuie sur des photos et des vidéos. Aucune limite de temps
            n’est appliquée : la durée par question n’a pas pu être vérifiée sur un texte officiel.
          </p>
          <p className="mt-2 text-sm">
            <strong>Règle de KODI, non vérifiée sur un texte officiel :</strong> une réponse n’est comptée juste
            que si toutes les bonnes propositions, et elles seules, sont cochées ; une question sans réponse est
            comptée fausse.
          </p>
          <p className="mt-2 text-sm">
            Cette simulation n’est donc pas une reproduction fidèle de l’épreuve : c’est un entraînement à son
            format.
          </p>
          <ul className="mt-3 space-y-1 text-xs">
            <li>
              Source : <SourceLinkInline id="examen" />, consulté le {formatConsultedAt(SOURCES.examen.consultedAt)}
            </li>
            <li>
              Source : <SourceLinkInline id="preparationCode" />, consulté le{" "}
              {formatConsultedAt(SOURCES.preparationCode.consultedAt)}
            </li>
          </ul>
        </Card>
      </section>
    </>
  );
}
