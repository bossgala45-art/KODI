/**
 * Professeur de KODI : types partagés entre le serveur et l'interface.
 *
 * Deux modes, toujours annoncés à l'écran :
 *  - « ia » : réponse rédigée par un fournisseur d'IA générative, à partir
 *    des seuls contenus validés, avec leurs références ;
 *  - « sans-ia » : explications prédéfinies du catalogue (aucun texte
 *    généré), avec leur statut de relecture.
 */
import type { ContentStatus } from "@/lib/content/schema";

export const TUTOR_KINDS = ["expliquer-regle", "reformuler-correction", "question"] as const;
export type TutorKind = (typeof TUTOR_KINDS)[number];

export const TUTOR_KIND_LABELS: Record<TutorKind, string> = {
  "expliquer-regle": "Expliquer une règle",
  "reformuler-correction": "Reformuler une correction",
  question: "Poser une question",
};

export const MAX_MESSAGE_LENGTH = 500;

export interface TutorRequest {
  kind: TutorKind;
  /** Question du catalogue dont on veut la correction. */
  questionId?: string;
  /** Leçon dont on veut l'explication. */
  lessonId?: string;
  /** Texte libre de la personne (déjà débarrassé des données personnelles). */
  message: string;
}

/** Extrait de contenu transmis à l'IA, référencé [S1], [S2]… */
export interface TutorPassage {
  ref: string;
  contentKind: "lecon" | "question";
  contentId: string;
  title: string;
  text: string;
  sourceIds: string[];
}

/** Explication prédéfinie du catalogue (mode sans IA ou repli). */
export interface PredefinedExplanation {
  contentKind: "lecon" | "question";
  contentId: string;
  title: string;
  /** Texte rédigé et relu dans le catalogue, jamais généré. */
  paragraphs: string[];
  status: ContentStatus;
  /** Contenu de démonstration. */
  demo: boolean;
  href?: string;
  sources: { label: string; url: string }[];
}

/** Pourquoi la réponse ne vient pas d'une IA générative. */
export const FALLBACK_REASONS = [
  "aucun-fournisseur",
  "aucune-source-fiable",
  "quota-quotidien",
  "budget-atteint",
  "fournisseur-indisponible",
  "fournisseur-quota",
  "fournisseur-configuration",
  "refus",
  "hors-sources",
  "reponse-non-verifiable",
] as const;
export type FallbackReason = (typeof FALLBACK_REASONS)[number];

export const FALLBACK_MESSAGES: Record<FallbackReason, string> = {
  "aucun-fournisseur":
    "Mode sans IA générative : aucun service d’IA n’est connecté à KODI. Voici les explications prédéfinies du programme.",
  "aucune-source-fiable":
    "Aucun contenu validé ne permet de répondre de façon fiable : le professeur ne répond pas sans source. Voici les explications prédéfinies, avec leur statut.",
  "quota-quotidien":
    "Vous avez atteint le nombre de réponses rédigées par l’IA pour aujourd’hui. Voici les explications prédéfinies.",
  "budget-atteint":
    "Le budget quotidien de l’IA est atteint. Voici les explications prédéfinies, en attendant demain.",
  "fournisseur-indisponible":
    "Le service d’IA ne répond pas pour le moment. Voici les explications prédéfinies.",
  "fournisseur-quota":
    "Le service d’IA est momentanément saturé. Voici les explications prédéfinies.",
  "fournisseur-configuration":
    "Le service d’IA est mal configuré. Voici les explications prédéfinies.",
  refus: "Le service d’IA a refusé de répondre. Voici les explications prédéfinies.",
  "hors-sources":
    "La réponse à cette question ne figure pas dans les contenus validés : le professeur ne l’invente pas. Voici les explications prédéfinies.",
  "reponse-non-verifiable":
    "La réponse de l’IA n’a pas pu être vérifiée par rapport aux sources : elle n’est pas affichée. Voici les explications prédéfinies.",
};

export interface TutorCitation {
  ref: string;
  title: string;
  sources: { label: string; url: string }[];
}

export type TutorResponse =
  | {
      mode: "ia";
      provider: string;
      text: string;
      citations: TutorCitation[];
      /** Corrections vérifiées, toujours affichables à côté de la réponse. */
      predefined: PredefinedExplanation[];
    }
  | {
      mode: "sans-ia";
      reason: FallbackReason;
      notice: string;
      predefined: PredefinedExplanation[];
    };

/** État public du professeur (aucune information secrète). */
export interface TutorStatus {
  mode: "ia" | "sans-ia";
  providerLabel: string | null;
  /** Nombre de contenus validés que l'IA peut citer. */
  validatedContents: number;
}
