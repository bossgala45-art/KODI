/**
 * Sources du professeur : recherche dans le catalogue, sans IA.
 *
 * - `validatedPassages` : ce qui peut être transmis à une IA. Uniquement des
 *   contenus au statut « valide », hors démonstration, citant au moins une
 *   source du registre. Sans passage, aucun appel n'est fait.
 * - `predefinedExplanations` : textes du catalogue affichés tels quels (mode
 *   sans IA et repli), avec leur statut de relecture.
 */
import type { ContentQuestion, Lesson, Universe } from "@/lib/content/schema";
import type { PredefinedExplanation, TutorPassage, TutorRequest } from "@/lib/tutor/types";

export interface TutorCatalog {
  universes: readonly Pick<Universe, "id" | "slug">[];
  lessons: readonly Lesson[];
  questions: readonly ContentQuestion[];
}

export type SourceResolver = (id: string) => { label: string; url: string } | null;

const MAX_PASSAGES = 3;

const STOPWORDS = new Set(
  (
    "les des une est que qui pour pas par sur dans avec son ses aux ont mais elle ils elles nous vous leur " +
    "cette ces ce cet quoi quel quelle quels quelles comment pourquoi quand dois doit peut peux faut " +
    "suis etre avoir fait faire tout tous toute toutes plus moins tres bien alors donc ainsi entre " +
    "votre notre mon mes ton tes lui eux moi toi"
  ).split(" "),
);

export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Mots significatifs, réduits à leurs 6 premières lettres (pluriels, accords). */
export function keywords(text: string): Set<string> {
  const words = normalize(text).match(/[a-z0-9]+/g) ?? [];
  return new Set(words.filter((w) => w.length >= 3 && !STOPWORDS.has(w)).map((w) => w.slice(0, 6)));
}

function lessonText(lesson: Lesson): string[] {
  return [
    lesson.summary,
    ...lesson.blocks.flatMap((block) => {
      if (block.type === "text") return [...(block.title ? [block.title] : []), ...block.paragraphs];
      if (block.type === "simulation") return [block.instructions];
      if (block.type === "image") return [block.alt];
      return [block.transcript];
    }),
  ];
}

function questionText(question: ContentQuestion): string[] {
  const correct = question.choices.filter((c) => question.correct.includes(c.id)).map((c) => c.label);
  return [
    `Question : ${question.prompt}`,
    `Propositions : ${question.choices.map((c) => `${c.id.toUpperCase()}. ${c.label}`).join(" ; ")}`,
    `Réponse${correct.length > 1 ? "s" : ""} attendue${correct.length > 1 ? "s" : ""} : ${correct.join(" ; ")}`,
    `Correction : ${question.explanation}`,
  ];
}

interface Doc {
  contentKind: "lecon" | "question";
  contentId: string;
  title: string;
  paragraphs: string[];
  sourceIds: string[];
  status: Lesson["status"];
  demo: boolean;
  lesson?: Lesson;
}

function docs(catalog: TutorCatalog): Doc[] {
  return [
    ...catalog.lessons.map(
      (lesson): Doc => ({
        contentKind: "lecon",
        contentId: lesson.id,
        title: lesson.title,
        paragraphs: lessonText(lesson),
        sourceIds: lesson.sources,
        status: lesson.status,
        demo: lesson.demo,
        lesson,
      }),
    ),
    ...catalog.questions.map(
      (question): Doc => ({
        contentKind: "question",
        contentId: question.id,
        title: question.prompt,
        paragraphs: questionText(question),
        sourceIds: question.sources,
        status: question.status,
        demo: question.demo,
      }),
    ),
  ].filter((doc) => doc.status !== "retire");
}

/** Contenus explicitement visés par la demande (question corrigée, leçon). */
function targeted(all: Doc[], request: TutorRequest, catalog: TutorCatalog): Doc[] {
  const picked: Doc[] = [];
  const add = (doc: Doc | undefined) => {
    if (doc && !picked.includes(doc)) picked.push(doc);
  };
  if (request.questionId) {
    add(all.find((d) => d.contentKind === "question" && d.contentId === request.questionId));
    const lessonId = catalog.questions.find((q) => q.id === request.questionId)?.lessonId;
    if (lessonId) add(all.find((d) => d.contentKind === "lecon" && d.contentId === lessonId));
  }
  if (request.lessonId) add(all.find((d) => d.contentKind === "lecon" && d.contentId === request.lessonId));
  return picked;
}

/** Recherche par mots-clés : un document doit couvrir au moins un tiers des mots de la demande. */
function search(all: Doc[], message: string): Doc[] {
  const query = keywords(message);
  if (query.size === 0) return [];
  const needed = Math.max(1, Math.ceil(query.size / 3));
  return all
    .map((doc) => {
      const words = keywords(`${doc.title} ${doc.paragraphs.join(" ")}`);
      let score = 0;
      for (const word of query) if (words.has(word)) score += 1;
      return { doc, score };
    })
    .filter((entry) => entry.score >= needed)
    .sort((a, b) => b.score - a.score || a.doc.contentId.localeCompare(b.doc.contentId))
    .map((entry) => entry.doc);
}

function relevant(all: Doc[], request: TutorRequest, catalog: TutorCatalog): Doc[] {
  const picked = targeted(all, request, catalog);
  for (const doc of search(all, request.message)) if (!picked.includes(doc)) picked.push(doc);
  return picked.slice(0, MAX_PASSAGES);
}

export function isReliable(doc: Pick<Doc, "status" | "demo" | "sourceIds">, resolve: SourceResolver): boolean {
  return (
    doc.status === "valide" && !doc.demo && doc.sourceIds.length > 0 && doc.sourceIds.every((id) => resolve(id) !== null)
  );
}

/** Passages transmissibles à une IA : contenus validés et sourcés uniquement. */
export function validatedPassages(
  request: TutorRequest,
  catalog: TutorCatalog,
  resolve: SourceResolver,
): TutorPassage[] {
  const reliable = docs(catalog).filter((doc) => isReliable(doc, resolve));
  return relevant(reliable, request, catalog).map((doc, index) => ({
    ref: `S${index + 1}`,
    contentKind: doc.contentKind,
    contentId: doc.contentId,
    title: doc.title,
    text: doc.paragraphs.join("\n"),
    sourceIds: doc.sourceIds,
  }));
}

export function validatedContentCount(catalog: TutorCatalog, resolve: SourceResolver): number {
  return docs(catalog).filter((doc) => isReliable(doc, resolve)).length;
}

function hrefOf(doc: Doc, catalog: TutorCatalog): string | undefined {
  if (!doc.lesson) return undefined;
  const universe = catalog.universes.find((u) => u.id === doc.lesson!.universeId);
  return universe ? `/apprendre/${universe.slug}/${doc.lesson.slug}` : undefined;
}

/** Explications prédéfinies (tous statuts sauf « retiré »), affichées telles quelles. */
export function predefinedExplanations(
  request: TutorRequest,
  catalog: TutorCatalog,
  resolve: SourceResolver,
): PredefinedExplanation[] {
  // Les contenus validés passent en premier, à pertinence égale.
  const all = docs(catalog).sort((a, b) => Number(b.status === "valide") - Number(a.status === "valide"));
  return relevant(all, request, catalog).map((doc) => ({
    contentKind: doc.contentKind,
    contentId: doc.contentId,
    title: doc.title,
    paragraphs: doc.paragraphs,
    status: doc.status,
    demo: doc.demo,
    href: hrefOf(doc, catalog),
    sources: doc.sourceIds.flatMap((id) => {
      const source = resolve(id);
      return source ? [source] : [];
    }),
  }));
}
