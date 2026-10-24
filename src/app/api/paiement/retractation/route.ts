import { billingError, guardAccountRoute, json } from "@/lib/billing/http";
import { withdraw } from "@/lib/billing/service";

/** « Confirmer la rétractation » : arrêt immédiat et remboursement. */
export async function POST(request: Request) {
  const guard = await guardAccountRoute(request);
  if (!guard.ok) return guard.response;
  const result = await withdraw(guard.user.id, guard.deps);
  if (!result.ok) return billingError(result.error);
  return json(200, { ...result.value, requestedAt: new Date().toISOString() });
}
