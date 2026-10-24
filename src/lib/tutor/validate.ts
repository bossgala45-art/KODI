/**
 * Vérification de la réponse d'une IA avant affichage. Une réponse qui ne
 * passe pas ces contrôles n'est jamais montrée : la personne voit à la place
 * les corrections prédéfinies.
 *
 * Contrôles :
 *  - marqueur HORS_SOURCES → pas de réponse inventée ;
 *  - au moins une référence [Sn], et seulement des références fournies ;
 *  - aucun numéro d'article absent des sources ;
 *  - aucun nombre absent des sources (vitesses, distances, points, taux…) ;
 *  - longueur raisonnable.
 */
import { OUT_OF_SOURCES } from "@/lib/tutor/prompt";
import type { TutorPassage } from "@/lib/tutor/types";

export const MAX_ANSWER_LENGTH = 1500;

export type AnswerCheck =
  | { ok: true; text: string; refs: string[] }
  | { ok: false; reason: "hors-sources" | "sans-reference" | "reference-inconnue" | "article-inconnu" | "nombre-inconnu" | "trop-long" };

const CITATION = /\[(S\d+)\]/g;
const ARTICLE = /\b[RLDA]\s?\.?\s?\d{2,4}(?:-\d+)+\b/g;
const NUMBER = /\d+(?:[.,]\d+)?/g;

const compact = (s: string) => s.replace(/[\s.]/g, "").toUpperCase();

export function checkAnswer(raw: string, passages: readonly TutorPassage[]): AnswerCheck {
  const text = raw.trim();
  if (text.includes(OUT_OF_SOURCES)) return { ok: false, reason: "hors-sources" };
  if (text.length > MAX_ANSWER_LENGTH) return { ok: false, reason: "trop-long" };

  const known = new Set(passages.map((p) => p.ref));
  const refs = [...new Set([...text.matchAll(CITATION)].map((m) => m[1]!))];
  if (refs.length === 0) return { ok: false, reason: "sans-reference" };
  if (refs.some((ref) => !known.has(ref))) return { ok: false, reason: "reference-inconnue" };

  const sourceText = passages.map((p) => `${p.title}\n${p.text}`).join("\n");
  const sourceArticles = new Set([...sourceText.matchAll(ARTICLE)].map((m) => compact(m[0])));
  const withoutRefs = text.replace(CITATION, " ");
  for (const match of withoutRefs.matchAll(ARTICLE)) {
    if (!sourceArticles.has(compact(match[0]))) return { ok: false, reason: "article-inconnu" };
  }

  const sourceNumbers = new Set([...sourceText.matchAll(NUMBER)].map((m) => m[0].replace(",", ".")));
  for (const match of withoutRefs.matchAll(NUMBER)) {
    if (!sourceNumbers.has(match[0].replace(",", "."))) return { ok: false, reason: "nombre-inconnu" };
  }

  return { ok: true, text, refs };
}
