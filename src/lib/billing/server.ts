import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { LEGAL_DOCUMENTS_READY } from "@/content/legal";
import { parseBillingConfig, type ActiveBillingConfig, type BillingConfig } from "@/lib/billing/config";
import { ENVISAGED_PRICE } from "@/lib/billing/plans";
import type { BillingDeps, BillingStore } from "@/lib/billing/service";
import { supabaseConfig } from "@/lib/supabase/config";

/**
 * Point d'entrée serveur des paiements. Clés secrètes lues ici seulement
 * (jamais préfixées NEXT_PUBLIC_) ; ce module est interdit côté client.
 *
 * La clé serveur Supabase n'est utilisée que pour deux fonctions SQL
 * réservées à service_role : enregistrer un abonnement reçu du webhook, et
 * lire les identifiants Stripe d'un compte connecté.
 */
function readConfig(): BillingConfig {
  return parseBillingConfig(
    {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
      KODI_SITE_URL: process.env.KODI_SITE_URL,
      KODI_BILLING_ALLOW_LIVE: process.env.KODI_BILLING_ALLOW_LIVE,
      SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    },
    supabaseConfig.ok ? supabaseConfig.config.url : null,
    { priceConfirmed: ENVISAGED_PRICE.confirmed, legalReady: LEGAL_DOCUMENTS_READY },
  );
}

function supabaseStore(admin: SupabaseClient): BillingStore {
  return {
    async apply(row) {
      const { data, error } = await admin.rpc("billing_apply_subscription", {
        p_event_id: row.eventId,
        p_event_type: row.eventType,
        p_user: row.userId,
        p_customer: row.customerId,
        p_subscription: row.subscriptionId,
        p_price: row.priceId,
        p_status: row.status,
        p_current_period_end: row.currentPeriodEnd?.toISOString() ?? null,
        p_cancel_at_period_end: row.cancelAtPeriodEnd,
        p_started_at: row.startedAt.toISOString(),
        p_livemode: row.livemode,
      });
      if (error) throw new Error("KODI_BILLING_STORE");
      return data as "applique" | "ignore" | "deja-traite";
    },
    async customerOf(userId) {
      const { data, error } = await admin.rpc("billing_customer_of", { p_user: userId });
      if (error) throw new Error("KODI_BILLING_STORE");
      const row = (data as { customer_id: string | null; subscription_id: string | null; status: string | null; started_at: string | null }[])[0];
      if (!row) return null;
      return {
        customerId: row.customer_id,
        subscriptionId: row.subscription_id,
        status: row.status,
        startedAt: row.started_at ? new Date(row.started_at) : null,
      };
    },
  };
}

let cached: { config: BillingConfig; deps: BillingDeps | null } | null = null;

function load() {
  if (cached) return cached;
  const config = readConfig();
  if (config.mode === "inactif") {
    cached = { config, deps: null };
    return cached;
  }
  const active: ActiveBillingConfig = config;
  const admin = createClient(active.supabaseUrl, active.supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  cached = {
    config,
    deps: {
      stripe: new Stripe(active.secretKey, { maxNetworkRetries: 2, timeout: 20_000 }),
      store: supabaseStore(admin),
      mode: active.mode,
      priceId: active.priceId,
      siteUrl: active.siteUrl,
      webhookSecret: active.webhookSecret,
      now: () => new Date(),
    },
  };
  return cached;
}

export interface BillingStatus {
  mode: "inactif" | "test" | "live";
  problems: string[];
}

export function billingStatus(): BillingStatus {
  const { config } = load();
  return config.mode === "inactif" ? { mode: "inactif", problems: config.problems } : { mode: config.mode, problems: [] };
}

export function billingDeps(): BillingDeps | null {
  return load().deps;
}
