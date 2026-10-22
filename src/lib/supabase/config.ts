/**
 * Configuration Supabase lue depuis les variables d'environnement PUBLIQUES.
 *
 * Seules l'URL du projet et la clé « publishable » (ou l'ancienne clé
 * « anon ») sont utilisées par l'application : elles sont publiques par
 * conception, la sécurité reposant sur RLS. Aucune clé secrète n'est lue ici.
 * Si une clé secrète est placée par erreur dans la variable publique, elle
 * est refusée : l'application reste en mode local plutôt que de l'exposer.
 */

export interface SupabaseConfig {
  url: string;
  publishableKey: string;
}

export type ConfigProblem = "missing" | "invalid-url" | "secret-key";

export type ConfigResult =
  | { ok: true; config: SupabaseConfig }
  | { ok: false; problem: ConfigProblem };

function decodeJwtRole(key: string): string | null {
  const payload = key.split(".")[1];
  if (!payload) return null;
  try {
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { role?: unknown };
    return typeof json.role === "string" ? json.role : null;
  } catch {
    return null;
  }
}

export function isSecretKey(key: string): boolean {
  return key.startsWith("sb_secret_") || decodeJwtRole(key) === "service_role";
}

export function parseSupabaseConfig(
  url: string | undefined,
  key: string | undefined,
): ConfigResult {
  const cleanUrl = url?.trim() ?? "";
  const cleanKey = key?.trim() ?? "";
  if (!cleanUrl || !cleanKey) return { ok: false, problem: "missing" };
  if (isSecretKey(cleanKey)) return { ok: false, problem: "secret-key" };
  try {
    const parsed = new URL(cleanUrl);
    const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (parsed.protocol !== "https:" && !(local && parsed.protocol === "http:")) {
      return { ok: false, problem: "invalid-url" };
    }
  } catch {
    return { ok: false, problem: "invalid-url" };
  }
  return { ok: true, config: { url: cleanUrl.replace(/\/+$/, ""), publishableKey: cleanKey } };
}

// Les accès doivent rester littéraux : Next.js les remplace à la compilation.
export const supabaseConfig: ConfigResult = parseSupabaseConfig(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

export function isSupabaseConfigured(): boolean {
  return supabaseConfig.ok;
}
