import { z } from "zod";
import { billingError, guardAccountRoute, json } from "@/lib/billing/http";
import { createCheckout } from "@/lib/billing/service";

const bodySchema = z.object({ cgv: z.literal(true), accesImmediat: z.literal(true) }).strict();

/** Création d'une session Stripe Checkout (abonnement mensuel). */
export async function POST(request: Request) {
  const guard = await guardAccountRoute(request);
  if (!guard.ok) return guard.response;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return billingError("consentement-requis");
  const result = await createCheckout(guard.user, { cgv: true, immediateAccess: true }, guard.deps);
  return result.ok ? json(200, result.value) : billingError(result.error);
}
