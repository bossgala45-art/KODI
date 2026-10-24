/**
 * Configuration des paiements, lue côté serveur uniquement (voir
 * src/lib/billing/server.ts). Les paiements ne sont actifs que si TOUT est
 * présent et cohérent ; sinon KODI reste sans paiement, ce qui est affiché.
 *
 * Environnement de test d'abord : une clé Stripe « live » est refusée tant
 * que KODI_BILLING_ALLOW_LIVE=oui n'est pas défini (décision du porteur, après
 * la liste de contrôle de docs/PAIEMENTS.md).
 */

export type BillingEnv = Partial<Record<string, string | undefined>>;

export type BillingProblem =
  | "cle-stripe-manquante"
  | "cle-stripe-invalide"
  | "live-non-autorise"
  | "prix-non-confirme"
  | "documents-legaux-incomplets"
  | "secret-webhook-manquant"
  | "prix-manquant"
  | "adresse-du-site-manquante"
  | "cle-serveur-supabase-manquante"
  | "supabase-non-configure";

export interface ActiveBillingConfig {
  mode: "test" | "live";
  secretKey: string;
  webhookSecret: string;
  priceId: string;
  siteUrl: string;
  supabaseUrl: string;
  supabaseSecretKey: string;
}

export type BillingConfig = ActiveBillingConfig | { mode: "inactif"; problems: BillingProblem[] };

function siteUrlOf(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && !(local && url.protocol === "http:")) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export interface LiveGuards {
  /** Prix confirmé par le porteur (ENVISAGED_PRICE.confirmed). */
  priceConfirmed: boolean;
  /** CGV et mentions légales complètes (LEGAL_DOCUMENTS_READY). */
  legalReady: boolean;
}

export function parseBillingConfig(env: BillingEnv, supabaseUrl: string | null, guards: LiveGuards): BillingConfig {
  const problems: BillingProblem[] = [];
  const secretKey = env.STRIPE_SECRET_KEY?.trim() ?? "";
  const keyMode = /^(sk|rk)_test_[A-Za-z0-9]+$/.test(secretKey)
    ? "test"
    : /^(sk|rk)_live_[A-Za-z0-9]+$/.test(secretKey)
      ? "live"
      : null;

  if (!secretKey) problems.push("cle-stripe-manquante");
  else if (!keyMode) problems.push("cle-stripe-invalide");
  else if (keyMode === "live" && env.KODI_BILLING_ALLOW_LIVE?.trim().toLowerCase() !== "oui") {
    problems.push("live-non-autorise");
  }
  if (keyMode === "live" && !guards.priceConfirmed) problems.push("prix-non-confirme");
  if (keyMode === "live" && !guards.legalReady) problems.push("documents-legaux-incomplets");

  const webhookSecret = env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  if (!/^whsec_[A-Za-z0-9]+$/.test(webhookSecret)) problems.push("secret-webhook-manquant");

  const priceId = env.STRIPE_PRICE_ID?.trim() ?? "";
  if (!/^price_[A-Za-z0-9]+$/.test(priceId)) problems.push("prix-manquant");

  const siteUrl = siteUrlOf(env.KODI_SITE_URL);
  if (!siteUrl) problems.push("adresse-du-site-manquante");

  const supabaseSecretKey = env.SUPABASE_SECRET_KEY?.trim() ?? "";
  if (!/^sb_secret_[A-Za-z0-9_-]+$/.test(supabaseSecretKey)) problems.push("cle-serveur-supabase-manquante");
  if (!supabaseUrl) problems.push("supabase-non-configure");

  if (problems.length > 0 || !keyMode || !siteUrl || !supabaseUrl) return { mode: "inactif", problems };
  return { mode: keyMode, secretKey, webhookSecret, priceId, siteUrl, supabaseUrl, supabaseSecretKey };
}

export const PROBLEM_LABELS: Record<BillingProblem, string> = {
  "cle-stripe-manquante": "aucune clé Stripe",
  "cle-stripe-invalide": "clé Stripe au format inattendu",
  "live-non-autorise": "clé Stripe de production refusée (mode test exigé)",
  "prix-non-confirme": "prix de vente pas encore confirmé",
  "documents-legaux-incomplets": "CGV et mentions légales incomplètes",
  "secret-webhook-manquant": "secret de webhook Stripe absent",
  "prix-manquant": "identifiant de prix Stripe absent",
  "adresse-du-site-manquante": "adresse publique du site absente",
  "cle-serveur-supabase-manquante": "clé serveur Supabase absente",
  "supabase-non-configure": "Supabase non configuré",
};
