import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

const files = sourceFiles(join(process.cwd(), "src"));

describe("secrets", () => {
  const reads = (file: string) => [...readFileSync(file, "utf8").matchAll(/process\.env\.([A-Z0-9_]+)/g)].map((m) => m[1]!);
  const TUTOR_SERVER = join(process.cwd(), "src/lib/tutor/server.ts");
  const BILLING_SERVER = join(process.cwd(), "src/lib/billing/server.ts");
  const BILLING_CONFIG = join(process.cwd(), "src/lib/billing/config.ts");
  const SERVER_ONLY_READERS = [TUTOR_SERVER, BILLING_SERVER];

  it("hors des modules serveur, l’application ne lit que les variables Supabase publiques", () => {
    const used = new Set(files.filter((file) => !SERVER_ONLY_READERS.includes(file)).flatMap(reads));
    // NODE_ENV : mode de compilation (développement / production), sans secret.
    expect([...used].sort()).toEqual(["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_URL", "NODE_ENV"]);
  });

  it("les clés de paiement (Stripe, clé serveur Supabase) ne sont lues que par un module réservé au serveur", () => {
    const content = readFileSync(BILLING_SERVER, "utf8");
    expect(content.startsWith('import "server-only";')).toBe(true);
    expect(reads(BILLING_SERVER).sort()).toEqual([
      "KODI_BILLING_ALLOW_LIVE",
      "KODI_SITE_URL",
      "STRIPE_PRICE_ID",
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "SUPABASE_SECRET_KEY",
    ]);
    for (const file of ["src/lib/billing/http.ts"]) {
      expect(readFileSync(join(process.cwd(), file), "utf8").startsWith('import "server-only";'), file).toBe(true);
    }
  });

  it("les variables du professeur (dont la clé d’IA) ne sont lues que par un module réservé au serveur", () => {
    const content = readFileSync(TUTOR_SERVER, "utf8");
    expect(content.startsWith('import "server-only";')).toBe(true);
    const used = reads(TUTOR_SERVER);
    expect(used).toContain("ANTHROPIC_API_KEY");
    expect(readFileSync(join(process.cwd(), "src/lib/tutor/shared-limits.ts"), "utf8").startsWith('import "server-only";')).toBe(true);
    // Aucune n'est publique : Next.js n'envoie au navigateur que les variables NEXT_PUBLIC_.
    expect(used.every((name) => !name.startsWith("NEXT_PUBLIC_"))).toBe(true);
    expect(readFileSync(join(process.cwd(), "src/lib/tutor/anthropic.ts"), "utf8").startsWith('import "server-only";')).toBe(true);
  });

  it("aucun composant client n’importe le serveur du professeur ou le SDK d’IA", () => {
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      if (!content.startsWith('"use client"')) continue;
      expect(content, file).not.toMatch(/@\/lib\/tutor\/(server|anthropic|config)|@anthropic-ai\/sdk/);
      expect(content, file).not.toMatch(/@\/lib\/billing\/(server|http|config|service|stripe-events)|from "stripe"/);
    }
  });

  it("aucune clé secrète ni service_role n’apparaît dans le code", () => {
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      expect(content, file).not.toMatch(/sb_secret_[A-Za-z0-9]/);
      expect(content, file).not.toMatch(/sk-ant-[A-Za-z0-9]/);
      // Seuls les modules serveur des paiements nomment la clé serveur Supabase.
      if (![BILLING_SERVER, BILLING_CONFIG, TUTOR_SERVER].includes(file)) {
        expect(content, file).not.toMatch(/SERVICE_ROLE|SUPABASE_SECRET/);
      }
      expect(content, file).not.toMatch(/sk_live_[A-Za-z0-9]{8}|whsec_[A-Za-z0-9]{16}/);
    }
  });

  it("le client serveur Supabase est réservé au serveur", () => {
    const server = readFileSync(join(process.cwd(), "src/lib/supabase/server.ts"), "utf8");
    expect(server.startsWith('import "server-only";')).toBe(true);
  });
});
