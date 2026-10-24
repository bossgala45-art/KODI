/**
 * Configuration du professeur, lue côté serveur uniquement (voir
 * src/lib/tutor/server.ts). Le mode IA exige TOUT à la fois : un fournisseur
 * nommé, sa clé, un budget quotidien strictement positif et des tarifs
 * connus. Il suffit qu'un élément manque pour rester en mode sans IA : une
 * clé seule ne déclenche jamais de dépense.
 */

export type TutorEnv = Partial<Record<string, string | undefined>>;

/** Tarifs publics (dollars par million de jetons), relevés le 24/10/2026. */
export const KNOWN_PRICES: Record<string, { inputPerMTok: number; outputPerMTok: number }> = {
  "claude-opus-5-5": { inputPerMTok: 4, outputPerMTok: 20 },
  "claude-sonnet-5-5": { inputPerMTok: 2, outputPerMTok: 10 },
  "claude-haiku-5-5": { inputPerMTok: 0.1, outputPerMTok: 0.5 },
};

/** Modèles qui refusent le paramètre de repli côté serveur. */
const NO_SERVER_FALLBACK = new Set(["claude-haiku-5-5"]);

export const DEFAULT_MODEL = "claude-opus-5-5";

export interface ActiveTutorConfig {
  mode: "ia";
  provider: "anthropic";
  apiKey: string;
  model: string;
  effort: "low" | "medium" | "high";
  serverFallback: boolean;
  dailyBudgetUsd: number;
  prices: { inputPerMTok: number; outputPerMTok: number };
  maxOutputTokens: number;
  perMinute: number;
  aiPerDay: number;
  timeoutMs: number;
}

export type TutorConfigProblem =
  | "non-configure"
  | "fournisseur-inconnu"
  | "cle-manquante"
  | "budget-nul"
  | "tarifs-inconnus";

export type TutorConfig =
  | ActiveTutorConfig
  | { mode: "sans-ia"; problem: TutorConfigProblem; perMinute: number; aiPerDay: number };

function number(value: string | undefined, fallback: number, min: number, max: number): number {
  if (value === undefined || value.trim() === "") return fallback;
  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function parseTutorConfig(env: TutorEnv): TutorConfig {
  const perMinute = Math.round(number(env.KODI_TUTOR_PER_MINUTE, 5, 1, 60));
  const aiPerDay = Math.round(number(env.KODI_TUTOR_AI_PER_DAY, 20, 0, 500));
  const off = (problem: TutorConfigProblem): TutorConfig => ({ mode: "sans-ia", problem, perMinute, aiPerDay });

  const provider = env.KODI_TUTOR_PROVIDER?.trim().toLowerCase() ?? "";
  if (!provider || provider === "aucun") return off("non-configure");
  if (provider !== "anthropic") return off("fournisseur-inconnu");

  const apiKey = env.ANTHROPIC_API_KEY?.trim() ?? "";
  if (!apiKey) return off("cle-manquante");

  const dailyBudgetUsd = number(env.KODI_TUTOR_DAILY_BUDGET_USD, 0, 0, 1000);
  if (!(dailyBudgetUsd > 0) || aiPerDay === 0) return off("budget-nul");

  const model = env.KODI_TUTOR_MODEL?.trim() || DEFAULT_MODEL;
  const known = KNOWN_PRICES[model];
  const input = number(env.KODI_TUTOR_PRICE_INPUT_USD, known?.inputPerMTok ?? NaN, 0, 1000);
  const output = number(env.KODI_TUTOR_PRICE_OUTPUT_USD, known?.outputPerMTok ?? NaN, 0, 1000);
  if (!(input > 0) || !(output > 0)) return off("tarifs-inconnus");

  const effort = env.KODI_TUTOR_EFFORT?.trim();
  const fallbackSetting = env.KODI_TUTOR_SERVER_FALLBACK?.trim().toLowerCase();

  return {
    mode: "ia",
    provider: "anthropic",
    apiKey,
    model,
    effort: effort === "medium" || effort === "high" ? effort : "low",
    serverFallback: !NO_SERVER_FALLBACK.has(model) && fallbackSetting !== "non",
    dailyBudgetUsd,
    prices: { inputPerMTok: input, outputPerMTok: output },
    maxOutputTokens: Math.round(number(env.KODI_TUTOR_MAX_OUTPUT_TOKENS, 1500, 200, 4000)),
    perMinute,
    aiPerDay,
    timeoutMs: Math.round(number(env.KODI_TUTOR_TIMEOUT_MS, 30_000, 5_000, 120_000)),
  };
}
