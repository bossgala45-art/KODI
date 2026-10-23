/**
 * Suivi des statuts entre deux imports (fichier content/statuts.lock.json) :
 *  - transitions autorisées uniquement ;
 *  - un contenu validé ne peut pas changer sans repasser « à vérifier » ;
 *  - un contenu validé ne se supprime pas : il se retire.
 */
import { createHash } from "node:crypto";
import type { Catalog, ContentStatus } from "@/lib/content/schema";

export interface LockEntry {
  status: ContentStatus;
  hash: string;
}
export type ContentLock = Record<string, LockEntry>;

export const ALLOWED_TRANSITIONS: Record<ContentStatus, readonly ContentStatus[]> = {
  brouillon: ["brouillon", "a-verifier", "retire"],
  "a-verifier": ["a-verifier", "brouillon", "valide", "retire"],
  valide: ["valide", "a-verifier", "retire"],
  retire: ["retire", "brouillon"],
};

/** Statuts possibles pour un contenu qui apparaît pour la première fois. */
export const INITIAL_STATUSES: readonly ContentStatus[] = ["brouillon", "a-verifier"];

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

/** Empreinte du contenu, hors statut et relecture. */
export function contentHash<T extends { status: unknown; review?: unknown }>(item: T): string {
  const { status: _status, review: _review, ...substance } = item;
  void _status;
  void _review;
  return createHash("sha256").update(JSON.stringify(canonical(substance))).digest("hex").slice(0, 16);
}

export function lockKey(kind: "universe" | "competence" | "lesson" | "question", id: string): string {
  return `${kind}:${id}`;
}

export function catalogEntries(catalog: Catalog): Array<[string, { status: ContentStatus; review?: unknown }]> {
  return [
    ...catalog.universes.map((u) => [lockKey("universe", u.id), u] as [string, typeof u]),
    ...catalog.competences.map((c) => [lockKey("competence", c.id), c] as [string, typeof c]),
    ...catalog.lessons.map((l) => [lockKey("lesson", l.id), l] as [string, typeof l]),
    ...catalog.questions.map((q) => [lockKey("question", q.id), q] as [string, typeof q]),
  ];
}

export function buildLock(catalog: Catalog): ContentLock {
  return Object.fromEntries(
    catalogEntries(catalog).map(([key, item]) => [key, { status: item.status, hash: contentHash(item) }]),
  );
}

export function checkTransitions(previous: ContentLock, catalog: Catalog): string[] {
  const errors: string[] = [];
  const current = new Map(catalogEntries(catalog));

  for (const [key, item] of current) {
    const before = previous[key];
    if (!before) {
      if (!INITIAL_STATUSES.includes(item.status)) {
        errors.push(`${key} : un nouveau contenu commence en brouillon ou à vérifier, pas « ${item.status} »`);
      }
      continue;
    }
    if (!ALLOWED_TRANSITIONS[before.status].includes(item.status)) {
      errors.push(`${key} : passage de « ${before.status} » à « ${item.status} » interdit`);
    }
    if (before.status === "valide" && item.status === "valide" && before.hash !== contentHash(item)) {
      errors.push(`${key} : contenu validé modifié ; repassez-le « a-verifier » pour une nouvelle relecture`);
    }
  }
  for (const [key, before] of Object.entries(previous)) {
    if (!current.has(key) && before.status === "valide") {
      errors.push(`${key} : un contenu validé ne se supprime pas, il se retire (statut « retire »)`);
    }
  }
  return errors;
}
