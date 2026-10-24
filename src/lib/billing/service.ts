/**
 * Opérations de paiement (Stripe Checkout + Stripe Billing), indépendantes
 * de l'environnement : le client Stripe et le stockage sont injectés, ce qui
 * permet de tout tester sans réseau et sans faux paiement.
 */
import type Stripe from "stripe";
import { handleStripeEvent, USER_METADATA_KEY, type ApplyOutcome, type EventOutcome, type SubscriptionRow } from "@/lib/billing/stripe-events";
import { withdrawalOpen } from "@/lib/billing/withdrawal";

/** Sous-ensemble du SDK Stripe utilisé par KODI. */
export interface StripeLike {
  checkout: { sessions: { create(params: Stripe.Checkout.SessionCreateParams): Promise<Pick<Stripe.Checkout.Session, "id" | "url">> } };
  billingPortal: {
    sessions: { create(params: Stripe.BillingPortal.SessionCreateParams): Promise<Pick<Stripe.BillingPortal.Session, "url">> };
  };
  subscriptions: {
    retrieve(id: string): Promise<Stripe.Subscription>;
    update(id: string, params: Stripe.SubscriptionUpdateParams): Promise<Stripe.Subscription>;
    cancel(id: string, params?: Stripe.SubscriptionCancelParams): Promise<Stripe.Subscription>;
  };
  invoicePayments: { list(params: Stripe.InvoicePaymentListParams): Promise<{ data: Stripe.InvoicePayment[] }> };
  refunds: { create(params: Stripe.RefundCreateParams): Promise<Pick<Stripe.Refund, "id" | "amount" | "status">> };
  webhooks: { constructEvent(payload: string, header: string, secret: string): Stripe.Event };
}

export interface CustomerRecord {
  customerId: string | null;
  subscriptionId: string | null;
  status: string | null;
  startedAt: Date | null;
}

export interface BillingStore {
  apply(row: SubscriptionRow): Promise<ApplyOutcome>;
  customerOf(userId: string): Promise<CustomerRecord | null>;
}

export interface BillingDeps {
  stripe: StripeLike;
  store: BillingStore;
  mode: "test" | "live";
  priceId: string;
  siteUrl: string;
  webhookSecret: string;
  now: () => Date;
}

export interface BillingUser {
  id: string;
  email: string | null;
}

export type BillingError =
  | "deja-abonne"
  | "aucun-abonnement"
  | "consentement-requis"
  | "delai-de-retractation-depasse"
  | "stripe-indisponible";

export type Result<T> = { ok: true; value: T } | { ok: false; error: BillingError };

const ACTIVE = new Set(["active", "trialing", "past_due"]);

async function safely<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, value: await fn() };
  } catch {
    return { ok: false, error: "stripe-indisponible" };
  }
}

/**
 * Création d'une session Stripe Checkout. Exige que la personne ait accepté
 * les CGV et demandé l'accès immédiat (information précontractuelle affichée
 * par KODI avant le bouton « Commander avec obligation de paiement »).
 */
export async function createCheckout(
  user: BillingUser,
  consent: { cgv: boolean; immediateAccess: boolean },
  deps: BillingDeps,
): Promise<Result<{ url: string }>> {
  if (!consent.cgv || !consent.immediateAccess) return { ok: false, error: "consentement-requis" };
  const existing = await deps.store.customerOf(user.id);
  if (existing?.status && ACTIVE.has(existing.status)) return { ok: false, error: "deja-abonne" };

  const result = await safely(() =>
    deps.stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: deps.priceId, quantity: 1 }],
      client_reference_id: user.id,
      ...(existing?.customerId ? { customer: existing.customerId } : user.email ? { customer_email: user.email } : {}),
      metadata: { [USER_METADATA_KEY]: user.id },
      subscription_data: { metadata: { [USER_METADATA_KEY]: user.id } },
      locale: "fr",
      success_url: `${deps.siteUrl}/abonnement?paiement=termine`,
      cancel_url: `${deps.siteUrl}/premium?paiement=annule`,
    }),
  );
  if (!result.ok) return result;
  if (!result.value.url) return { ok: false, error: "stripe-indisponible" };
  return { ok: true, value: { url: result.value.url } };
}

