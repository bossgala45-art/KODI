import { billingDeps } from "@/lib/billing/server";
import { handleWebhook } from "@/lib/billing/service";

/**
 * Webhook Stripe. Le corps est lu BRUT (la signature porte sur lui), puis
 * vérifié avec le secret du point de terminaison avant tout traitement.
 */
export async function POST(request: Request) {
  const deps = billingDeps();
  if (!deps) return Response.json({ error: "paiement-non-configure" }, { status: 503 });
  const result = await handleWebhook(await request.text(), request.headers.get("stripe-signature"), deps);
  // Journal minimal : type de résultat seulement, jamais le contenu.
  process.stdout.write(`${JSON.stringify({ event: "stripe-webhook", status: result.status, outcome: result.outcome })}\n`);
  return Response.json({ received: result.status === 200, outcome: result.outcome }, { status: result.status });
}
