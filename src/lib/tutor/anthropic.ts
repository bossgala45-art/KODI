import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { ProviderErrorKind, ProviderInput, ProviderResult, ProviderUsage, TutorProvider } from "@/lib/tutor/provider";

/**
 * Adaptateur Anthropic (SDK officiel @anthropic-ai/sdk), utilisé uniquement
 * côté serveur. N'est créé que si une clé et un budget sont configurés
 * (voir src/lib/tutor/config.ts) : sans cela, KODI reste en mode sans IA.
 */

type CreateParams = Anthropic.Beta.Messages.MessageCreateParamsNonStreaming;
type BetaMessage = Anthropic.Beta.Messages.BetaMessage;

/** Sous-ensemble du client utilisé : permet de le remplacer dans les tests. */
export interface MessagesClient {
  beta: { messages: { create(params: CreateParams): PromiseLike<BetaMessage> } };
}

export interface AnthropicOptions {
  apiKey: string;
  model: string;
  effort: "low" | "medium" | "high";
  /** Nouvel essai côté serveur sur un autre modèle si le premier refuse. */
  serverFallback: boolean;
  timeoutMs: number;
  client?: MessagesClient;
}

export const SERVER_FALLBACK_BETA = "server-side-fallback-2026-07-01";

/** Traduit une erreur du SDK en catégorie stable (classes typées, jamais le texte). */
export function classifyAnthropicError(error: unknown): ProviderErrorKind {
  if (error instanceof Anthropic.APIConnectionTimeoutError) return "delai";
  if (error instanceof Anthropic.APIConnectionError) return "indisponible";
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    return "authentification";
  }
  if (error instanceof Anthropic.RateLimitError) return "quota";
  if (error instanceof Anthropic.APIError) {
    if (error.status === 402) return "facturation";
    if (error.status === 408 || error.status === 504) return "delai";
    if (typeof error.status === "number" && error.status >= 500) return "indisponible";
    return "requete";
  }
  return "indisponible";
}

function usageOf(message: BetaMessage): ProviderUsage {
  return {
    inputTokens:
      message.usage.input_tokens +
      (message.usage.cache_creation_input_tokens ?? 0) +
      (message.usage.cache_read_input_tokens ?? 0),
    outputTokens: message.usage.output_tokens,
    fallbackModelUsed: (message.usage.iterations ?? []).some((entry) => entry.type === "fallback_message"),
  };
}

export function createAnthropicProvider(options: AnthropicOptions): TutorProvider {
  const client: MessagesClient =
    options.client ?? new Anthropic({ apiKey: options.apiKey, timeout: options.timeoutMs, maxRetries: 1 });

  return {
    id: "anthropic",
    label: "Claude, d’Anthropic",
    async generate(input: ProviderInput): Promise<ProviderResult> {
      let message: BetaMessage;
      try {
        message = await client.beta.messages.create({
          model: options.model,
          max_tokens: input.maxOutputTokens,
          system: input.system,
          messages: [{ role: "user", content: input.user }],
          output_config: { effort: options.effort },
          ...(options.serverFallback ? { betas: [SERVER_FALLBACK_BETA], fallbacks: "default" as const } : {}),
        });
      } catch (error) {
        return { ok: false, error: classifyAnthropicError(error) };
      }

      const usage = usageOf(message);
      // Le motif d'arrêt est lu avant le contenu.
      if (message.stop_reason === "refusal") return { ok: false, error: "refus", usage };
      if (message.stop_reason === "max_tokens" || message.stop_reason === "model_context_window_exceeded") {
        return { ok: false, error: "tronquee", usage };
      }
      if (message.stop_reason !== "end_turn") return { ok: false, error: "reponse-invalide", usage };

      const text = message.content
        .flatMap((block) => (block.type === "text" ? [block.text] : []))
        .join("\n")
        .trim();
      if (!text) return { ok: false, error: "reponse-invalide", usage };
      return { ok: true, text, usage };
    },
  };
}
