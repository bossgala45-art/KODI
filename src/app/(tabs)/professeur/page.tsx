import type { Metadata } from "next";
import { connection } from "next/server";
import { TutorPanel } from "@/components/tutor";
import { PageHeader } from "@/components/ui/display";
import { LESSONS, questionById } from "@/content/catalog";
import { tutorStatus } from "@/lib/tutor/server";

export const metadata: Metadata = { title: "Professeur" };

export default async function ProfesseurPage({ searchParams }: PageProps<"/professeur">) {
  // Le mode (avec ou sans IA) dépend de la configuration du serveur, lue à chaque demande.
  await connection();
  const { question: questionParam } = await searchParams;
  const question = typeof questionParam === "string" ? questionById(questionParam) : undefined;

  return (
    <>
      <PageHeader
        title="Professeur"
        description="Des explications sur les règles et les corrections, tirées du programme de KODI."
      />
      <TutorPanel
        status={tutorStatus()}
        question={question ? { id: question.id, prompt: question.prompt, status: question.status, demo: question.demo } : null}
        lessons={LESSONS.map((lesson) => ({ id: lesson.id, title: lesson.title }))}
      />
    </>
  );
}
