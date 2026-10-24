/**
 * Traduction des erreurs Supabase (Auth, base, réseau) en messages français
 * compréhensibles, sans jamais afficher de détail technique interne.
 */

export type ErrorKind = "network" | "auth" | "rate-limit" | "validation" | "unknown";

export interface UserFacingError {
  kind: ErrorKind;
  message: string;
  /** Vrai si réessayer a une chance d'aboutir. */
  retryable: boolean;
  /** Code Supabase Auth d'origine, si connu (ex. email_not_confirmed). */
  code?: string;
}

const AUTH_MESSAGES: Record<string, string> = {
  invalid_credentials: "Adresse e-mail ou mot de passe incorrect.",
  email_not_confirmed:
    "Votre adresse e-mail n’est pas encore confirmée. Ouvrez le lien reçu par e-mail.",
  user_already_exists: "Un compte existe déjà avec cette adresse e-mail.",
  email_exists: "Un compte existe déjà avec cette adresse e-mail.",
  weak_password: "Mot de passe trop faible : au moins 8 caractères, avec lettres et chiffres.",
  same_password: "Le nouveau mot de passe doit être différent de l’ancien.",
  otp_expired: "Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.",
  email_address_invalid: "Cette adresse e-mail n’est pas acceptée.",
  signup_disabled: "Les inscriptions sont momentanément fermées.",
  session_not_found: "Votre session a expiré. Reconnectez-vous.",
  refresh_token_not_found: "Votre session a expiré. Reconnectez-vous.",
  reauthentication_needed: "Pour des raisons de sécurité, reconnectez-vous avant de continuer.",
};

const RATE_LIMIT_CODES = new Set(["over_email_send_rate_limit", "over_request_rate_limit"]);

const KODI_MESSAGES: Record<string, string> = {
  KODI_NOT_AUTHENTICATED: "Connectez-vous pour continuer.",
  KODI_NOT_ENOUGH_QUESTIONS:
    "Pas encore assez de questions validées pour composer un examen complet.",
  KODI_EXAM_NOT_FOUND: "Examen introuvable.",
  KODI_EXAM_CLOSED: "Cet examen est déjà terminé.",
  KODI_EXAM_NOT_SUBMITTED: "Le corrigé sera disponible après la remise de l’examen.",
  KODI_EMPTY_ANSWER: "Sélectionnez au moins une proposition.",
  KODI_INVALID_CHOICES: "Réponse invalide. Rechargez la question.",
  KODI_QUESTION_UNAVAILABLE: "Cette question n’est plus disponible.",
  KODI_QUESTION_IN_ACTIVE_EXAM:
    "Cette question fait partie de votre examen en cours : terminez-le d’abord.",
  KODI_FORBIDDEN: "Action réservée à l’équipe éditoriale.",
  KODI_EXAM_IN_PROGRESS: "Un examen est déjà en cours : reprenez-le ou abandonnez-le d’abord.",
  KODI_INVALID_MODE: "Mode d’examen inconnu.",
  KODI_NO_TARGET: "Choisissez au moins une compétence validée pour l’examen ciblé.",
  KODI_NO_FAILED_COMPETENCES:
    "Aucune compétence ratée pour l’instant : la revanche s’ouvre après des erreurs.",
};

interface ErrorLike {
  name?: unknown;
  message?: unknown;
  code?: unknown;
  status?: unknown;
}

function asErrorLike(error: unknown): ErrorLike {
  return error && typeof error === "object" ? (error as ErrorLike) : { message: String(error) };
}

export function isNetworkError(error: unknown): boolean {
  const e = asErrorLike(error);
  const message = typeof e.message === "string" ? e.message : "";
  return (
    e.name === "AuthRetryableFetchError" ||
    e.name === "TypeError" ||
    /failed to fetch|fetch failed|network ?error|load failed|networkerror/i.test(message) ||
    (typeof e.status === "number" && (e.status === 0 || e.status >= 502))
  );
}

export function toUserFacingError(error: unknown): UserFacingError {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return {
      kind: "network",
      message: "Vous êtes hors ligne. Vérifiez votre connexion puis réessayez.",
      retryable: true,
    };
  }
  if (isNetworkError(error)) {
    return {
      kind: "network",
      message: "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.",
      retryable: true,
    };
  }
  const e = asErrorLike(error);
  const code = typeof e.code === "string" ? e.code : "";
  const message = typeof e.message === "string" ? e.message : "";

  if (RATE_LIMIT_CODES.has(code) || e.status === 429) {
    return {
      kind: "rate-limit",
      message: "Trop de tentatives. Patientez quelques minutes avant de réessayer.",
      retryable: true,
    };
  }
  const authMessage = AUTH_MESSAGES[code];
  if (authMessage) {
    return { kind: "auth", message: authMessage, retryable: false, code };
  }
  const kodi = message.match(/KODI_[A-Z_]+/)?.[0];
  const kodiMessage = kodi ? KODI_MESSAGES[kodi] : undefined;
  if (kodiMessage) {
    return { kind: "validation", message: kodiMessage, retryable: false };
  }
  return {
    kind: "unknown",
    message: "Une erreur inattendue est survenue. Réessayez dans un instant.",
    retryable: true,
  };
}

/** Réessaie une opération idempotente en cas d'erreur réseau uniquement. */
export async function withNetworkRetry<T>(
  operation: () => Promise<T>,
  { attempts = 3, baseDelayMs = 500 }: { attempts?: number; baseDelayMs?: number } = {},
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isNetworkError(error) || i === attempts - 1) break;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** i));
    }
  }
  throw lastError;
}

/** Supabase renvoie { data, error } : transforme une erreur en exception. */
export function unwrap<T>(result: { data: T; error: unknown }): T {
  if (result.error) throw result.error;
  return result.data;
}

/** Comme unwrap, pour une ligne attendue : une ligne absente est une erreur. */
export function unwrapRow<T>(result: { data: T | null; error: unknown }): T {
  if (result.error) throw result.error;
  if (result.data === null) throw new Error("KODI_ROW_NOT_FOUND");
  return result.data;
}
