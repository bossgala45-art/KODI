// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const getUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  getServerSupabase: async () => ({ auth: { getUser } }),
}));

const CONFIGURED = {
  STRIPE_SECRET_KEY: "sk_test_routes",
  STRIPE_WEBHOOK_SECRET: "whsec_routes",
  STRIPE_PRICE_ID: "price_routes",
  KODI_SITE_URL: "https://kodi.example",
  SUPABASE_SECRET_KEY: "sb_secret_routes",
  NEXT_PUBLIC_SUPABASE_URL: "https://projet.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_routes",
};

async function routes(env: Record<string, string> = {}) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return {
    session: (await import("@/app/api/paiement/session/route")).POST,
    portail: (await import("@/app/api/paiement/portail/route")).POST,
    resiliation: (await import("@/app/api/paiement/resiliation/route")).POST,
    retractation: (await import("@/app/api/paiement/retractation/route")).POST,
    webhook: (await import("@/app/api/stripe/webhook/route")).POST,
  };
}

const post = (body: unknown = {}, headers: Record<string, string> = {}) =>
  new Request("https://kodi.example/api/paiement/x", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "content-type": "application/json", origin: "https://kodi.example", ...headers },
  });

beforeEach(() => {
  vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  getUser.mockResolvedValue({ data: { user: { id: "6f1c2a7e-1111-4222-8333-944445555666", email: "a@b.fr" } } });
});
afterEach(() => vi.unstubAllEnvs());

describe("routes de paiement sans Stripe configuré", () => {
  it("toutes répondent 503 « paiement non configuré », sans rien simuler", async () => {
    const r = await routes();
    for (const handler of [r.session, r.portail, r.resiliation, r.retractation, r.webhook]) {
      const response = await handler(post({ cgv: true, accesImmediat: true }));
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: "paiement-non-configure" });
    }
  });

  it("une clé de production est refusée sans autorisation explicite", async () => {
    const r = await routes({ ...CONFIGURED, STRIPE_SECRET_KEY: "sk_live_routes" });
    expect((await r.session(post({ cgv: true, accesImmediat: true }))).status).toBe(503);
  });
});

describe("routes de paiement configurées (mode test)", () => {
  it("exigent une personne connectée", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const r = await routes(CONFIGURED);
    for (const handler of [r.session, r.portail, r.resiliation, r.retractation]) {
      expect((await handler(post({ cgv: true, accesImmediat: true }))).status).toBe(401);
    }
  });

  it("refusent une requête venant d’un autre site", async () => {
    const r = await routes(CONFIGURED);
    const response = await r.resiliation(post({}, { origin: "https://pirate.example" }));
    expect(response.status).toBe(403);
    expect(getUser).not.toHaveBeenCalled();
  });

  it("le paiement exige l’acceptation des CGV et la demande d’accès immédiat", async () => {
    const r = await routes(CONFIGURED);
    for (const body of [{}, { cgv: true }, { cgv: true, accesImmediat: false }, "pas du json"]) {
      const response = await r.session(post(body));
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "consentement-requis" });
    }
  });

  it("le webhook refuse un événement non signé ou mal signé", async () => {
    const r = await routes(CONFIGURED);
    const body = JSON.stringify({ id: "evt_1", type: "customer.subscription.updated", data: { object: {} } });
    expect((await r.webhook(post(body))).status).toBe(400);
    expect((await r.webhook(post(body, { "stripe-signature": "t=1,v1=abc" }))).status).toBe(400);
  });
});
