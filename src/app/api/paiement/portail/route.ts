import { billingError, guardAccountRoute, json } from "@/lib/billing/http";
import { createPortal } from "@/lib/billing/service";

/** Portail client Stripe : moyen de paiement et factures. */
export async function POST(request: Request) {
  const guard = await guardAccountRoute(request);
  if (!guard.ok) return guard.response;
  const result = await createPortal(guard.user.id, guard.deps);
  return result.ok ? json(200, result.value) : billingError(result.error);
}
