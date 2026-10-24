/**
 * Interface commune aux fournisseurs d'IA générative.
 *
 * Le reste du professeur (sources, quotas, budget, vérification de la
 * réponse, repli) ne dépend que de cette interface : changer de fournisseur
 * revient à écrire un nouvel adaptateur, sans toucher aux garde-fous.
 */

export interface ProviderInput {
  system: string;
  user: string;
  maxOutputTokens: number;
}

export interface ProviderUsage {
  inputTokens: number;
  outputTokens: number;
  /** Une partie de la réponse a été produite par un modèle de repli du fournisseur. */
  fallbackModelUsed: boolean;
}

export const PROVIDER_ERRORS = [
  /** Clé absente, invalide ou sans droits. */
  "authentification",
  /** Problème de facturation chez le fournisseur. */
  "facturation",
  /** Limite de fréquence ou de volume du fournisseur. */
  "quota",
  /** Panne, surcharge ou réseau. */
  "indisponible",
  /** Délai dépassé. */
  "delai",
  /** Requête refusée comme invalide (modèle inconnu, paramètre…). */
  "requete",
  /** Le modèle a refusé de répondre. */
  "refus",
  /** Réponse coupée par la limite de longueur. */
  "tronquee",
  /** Réponse vide ou inattendue. */
  "reponse-invalide",
] as const;
export type ProviderErrorKind = (typeof PROVIDER_ERRORS)[number];

export type ProviderResult =
  | { ok: true; text: string; usage: ProviderUsage }
  | { ok: false; error: ProviderErrorKind; usage?: ProviderUsage };

export interface TutorProvider {
  /** Identifiant technique (journal). */
  id: string;
  /** Nom affiché à la personne (« Claude, d’Anthropic »…). */
  label: string;
  generate(input: ProviderInput): Promise<ProviderResult>;
}

/** Prix en dollars par million de jetons, d'après la grille du fournisseur. */
export interface TokenPrices {
  inputPerMTok: number;
  outputPerMTok: number;
}

export function costUsd(usage: Pick<ProviderUsage, "inputTokens" | "outputTokens">, prices: TokenPrices): number {
  return (usage.inputTokens * prices.inputPerMTok + usage.outputTokens * prices.outputPerMTok) / 1_000_000;
}
