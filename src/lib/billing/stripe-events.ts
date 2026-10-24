/**
 * Traitement des événements Stripe (logique pure, sans réseau).
 *
 * Règles (documentation Stripe « Webhooks » et « Subscription webhooks ») :
 *  - la signature est vérifiée AVANT d'appeler ce module ;
 *  - l'ordre de livraison n'est pas garanti : pour tout événement lié à un
 *    abonnement, on relit l'abonnement à jour chez Stripe et on enregistre
 *    cet état, jamais le contenu de l'événement ;
 *  - un même événement peut arriver plusieurs fois : son identifiant est
 *    enregistré par la base, qui ne l'applique qu'une fois ;
 *  - un événement d'un autre environnement (test / production) ou pour un
 *    autre prix est ignoré.
 */
import type Stripe from "stripe";

export const HANDLED_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "invoice.paid",
  "invoice.payment_failed",
] as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const USER_METADATA_KEY = "kodi_user_id";

/** Abonnement tel qu'enregistré par public.billing_apply_subscription. */
export interface SubscriptionRow {
  eventId: string;
  eventType: string;
  userId: string | null;
  customerId: string;
  subscriptionId: string;
  priceId: string | null;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  startedAt: Date;
  livemode: boolean;
}

export type ApplyOutcome = "applique" | "ignore" | "deja-traite";

export interface EventDeps {
  mode: "test" | "live";
  priceId: string;
  retrieveSubscription(id: string): Promise<Stripe.Subscription>;
  apply(row: SubscriptionRow): Promise<ApplyOutcome>;
}

export type EventOutcome = ApplyOutcome | "non-concerne" | "autre-environnement";

const idOf = (value: string | { id: string } | null | undefined): string | null =>
  typeof value === "string" ? value : (value?.id ?? null);

/** Abonnement concerné par l'événement, ou null s'il n'y en a pas. */
export function subscriptionIdOf(event: Stripe.Event): string | null {
  switch (event.type) {
    case "checkout.session.completed":
      return event.data.object.mode === "subscription" ? idOf(event.data.object.subscription) : null;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      return event.data.object.id;
    case "invoice.paid":
    case "invoice.payment_failed":
      return idOf(event.data.object.parent?.subscription_details?.subscription);
    default:
      return null;
  }
}

/** Compte KODI rattaché : métadonnée posée à la création du paiement. */
export function userIdOf(subscription: Stripe.Subscription, event: Stripe.Event): string | null {
  const fromMetadata = subscription.metadata?.[USER_METADATA_KEY];
  if (fromMetadata && UUID.test(fromMetadata)) return fromMetadata.toLowerCase();
  if (event.type === "checkout.session.completed") {
    const reference = event.data.object.client_reference_id;
    if (reference && UUID.test(reference)) return reference.toLowerCase();
  }
  return null;
}

export function rowOf(subscription: Stripe.Subscription, event: Stripe.Event): SubscriptionRow {
  const items = subscription.items?.data ?? [];
  const periodEnds = items.map((item) => item.current_period_end).filter((n): n is number => typeof n === "number");
  return {
    eventId: event.id,
    eventType: event.type,
    userId: userIdOf(subscription, event),
    customerId: idOf(subscription.customer) ?? "",
    subscriptionId: subscription.id,
    priceId: items[0]?.price?.id ?? null,
    status: subscription.status,
    currentPeriodEnd: periodEnds.length > 0 ? new Date(Math.max(...periodEnds) * 1000) : null,
    // Mode de facturation « flexible » : la fin programmée est dans cancel_at.
    cancelAtPeriodEnd: subscription.cancel_at_period_end || subscription.cancel_at !== null,
    startedAt: new Date(subscription.start_date * 1000),
    livemode: subscription.livemode,
  };
}

export async function handleStripeEvent(event: Stripe.Event, deps: EventDeps): Promise<EventOutcome> {
  if (event.livemode !== (deps.mode === "live")) return "autre-environnement";
  const subscriptionId = subscriptionIdOf(event);
  if (!subscriptionId) return "non-concerne";

  const subscription = await deps.retrieveSubscription(subscriptionId);
  const row = rowOf(subscription, event);
  // Autre produit vendu sur le même compte Stripe : enregistré, sans effet.
  if (row.priceId !== deps.priceId) return deps.apply({ ...row, userId: null });
  return deps.apply(row);
}
