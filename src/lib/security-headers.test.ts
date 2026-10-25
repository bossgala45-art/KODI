import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, securityHeaders } from "@/lib/security-headers";

describe("en-têtes de sécurité", () => {
  it("interdit l’intégration dans un cadre, les objets et les sources externes", () => {
    const csp = contentSecurityPolicy(undefined, false);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).not.toContain("unsafe-eval");
  });

  it("autorise seulement le projet Supabase configuré (HTTPS et temps réel)", () => {
    expect(contentSecurityPolicy("https://abc.supabase.co", false)).toContain(
      "connect-src 'self' https://abc.supabase.co wss://abc.supabase.co",
    );
    expect(contentSecurityPolicy("pas une url", false)).toContain("connect-src 'self';");
  });

  it("ajoute les en-têtes de protection usuels", () => {
    const keys = securityHeaders(undefined, false).map((h) => h.key);
    expect(keys).toEqual([
      "Content-Security-Policy",
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "Strict-Transport-Security",
    ]);
  });
});
