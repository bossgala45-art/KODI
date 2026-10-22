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
  it("l’application ne lit que les variables Supabase publiques", () => {
    const used = new Set<string>();
    for (const file of files) {
      for (const match of readFileSync(file, "utf8").matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
        used.add(match[1]!);
      }
    }
    expect([...used].sort()).toEqual(["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_URL"]);
  });

  it("aucune clé secrète ni service_role n’apparaît dans le code", () => {
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      expect(content, file).not.toMatch(/sb_secret_[A-Za-z0-9]/);
      expect(content, file).not.toMatch(/SERVICE_ROLE|SUPABASE_SECRET/);
    }
  });

  it("le client serveur Supabase est réservé au serveur", () => {
    const server = readFileSync(join(process.cwd(), "src/lib/supabase/server.ts"), "utf8");
    expect(server.startsWith('import "server-only";')).toBe(true);
  });
});
