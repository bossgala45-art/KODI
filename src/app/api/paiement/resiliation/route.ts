import { billingError, guardAccountRoute, json } from "@/lib/billing/http";
import { cancelSubscription } from "@/lib/billing/service";

/** « Notifier la résiliation » : fin de l'abonnement à l'échéance déjà payée. */
export async function POST(request: Request) {
  const guard = await guardAccountRoute(request);
  if (!guard.ok) return guard.response;
  const result = await cancelSubscription(guard.user.id, guard.deps);
  if (!result.ok) return billingError(result.error);
  return json(200, { endsAt: result.value.endsAt?.toISOString() ?? null, notifiedAt: new Date().toISOString() });
}
