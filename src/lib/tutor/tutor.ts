/**
 * Orchestration du professeur, dans cet ordre :
 *  1. masquage des données personnelles ;
 *  2. limite de fréquence (refus net si dépassée) ;
 *  3. explications prédéfinies (toujours calculées : elles servent de repli) ;
 *  4. sans fournisseur → mode sans IA ;
 *  5. passages validés ; aucun → pas d'appel (« aucune source fiable ») ;
 *  6. quota quotidien du client, puis réservation du budget sur le pire cas ;
 *  7. appel du fournisseur ; erreur ou refus → repli ;
 *  8. vérification de la réponse ; non vérifiable → repli.
 *
 * Le journal ne reçoit que des catégories et des compteurs : jamais le texte
 * de la demande ou de la réponse, jamais l'identifiant du client.
 */
import type { DailyBudget, RateLimiter } from "@/lib/tutor/limits";
import { SYSTEM_PROMPT, buildUserMessage, estimateTokens } from "@/lib/tutor/prompt";
import { costUsd, type ProviderErrorKind, type TokenPrices, type TutorProvider } from "@/lib/tutor/provider";
import { redactPersonalData } from "@/lib/tutor/redact";
import {
  predefinedExplanations,
  validatedPassages,
  type SourceResolver,
  type TutorCatalog,
} from "@/lib/tutor/sources";
import { FALLBACK_MESSAGES, type FallbackReason, type TutorRequest, type TutorResponse } from "@/lib/tutor/types";
import { checkAnswer } from "@/lib/tutor/validate";

export interface TutorLogEntry {
  outcome: "ia" | FallbackReason | "trop-de-demandes";
  provider: string | null;
  providerError?: ProviderErrorKind;
  checkFailure?: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  redactions: number;
  passages: number;
}

export interface TutorDeps {
  provider: TutorProvider | null;
  prices: TokenPrices;
  maxOutputTokens: number;
  /** Le fournisseur peut relancer la demande sur un modèle de repli (coût doublé au pire). */
  providerMayRetry: boolean;
  catalog: TutorCatalog;
  resolveSource: SourceResolver;
  limiter: RateLimiter;
  budget: DailyBudget;
  log: (entry: TutorLogEntry) => void;
}

export type TutorOutcome = { ok: true; response: TutorResponse } | { ok: false; error: "trop-de-demandes" };

const PROVIDER_FALLBACK: Record<ProviderErrorKind, FallbackReason> = {
  authentification: "fournisseur-configuration",
  facturation: "fournisseur-configuration",
  requete: "fournisseur-configuration",
  quota: "fournisseur-quota",
  indisponible: "fournisseur-indisponible",
  delai: "fournisseur-indisponible",
  refus: "refus",
  tronquee: "reponse-non-verifiable",
  "reponse-invalide": "reponse-non-verifiable",
};

export async function answerTutorRequest(
  input: TutorRequest,
  client: string,
  now: Date,
  deps: TutorDeps,
  /** Droit Premium vérifié côté serveur : l'IA est réservée aux abonnés (D-030). */
  premium: boolean,
): Promise<TutorOutcome> {
  const { text: message, removed } = redactPersonalData(input.message);
  const request: TutorRequest = { ...input, message };
  const redactions = Object.values(removed).reduce((sum, n) => sum + n, 0);
  const providerId = deps.provider?.id ?? null;

  if (!deps.limiter.hit(client, now)) {
    deps.log({ outcome: "trop-de-demandes", provider: providerId, redactions, passages: 0 });
    return { ok: false, error: "trop-de-demandes" };
  }

  const predefined = predefinedExplanations(request, deps.catalog, deps.resolveSource);
  const fallback = (reason: FallbackReason, extra: Partial<TutorLogEntry> = {}, passages = 0): TutorOutcome => {
    deps.log({ outcome: reason, provider: providerId, redactions, passages, ...extra });
    return { ok: true, response: { mode: "sans-ia", reason, notice: FALLBACK_MESSAGES[reason], predefined } };
  };

  if (!deps.provider) return fallback("aucun-fournisseur");
  if (!premium) return fallback("reserve-premium");

  const passages = validatedPassages(request, deps.catalog, deps.resolveSource);
  if (passages.length === 0) return fallback("aucune-source-fiable");

  if (deps.limiter.aiUsed(client, now) >= deps.limiter.aiPerDay) {
    return fallback("quota-quotidien", {}, passages.length);
  }

  const user = buildUserMessage(request, passages);
  const worstCase =
    costUsd(
      { inputTokens: estimateTokens(SYSTEM_PROMPT + user), outputTokens: deps.maxOutputTokens },
      deps.prices,
    ) * (deps.providerMayRetry ? 2 : 1);
  const reservation = deps.budget.reserve(worstCase, now);
  if (!reservation) return fallback("budget-atteint", {}, passages.length);
  deps.limiter.takeAi(client, now);

  const result = await deps.provider.generate({ system: SYSTEM_PROMPT, user, maxOutputTokens: deps.maxOutputTokens });

  // Coût réel quand il est connu ; sinon (erreur sans détail, modèle de repli
  // facturé à ses propres tarifs) on garde le pire cas réservé.
  const usage = result.usage;
  const spent = usage && !usage.fallbackModelUsed ? costUsd(usage, deps.prices) : worstCase;
  deps.budget.settle(reservation, spent, now);
  const metrics = {
    inputTokens: usage?.inputTokens,
    outputTokens: usage?.outputTokens,
    costUsd: Number(spent.toFixed(6)),
  };

  if (!result.ok) {
    return fallback(PROVIDER_FALLBACK[result.error], { ...metrics, providerError: result.error }, passages.length);
  }

  const check = checkAnswer(result.text, passages);
  if (!check.ok) {
    return fallback(
      check.reason === "hors-sources" ? "hors-sources" : "reponse-non-verifiable",
      { ...metrics, checkFailure: check.reason },
      passages.length,
    );
  }

  deps.log({ outcome: "ia", provider: providerId, redactions, passages: passages.length, ...metrics });
  return {
    ok: true,
    response: {
      mode: "ia",
      provider: deps.provider.label,
      text: check.text,
      citations: passages
        .filter((p) => check.refs.includes(p.ref))
        .map((p) => ({
          ref: p.ref,
          title: p.title,
          sources: p.sourceIds.flatMap((id) => {
            const source = deps.resolveSource(id);
            return source ? [source] : [];
          }),
        })),
      predefined,
    },
  };
}
