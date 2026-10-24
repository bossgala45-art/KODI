// @vitest-environment node
import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import { parseBillingConfig } from "@/lib/billing/config";
import { ENVISAGED_PRICE, PLAN_FEATURES, formatPrice, hasFeature } from "@/lib/billing/plans";
import {
  cancelSubscription,
  createCheckout,
  createPortal,
  handleWebhook,
  withdraw,
  type BillingDeps,
  type CustomerRecord,
  type StripeLike,
} from "@/lib/billing/service";
import { rowOf, subscriptionIdOf, type SubscriptionRow } from "@/lib/billing/stripe-events";
import { withdrawalDeadline, withdrawalOpen } from "@/lib/billing/withdrawal";

const USER = "6f1c2a7e-1111-4222-8333-944445555666";
const SECRET = "whsec_testsecret";
const PRICE = "price_kodi";
const NOW = new Date("2026-10-24T12:00:00Z");
const PERIOD_END = Math.floor(new Date("2026-11-24T12:00:00Z").getTime() / 1000);

function subscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
  return {
    id: "sub_1",
    object: "subscription",
    customer: "cus_1",
    status: "active",
    livemode: false,
    cancel_at_period_end: false,
    cancel_at: null,
    start_date: Math.floor(NOW.getTime() / 1000),
    metadata: { kodi_user_id: USER },
    latest_invoice: "in_1",
    items: {
      object: "list",
      data: [{ id: "si_1", current_period_end: PERIOD_END, price: { id: PRICE } }],
    },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

function event(type: string, object: Record<string, unknown>, overrides: Record<string, unknown> = {}) {
  return { id: `evt_${type.replace(/\W/g, "")}`, object: "event", type, livemode: false, data: { object }, ...overrides };
}

function signed(payload: object) {
  const body = JSON.stringify(payload);
  return { body, signature: Stripe.webhooks.generateTestHeaderString({ payload: body, secret: SECRET }) };
}

function setup(options: { record?: CustomerRecord | null; sub?: Stripe.Subscription; failStripe?: boolean } = {}) {
  const applied: SubscriptionRow[] = [];
  const seen = new Set<string>();
  const stripe = {
    checkout: { sessions: { create: vi.fn(async () => ({ id: "cs_1", url: "https://checkout.stripe.com/c/pay/cs_1" })) } },
    billingPortal: { sessions: { create: vi.fn(async () => ({ url: "https://billing.stripe.com/p/session/1" })) } },
    subscriptions: {
      retrieve: vi.fn(async () => {
        if (options.failStripe) throw new Error("réseau");
        return options.sub ?? subscription();
      }),
      update: vi.fn(async () => subscription({ cancel_at_period_end: true })),
      cancel: vi.fn(async () => subscription({ status: "canceled" })),
    },
    invoicePayments: {
      list: vi.fn(async () => ({ data: [{ status: "paid", payment: { type: "payment_intent", payment_intent: "pi_1" } }] })),
    },
    refunds: { create: vi.fn(async () => ({ id: "re_1", amount: 499, status: "succeeded" })) },
    webhooks: Stripe.webhooks,
  };
  const deps: BillingDeps = {
    stripe: stripe as unknown as StripeLike,
    store: {
      async apply(row) {
        if (seen.has(row.eventId)) return "deja-traite";
        seen.add(row.eventId);
        if (!row.userId) return "ignore";
        applied.push(row);
        return "applique";
      },
      customerOf: vi.fn(async () => (options.record === undefined ? null : options.record)),
    },
    mode: "test",
    priceId: PRICE,
    siteUrl: "https://kodi.example",
    webhookSecret: SECRET,
    now: () => NOW,
  };
  return { deps, stripe, applied };
}

describe("informations du vendeur", () => {
  it("aucune n’est inventée : les documents légaux sont incomplets", async () => {
    const { SELLER, LEGAL_DOCUMENTS_READY, MISSING_SELLER_FIELDS } = await import("@/content/legal");
    expect(Object.values(SELLER).every((value) => value === null)).toBe(true);
    expect(LEGAL_DOCUMENTS_READY).toBe(false);
    expect(MISSING_SELLER_FIELDS).toContain("mediator");
  });
});

describe("offres", () => {
  it("affiche le prix envisagé, non confirmé", () => {
    expect(formatPrice(ENVISAGED_PRICE.amountCents)).toBe("4,99 €");
    expect(ENVISAGED_PRICE.confirmed).toBe(false);
  });

  it("répartit les fonctionnalités entre gratuit et Premium", () => {
    for (const feature of ["cours-essentiels", "quiz", "corrections", "examens", "scenes-decouverte", "coach-basique"] as const) {
      expect(hasFeature("free", feature)).toBe(true);
    }
    for (const feature of ["cours-complets", "scenes-toutes", "statistiques-avancees", "coach-etendu", "professeur-ia"] as const) {
      expect(hasFeature("free", feature)).toBe(false);
      expect(hasFeature("premium", feature)).toBe(true);
    }
    expect(PLAN_FEATURES.find((f) => f.feature === "examens")).toMatchObject({ free: "1 par jour", premium: "Illimités" });
  });
});

describe("configuration", () => {
  const full = {
    STRIPE_SECRET_KEY: "sk_test_abc123",
    STRIPE_WEBHOOK_SECRET: "whsec_abc",
    STRIPE_PRICE_ID: "price_abc",
    KODI_SITE_URL: "https://kodi.example/chemin",
    SUPABASE_SECRET_KEY: "sb_secret_abc",
  };
  const supabase = "https://projet.supabase.co";
  const ready = { priceConfirmed: true, legalReady: true };
  const today = { priceConfirmed: false, legalReady: false };

  it("reste sans paiement tant que quelque chose manque", () => {
    expect(parseBillingConfig({}, null, today)).toEqual({
      mode: "inactif",
      problems: [
        "cle-stripe-manquante",
        "secret-webhook-manquant",
        "prix-manquant",
        "adresse-du-site-manquante",
        "cle-serveur-supabase-manquante",
        "supabase-non-configure",
      ],
    });
    expect(parseBillingConfig({ ...full, STRIPE_SECRET_KEY: "pk_test_abc" }, supabase, today)).toMatchObject({
      problems: ["cle-stripe-invalide"],
    });
    expect(parseBillingConfig({ ...full, KODI_SITE_URL: "http://kodi.example" }, supabase, today)).toMatchObject({
      problems: ["adresse-du-site-manquante"],
    });
  });

  it("mode test d’abord : une clé de production est refusée sans autorisation explicite", () => {
    // Le mode test fonctionne même si le prix et les documents légaux ne sont pas prêts.
    expect(parseBillingConfig(full, supabase, today)).toMatchObject({ mode: "test", siteUrl: "https://kodi.example" });
    const live = { ...full, STRIPE_SECRET_KEY: "sk_live_abc" };
    expect(parseBillingConfig(live, supabase, ready)).toEqual({ mode: "inactif", problems: ["live-non-autorise"] });
    // Aujourd'hui : prix non confirmé, documents légaux incomplets → production refusée même autorisée.
    expect(parseBillingConfig({ ...live, KODI_BILLING_ALLOW_LIVE: "oui" }, supabase, today)).toEqual({
      mode: "inactif",
      problems: ["prix-non-confirme", "documents-legaux-incomplets"],
    });
    expect(parseBillingConfig({ ...live, KODI_BILLING_ALLOW_LIVE: "oui" }, supabase, ready)).toMatchObject({ mode: "live" });
  });
});

describe("webhook : signature et idempotence", () => {
  it("refuse un événement sans signature, mal signé ou modifié", async () => {
    const { deps, applied } = setup();
    const payload = event("customer.subscription.updated", { id: "sub_1", object: "subscription" });
    const { body, signature } = signed(payload);
    expect(await handleWebhook(body, null, deps)).toEqual({ status: 400, outcome: "signature-invalide" });
    expect(await handleWebhook(body, "t=1,v1=faux", deps)).toEqual({ status: 400, outcome: "signature-invalide" });
    const tampered = body.replace("sub_1", "sub_2");
    expect(await handleWebhook(tampered, signature, deps)).toEqual({ status: 400, outcome: "signature-invalide" });
    const other = Stripe.webhooks.generateTestHeaderString({ payload: body, secret: "whsec_autre" });
    expect(await handleWebhook(body, other, deps)).toEqual({ status: 400, outcome: "signature-invalide" });
    expect(applied).toHaveLength(0);
  });

  it("refuse une signature trop ancienne (rejeu)", async () => {
    const { deps } = setup();
    const body = JSON.stringify(event("customer.subscription.updated", { id: "sub_1" }));
    const old = Stripe.webhooks.generateTestHeaderString({ payload: body, secret: SECRET, timestamp: Math.floor(Date.now() / 1000) - 3600 });
    expect(await handleWebhook(body, old, deps)).toEqual({ status: 400, outcome: "signature-invalide" });
  });

  it("applique l’abonnement relu chez Stripe, une seule fois par événement", async () => {
    const { deps, applied, stripe } = setup();
    const { body, signature } = signed(event("customer.subscription.updated", { id: "sub_1", status: "canceled" }));
    expect(await handleWebhook(body, signature, deps)).toEqual({ status: 200, outcome: "applique" });
    expect(await handleWebhook(body, signature, deps)).toEqual({ status: 200, outcome: "deja-traite" });
    expect(applied).toHaveLength(1);
    // L'état enregistré est celui relu chez Stripe (actif), pas celui de l'événement.
    expect(applied[0]).toMatchObject({ userId: USER, status: "active", customerId: "cus_1", priceId: PRICE });
    expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith("sub_1");
  });

  it("relie la session de paiement, les factures payées et les échecs à l’abonnement", () => {
    const checkout = event("checkout.session.completed", { mode: "subscription", subscription: "sub_9", client_reference_id: USER });
    const paid = event("invoice.paid", { parent: { subscription_details: { subscription: "sub_8" } } });
    const failed = event("invoice.payment_failed", { parent: { subscription_details: { subscription: { id: "sub_7" } } } });
    const payment = event("checkout.session.completed", { mode: "payment", subscription: null });
    const other = event("customer.created", { id: "cus_1" });
    expect([checkout, paid, failed, payment, other].map((e) => subscriptionIdOf(e as unknown as Stripe.Event))).toEqual([
      "sub_9",
      "sub_8",
      "sub_7",
      null,
      null,
    ]);
  });

  it("ignore les événements non concernés, d’un autre environnement ou d’un autre prix", async () => {
    const other = setup();
    const a = signed(event("customer.created", { id: "cus_1" }));
    expect(await handleWebhook(a.body, a.signature, other.deps)).toEqual({ status: 200, outcome: "non-concerne" });
    const b = signed(event("customer.subscription.updated", { id: "sub_1" }, { livemode: true }));
    expect(await handleWebhook(b.body, b.signature, other.deps)).toEqual({ status: 200, outcome: "autre-environnement" });

    const foreignPrice = setup({
      sub: subscription({ items: { object: "list", data: [{ current_period_end: PERIOD_END, price: { id: "price_autre" } }] } as never }),
    });
    const c = signed(event("customer.subscription.updated", { id: "sub_1" }));
    expect(await handleWebhook(c.body, c.signature, foreignPrice.deps)).toEqual({ status: 200, outcome: "ignore" });
    expect(foreignPrice.applied).toHaveLength(0);
  });

  it("répond 500 si Stripe est injoignable : l’événement sera renvoyé, rien n’est enregistré", async () => {
    const { deps, applied } = setup({ failStripe: true });
    const { body, signature } = signed(event("invoice.paid", { parent: { subscription_details: { subscription: "sub_1" } } }));
    expect(await handleWebhook(body, signature, deps)).toEqual({ status: 500, outcome: "erreur-temporaire" });
    expect(applied).toHaveLength(0);
  });

  it("lit la fin de période, la résiliation programmée et le compte KODI", () => {
    const e = event("customer.subscription.updated", {}) as unknown as Stripe.Event;
    expect(rowOf(subscription({ cancel_at: PERIOD_END }), e)).toMatchObject({
      cancelAtPeriodEnd: true,
      currentPeriodEnd: new Date(PERIOD_END * 1000),
      userId: USER,
    });
    expect(rowOf(subscription({ metadata: { kodi_user_id: "pas-un-uuid" } }), e).userId).toBeNull();
    const checkout = event("checkout.session.completed", { client_reference_id: USER }) as unknown as Stripe.Event;
    expect(rowOf(subscription({ metadata: {} }), checkout).userId).toBe(USER);
  });
});

describe("souscription et gestion", () => {
  it("exige l’acceptation des CGV et la demande d’accès immédiat", async () => {
    const { deps, stripe } = setup();
    expect(await createCheckout({ id: USER, email: "a@b.fr" }, { cgv: false, immediateAccess: true }, deps)).toEqual({
      ok: false,
      error: "consentement-requis",
    });
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("crée une session Checkout d’abonnement rattachée au compte", async () => {
    const { deps, stripe } = setup();
    expect(await createCheckout({ id: USER, email: "a@b.fr" }, { cgv: true, immediateAccess: true }, deps)).toEqual({
      ok: true,
      value: { url: "https://checkout.stripe.com/c/pay/cs_1" },
    });
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        line_items: [{ price: PRICE, quantity: 1 }],
        client_reference_id: USER,
        customer_email: "a@b.fr",
        subscription_data: { metadata: { kodi_user_id: USER } },
        success_url: "https://kodi.example/abonnement?paiement=termine",
      }),
    );
  });

  it("refuse un second abonnement et reprend le client Stripe existant", async () => {
    const active = setup({ record: { customerId: "cus_1", subscriptionId: "sub_1", status: "active", startedAt: NOW } });
    expect(await createCheckout({ id: USER, email: null }, { cgv: true, immediateAccess: true }, active.deps)).toEqual({
      ok: false,
      error: "deja-abonne",
    });
    const former = setup({ record: { customerId: "cus_1", subscriptionId: "sub_0", status: "canceled", startedAt: NOW } });
    await createCheckout({ id: USER, email: "a@b.fr" }, { cgv: true, immediateAccess: true }, former.deps);
    expect(former.stripe.checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({ customer: "cus_1" }));
  });

  it("portail client : seulement pour un client Stripe connu", async () => {
    expect(await createPortal(USER, setup().deps)).toEqual({ ok: false, error: "aucun-abonnement" });
    const { deps } = setup({ record: { customerId: "cus_1", subscriptionId: "sub_1", status: "active", startedAt: NOW } });
    expect(await createPortal(USER, deps)).toEqual({ ok: true, value: { url: "https://billing.stripe.com/p/session/1" } });
  });

  it("résiliation : fin à l’échéance déjà payée", async () => {
    const { deps, stripe } = setup({ record: { customerId: "cus_1", subscriptionId: "sub_1", status: "active", startedAt: NOW } });
    expect(await cancelSubscription(USER, deps)).toEqual({ ok: true, value: { endsAt: new Date(PERIOD_END * 1000) } });
    expect(stripe.subscriptions.update).toHaveBeenCalledWith("sub_1", { cancel_at_period_end: true });
    expect(await cancelSubscription(USER, setup().deps)).toEqual({ ok: false, error: "aucun-abonnement" });
  });

  it("une erreur Stripe est signalée sans être présentée comme un succès", async () => {
    const { deps, stripe } = setup({ record: { customerId: "cus_1", subscriptionId: "sub_1", status: "active", startedAt: NOW } });
    stripe.subscriptions.update.mockRejectedValueOnce(new Error("panne"));
    expect(await cancelSubscription(USER, deps)).toEqual({ ok: false, error: "stripe-indisponible" });
  });
});