/** Portail client Stripe : moyen de paiement, factures. */
export async function createPortal(userId: string, deps: BillingDeps): Promise<Result<{ url: string }>> {
  const record = await deps.store.customerOf(userId);
  if (!record?.customerId) return { ok: false, error: "aucun-abonnement" };
  return safely(async () => {
    const session = await deps.stripe.billingPortal.sessions.create({
      customer: record.customerId!,
      return_url: `${deps.siteUrl}/abonnement`,
    });
    return { url: session.url };
  });
}

/**
 * Résiliation (troisième clic, « Notifier la résiliation ») : l'abonnement
 * s'arrête à la fin de la période déjà payée, sans frais.
 */
export async function cancelSubscription(userId: string, deps: BillingDeps): Promise<Result<{ endsAt: Date | null }>> {
  const record = await deps.store.customerOf(userId);
  if (!record?.subscriptionId || !record.status || !ACTIVE.has(record.status)) {
    return { ok: false, error: "aucun-abonnement" };
  }
  return safely(async () => {
    const subscription = await deps.stripe.subscriptions.update(record.subscriptionId!, { cancel_at_period_end: true });
    const ends = subscription.items.data.map((item) => item.current_period_end);
    return { endsAt: ends.length > 0 ? new Date(Math.max(...ends) * 1000) : null };
  });
}

/**
 * Rétractation dans le délai légal : arrêt immédiat et remboursement intégral
 * du dernier paiement (choix de KODI, plus favorable que le minimum légal).
 * Si le remboursement échoue, l'abonnement reste arrêté et l'échec est
 * signalé : il devra être fait à la main dans Stripe.
 */
export async function withdraw(
  userId: string,
  deps: BillingDeps,
): Promise<Result<{ refundedCents: number; refundFailed: boolean }>> {
  const record = await deps.store.customerOf(userId);
  if (!record?.subscriptionId || !record.status || !ACTIVE.has(record.status)) {
    return { ok: false, error: "aucun-abonnement" };
  }
  if (!withdrawalOpen(record.startedAt, deps.now())) return { ok: false, error: "delai-de-retractation-depasse" };

  const canceled = await safely(() => deps.stripe.subscriptions.cancel(record.subscriptionId!));
  if (!canceled.ok) return canceled;

  const invoiceId =
    typeof canceled.value.latest_invoice === "string" ? canceled.value.latest_invoice : canceled.value.latest_invoice?.id;
  let refundedCents = 0;
  let refundFailed = false;
  if (invoiceId) {
    try {
      const payments = await deps.stripe.invoicePayments.list({ invoice: invoiceId });
      for (const payment of payments.data) {
        const intent = payment.payment.payment_intent;
        const intentId = typeof intent === "string" ? intent : intent?.id;
        if (payment.status !== "paid" || !intentId) continue;
        const refund = await deps.stripe.refunds.create({ payment_intent: intentId, reason: "requested_by_customer" });
        refundedCents += refund.amount;
      }
    } catch {
      refundFailed = true;
    }
  }
  return { ok: true, value: { refundedCents, refundFailed } };
}

export type WebhookResult =
  | { status: 400; outcome: "signature-invalide" }
  | { status: 500; outcome: "erreur-temporaire" }
  | { status: 200; outcome: EventOutcome };

/** Webhook : signature vérifiée sur le corps brut, puis traitement idempotent. */
export async function handleWebhook(rawBody: string, signature: string | null, deps: BillingDeps): Promise<WebhookResult> {
  if (!signature) return { status: 400, outcome: "signature-invalide" };
  let event: Stripe.Event;
  try {
    event = deps.stripe.webhooks.constructEvent(rawBody, signature, deps.webhookSecret);
  } catch {
    return { status: 400, outcome: "signature-invalide" };
  }
  try {
    const outcome = await handleStripeEvent(event, {
      mode: deps.mode,
      priceId: deps.priceId,
      retrieveSubscription: (id) => deps.stripe.subscriptions.retrieve(id),
      apply: (row) => deps.store.apply(row),
    });
    return { status: 200, outcome };
  } catch {
    // Stripe renverra l'événement : rien n'a été enregistré.
    return { status: 500, outcome: "erreur-temporaire" };
  }
}
