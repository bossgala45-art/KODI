// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

describe("proxy de session", () => {
  it("laisse passer sans traitement en mode local (Supabase non configuré)", async () => {
    vi.resetModules();
    const { proxy } = await import("@/proxy");
    const response = await proxy(new NextRequest("http://localhost/apprendre"));
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("n’intercepte ni les fichiers statiques, ni le service worker, ni le webhook Stripe", async () => {
    const { config } = await import("@/proxy");
    const pattern = new RegExp(`^${config.matcher[0]!}$`);
    for (const path of ["/_next/static/x.js", "/sw.js", "/icons/icon-192.png", "/api/stripe/webhook", "/manifest.webmanifest"]) {
      expect(pattern.test(path), path).toBe(false);
    }
    for (const path of ["/", "/apprendre", "/api/professeur", "/abonnement"]) {
      expect(pattern.test(path), path).toBe(true);
    }
  });
});
