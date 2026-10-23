/**
 * Règles d'intégrité du catalogue, au-delà du schéma de chaque fichier.
 * Fonction pure : renvoie la liste des erreurs, en français.
 */
import { questionShapeErrors } from "@/lib/pedagogy/grading";
import type { Catalog, ContentStatus } from "@/lib/content/schema";

export const UNIVERSE_COUNT = 10;
export const PLANNED_LESSONS = 72;

export interface ValidationContext {
  /** Identifiants des sources connues (src/content/sources.ts). */
  sourceIds: ReadonlySet<string>;
  /** Fichiers présents dans public/ (pour les images et vidéos). */
  assetExists: (publicPath: string) => boolean;
}

const ACTIVE: ReadonlySet<ContentStatus> = new Set(["brouillon", "a-verifier", "valide"]);

export function validateCatalog(catalog: Catalog, context: ValidationContext): string[] {
  const errors: string[] = [];
  const err = (where: string, message: string) => errors.push(`${where} : ${message}`);

  const duplicates = (kind: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const value of ids) {
      if (seen.has(value)) err(`${kind} ${value}`, "identifiant en double");
      seen.add(value);
    }
  };
  duplicates("univers", catalog.universes.map((u) => u.id));
  duplicates("compétence", catalog.competences.map((c) => c.id));
  duplicates("leçon", catalog.lessons.map((l) => l.id));
  duplicates("question", catalog.questions.map((q) => q.id));

  const universes = new Map(catalog.universes.map((u) => [u.id, u]));
  const competences = new Map(catalog.competences.map((c) => [c.id, c]));
  const lessons = new Map(catalog.lessons.map((l) => [l.id, l]));

  const checkSources = (where: string, sources: readonly string[]) => {
    for (const s of sources) if (!context.sourceIds.has(s)) err(where, `source inconnue « ${s} »`);
  };
  const checkReview = (where: string, item: { status: ContentStatus; review?: unknown }) => {
    if (item.status === "valide" && !item.review) {
      err(where, "un contenu validé doit indiquer sa relecture (review.by et review.at)");
    }
  };

  // Univers : 10, 72 leçons prévues au total.
  if (catalog.universes.length !== UNIVERSE_COUNT) {
    err("univers", `${UNIVERSE_COUNT} univers attendus, ${catalog.universes.length} trouvés`);
  }
  const positions = new Set(catalog.universes.map((u) => u.position));
  if (positions.size !== catalog.universes.length) err("univers", "positions en double");
  const planned = catalog.universes.reduce((sum, u) => sum + u.plannedLessons, 0);
  if (planned !== PLANNED_LESSONS) err("univers", `${PLANNED_LESSONS} leçons prévues au total, ${planned} déclarées`);
  for (const u of catalog.universes) {
    checkSources(`univers ${u.id}`, u.sources);
    checkReview(`univers ${u.id}`, u);
  }

  for (const c of catalog.competences) {
    const where = `compétence ${c.id}`;
    if (!universes.has(c.universeId)) err(where, `univers inconnu « ${c.universeId} »`);
    checkReview(where, c);
  }

  for (const l of catalog.lessons) {
    const where = `leçon ${l.id}`;
    const universe = universes.get(l.universeId);
    if (!universe) err(where, `univers inconnu « ${l.universeId} »`);
    for (const c of l.competenceIds) {
      const competence = competences.get(c);
      if (!competence) err(where, `compétence inconnue « ${c} »`);
      else if (competence.universeId !== l.universeId) err(where, `compétence « ${c} » d’un autre univers`);
    }
    checkSources(where, l.sources);
    checkReview(where, l);
    if (l.demo && l.status === "valide") err(where, "un contenu de démonstration ne peut pas être validé");
    if (l.status === "valide" && l.sources.length === 0) err(where, "une leçon validée cite au moins une source");
    if (l.status === "valide") {
      for (const c of l.competenceIds) {
        if (competences.get(c)?.status !== "valide") err(where, `validée alors que la compétence « ${c} » ne l’est pas`);
      }
    }
    l.blocks.forEach((block, index) => {
      if ((block.type === "image" || block.type === "video") && block.src && !context.assetExists(block.src)) {
        err(`${where}, bloc ${index + 1}`, `fichier introuvable dans public : ${block.src}`);
      }
    });
  }
  for (const universe of catalog.universes) {
    const count = catalog.lessons.filter((l) => l.universeId === universe.id && ACTIVE.has(l.status)).length;
    if (count > universe.plannedLessons) {
      err(`univers ${universe.id}`, `${count} leçons pour ${universe.plannedLessons} prévues`);
    }
    const lessonPositions = catalog.lessons.filter((l) => l.universeId === universe.id).map((l) => l.position);
    if (new Set(lessonPositions).size !== lessonPositions.length) err(`univers ${universe.id}`, "positions de leçons en double");
  }

  for (const q of catalog.questions) {
    const where = `question ${q.id}`;
    for (const message of questionShapeErrors(q)) err(where, message);
    for (const c of q.competenceIds) if (!competences.has(c)) err(where, `compétence inconnue « ${c} »`);
    if (q.lessonId && !lessons.has(q.lessonId)) err(where, `leçon inconnue « ${q.lessonId} »`);
    checkSources(where, q.sources);
    checkReview(where, q);
    if (q.status !== "brouillon" && q.sources.length === 0) {
      err(where, "une question à vérifier ou validée cite au moins une source");
    }
    if (q.demo && q.status === "valide") err(where, "un contenu de démonstration ne peut pas être validé");
    if (q.demo && q.examEligible) err(where, "une question de démonstration n’entre pas dans l’examen blanc");
    if (q.status === "valide") {
      for (const c of q.competenceIds) {
        if (competences.get(c)?.status !== "valide") err(where, `validée alors que la compétence « ${c} » ne l’est pas`);
      }
    }
  }

  return errors;
}
