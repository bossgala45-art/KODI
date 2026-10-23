/**
 * Catalogue pédagogique importé depuis content/ (npm run content:build).
 * Le fichier generated/catalog.json est validé à l'import ; un test vérifie
 * qu'il est identique aux fichiers sources.
 *
 * Les contenus « retire » ne sont jamais proposés. Les contenus non validés
 * restent affichés pendant le développement, avec leur statut visible.
 */
import generated from "@/content/generated/catalog.json";
import { SOURCES, formatConsultedAt, type SourceId } from "@/content/sources";
import type { Catalog, Competence, ContentQuestion, Lesson, Universe } from "@/lib/content/schema";
import type { QuizQuestion, SourceLink } from "@/lib/quiz";

export const CATALOG = generated as unknown as Catalog;

const active = <T extends { status: string }>(items: readonly T[]) => items.filter((i) => i.status !== "retire");

export const UNIVERSES: readonly Universe[] = active(CATALOG.universes);
export const COMPETENCES: readonly Competence[] = active(CATALOG.competences);
export const LESSONS: readonly Lesson[] = active(CATALOG.lessons);
export const QUESTIONS: readonly ContentQuestion[] = active(CATALOG.questions);

export const PLANNED_LESSON_TOTAL = CATALOG.universes.reduce((sum, u) => sum + u.plannedLessons, 0);

export function universeBySlug(slug: string): Universe | undefined {
  return UNIVERSES.find((u) => u.slug === slug);
}

export function universeById(id: string): Universe | undefined {
  return UNIVERSES.find((u) => u.id === id);
}

export function lessonsOf(universeId: string): Lesson[] {
  return LESSONS.filter((l) => l.universeId === universeId).sort((a, b) => a.position - b.position);
}

export function lessonBySlug(universeId: string, slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.universeId === universeId && l.slug === slug);
}

export function competencesOf(universeId: string): Competence[] {
  return COMPETENCES.filter((c) => c.universeId === universeId);
}

export function competenceById(id: string): Competence | undefined {
  return COMPETENCES.find((c) => c.id === id);
}

export function questionsOfLesson(lessonId: string): ContentQuestion[] {
  return QUESTIONS.filter((q) => q.lessonId === lessonId);
}

export function questionById(id: string): ContentQuestion | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export function sourceLink(id: string): SourceLink {
  const source = SOURCES[id as SourceId];
  return {
    label: `${source.publisher.split(" (")[0]} — « ${source.title} », consulté le ${formatConsultedAt(source.consultedAt)}`,
    url: source.url,
  };
}

/** Question du catalogue au format du moteur de quiz, avec ses sources. */
export function toQuizQuestion(question: ContentQuestion): QuizQuestion {
  return {
    id: question.id,
    prompt: question.prompt,
    choices: question.choices,
    correct: question.correct,
    explanation: question.explanation,
    sources: question.sources.map(sourceLink),
  };
}
