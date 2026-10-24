import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { CATALOG, UNIVERSES, sourceLink } from "@/content/catalog";
import { SOURCES } from "@/content/sources";
import { createAnthropicProvider } from "@/lib/tutor/anthropic";
import { parseTutorConfig, type TutorConfig } from "@/lib/tutor/config";
import { DailyBudget, RateLimiter } from "@/lib/tutor/limits";
import { validatedContentCount, type SourceResolver, type TutorCatalog } from "@/lib/tutor/sources";
import { answerTutorRequest, type TutorDeps, type TutorLogEntry, type TutorOutcome } from "@/lib/tutor/tutor";
import type { TutorRequest, TutorStatus } from "@/lib/tutor/types";

/**
 * Point d'entrée serveur du professeur. Les variables ci-dessous ne sont
 * JAMAIS préfixées par NEXT_PUBLIC_ : elles ne sont pas envoyées au
 * navigateur. Ce module est interdit côté client (`server-only`).
 */
function readConfig(): TutorConfig {
  return parseTutorConfig({
    KODI_TUTOR_PROVIDER: process.env.KODI_TUTOR_PROVIDER,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    KODI_TUTOR_MODEL: process.env.KODI_TUTOR_MODEL,
    KODI_TUTOR_EFFORT: process.env.KODI_TUTOR_EFFORT,
    KODI_TUTOR_SERVER_FALLBACK: process.env.KODI_TUTOR_SERVER_FALLBACK,
    KODI_TUTOR_DAILY_BUDGET_USD: process.env.KODI_TUTOR_DAILY_BUDGET_USD,
    KODI_TUTOR_PRICE_INPUT_USD: process.env.KODI_TUTOR_PRICE_INPUT_USD,
    KODI_TUTOR_PRICE_OUTPUT_USD: process.env.KODI_TUTOR_PRICE_OUTPUT_USD,
    KODI_TUTOR_MAX_OUTPUT_TOKENS: process.env.KODI_TUTOR_MAX_OUTPUT_TOKENS,
    KODI_TUTOR_PER_MINUTE: process.env.KODI_TUTOR_PER_MINUTE,
    KODI_TUTOR_AI_PER_DAY: process.env.KODI_TUTOR_AI_PER_DAY,
    KODI_TUTOR_TIMEOUT_MS: process.env.KODI_TUTOR_TIMEOUT_MS,
  });
}

const catalog: TutorCatalog = { universes: UNIVERSES, lessons: CATALOG.lessons, questions: CATALOG.questions };
const resolveSource: SourceResolver = (id) => (id in SOURCES ? sourceLink(id) : null);

/** Sel tiré au démarrage, jamais stocké : les empreintes ne sont pas réversibles ni durables. */
const salt = randomBytes(16);

export function clientFingerprint(ip: string, userAgent: string): string {
  return createHash("sha256").update(salt).update(ip).update("\u0000").update(userAgent).digest("hex").slice(0, 32);
}

function log(entry: TutorLogEntry) {
  process.stdout.write(`${JSON.stringify({ event: "professeur", ...entry })}\n`);
}

let deps: TutorDeps | null = null;
let config: TutorConfig | null = null;

function getDeps(): TutorDeps {
  if (deps) return deps;
  config = readConfig();
  const active = config.mode === "ia" ? config : null;
  deps = {
    provider: active
      ? createAnthropicProvider({
          apiKey: active.apiKey,
          model: active.model,
          effort: active.effort,
          serverFallback: active.serverFallback,
          timeoutMs: active.timeoutMs,
        })
      : null,
    prices: active?.prices ?? { inputPerMTok: 0, outputPerMTok: 0 },
    maxOutputTokens: active?.maxOutputTokens ?? 0,
    providerMayRetry: active?.serverFallback ?? false,
    catalog,
    resolveSource,
    limiter: new RateLimiter({ perMinute: config.perMinute, aiPerDay: config.aiPerDay }),
    budget: new DailyBudget(active?.dailyBudgetUsd ?? 0),
    log,
  };
  return deps;
}

export function tutorStatus(): TutorStatus {
  const current = getDeps();
  return {
    mode: current.provider ? "ia" : "sans-ia",
    providerLabel: current.provider?.label ?? null,
    validatedContents: validatedContentCount(catalog, resolveSource),
  };
}

export function askTutor(request: TutorRequest, client: string, premium: boolean): Promise<TutorOutcome> {
  return answerTutorRequest(request, client, new Date(), getDeps(), premium);
}