describe("rétractation", () => {
  it("14 jours à compter du lendemain, prolongés après un week-end, plus 2 jours de marge", () => {
    // Souscription le samedi 24/10/2026 : dernier jour légal le samedi 07/11, reporté au lundi 09/11.
    const deadline = withdrawalDeadline(new Date(2026, 9, 24, 15));
    expect(deadline).toEqual(new Date(2026, 10, 12));
    expect(withdrawalOpen(new Date(2026, 9, 24, 15), new Date(2026, 10, 11, 23))).toBe(true);
    expect(withdrawalOpen(new Date(2026, 9, 24, 15), new Date(2026, 10, 12, 0, 1))).toBe(false);
    expect(withdrawalOpen(null, NOW)).toBe(false);
  });

  it("arrête l’abonnement et rembourse intégralement le dernier paiement", async () => {
    const { deps, stripe } = setup({ record: { customerId: "cus_1", subscriptionId: "sub_1", status: "active", startedAt: NOW } });
    expect(await withdraw(USER, deps)).toEqual({ ok: true, value: { refundedCents: 499, refundFailed: false } });
    expect(stripe.subscriptions.cancel).toHaveBeenCalledWith("sub_1");
    expect(stripe.refunds.create).toHaveBeenCalledWith({ payment_intent: "pi_1", reason: "requested_by_customer" });
  });

  it("refuse après le délai, et signale honnêtement un remboursement échoué", async () => {
    const late = setup({
      record: { customerId: "cus_1", subscriptionId: "sub_1", status: "active", startedAt: new Date("2026-09-01T10:00:00Z") },
    });
    expect(await withdraw(USER, late.deps)).toEqual({ ok: false, error: "delai-de-retractation-depasse" });

    const failing = setup({ record: { customerId: "cus_1", subscriptionId: "sub_1", status: "active", startedAt: NOW } });
    failing.stripe.refunds.create.mockRejectedValueOnce(new Error("refus"));
    expect(await withdraw(USER, failing.deps)).toEqual({ ok: true, value: { refundedCents: 0, refundFailed: true } });
  });
});
