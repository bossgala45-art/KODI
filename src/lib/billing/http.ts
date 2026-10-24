import "server-only";
import { billingDeps } from "@/lib/billing/server";
import type { BillingDeps, BillingError, BillingUser } from "@/lib/billing/service";
import { getServerSupabase } from "@/lib/supabase/server";

const NO_STORE = { "Cache-Control": "no-store" };

export function json(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: NO_STORE });
}

const ERROR_STATUS: Record<BillingError, number> = {
  "deja-abonne": 409,
  "aucun-abonnement": 404,
  "consentement-requis": 400,
  "delai-de-retractation-depasse": 409,
  "stripe-indisponible": 502,
};

export function billingError(error: BillingError): Response {
  return json(ERROR_STATUS[error], { error });
}

export type Guarded = { ok: true; deps: BillingDeps; user: BillingUser } | { ok: false; response: Response };

/**
 * Préalable des routes de paiement d'un compte : paiements configurés,
 * requête venant du site lui-même, personne connectée (session Supabase).
 */
export async function guardAccountRoute(request: Request): Promise<Guarded> {
  const deps = billingDeps();
  if (!deps) return { ok: false, response: json(503, { error: "paiement-non-configure" }) };
  const origin = request.headers.get("origin");
  if (origin && origin !== deps.siteUrl) return { ok: false, response: json(403, { error: "origine-refusee" }) };
  const supabase = await getServerSupabase();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!data.user) return { ok: false, response: json(401, { error: "connexion-requise" }) };
  return { ok: true, deps, user: { id: data.user.id, email: data.user.email ?? null } };
}
