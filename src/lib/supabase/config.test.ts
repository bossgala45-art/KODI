import { describe, expect, it } from "vitest";
import { isSecretKey, parseSupabaseConfig } from "@/lib/supabase/config";

const jwt = (role: string) =>
  `xxx.${btoa(JSON.stringify({ role })).replace(/=+$/, "")}.yyy`;

describe("configuration Supabase", () => {
  it("passe en mode local si une variable manque", () => {
    expect(parseSupabaseConfig(undefined, "cle")).toEqual({ ok: false, problem: "missing" });
    expect(parseSupabaseConfig("https://abc.supabase.co", "  ")).toEqual({ ok: false, problem: "missing" });
  });

  it("refuse toute clé secrète placée dans la variable publique", () => {
    expect(isSecretKey("sb_secret_abc123")).toBe(true);
    expect(isSecretKey(jwt("service_role"))).toBe(true);
    expect(isSecretKey(jwt("anon"))).toBe(false);
    expect(isSecretKey("sb_publishable_abc123")).toBe(false);
    expect(parseSupabaseConfig("https://abc.supabase.co", "sb_secret_abc")).toEqual({
      ok: false,
      problem: "secret-key",
    });
  });

  it("exige HTTPS, sauf en local", () => {
    expect(parseSupabaseConfig("http://abc.supabase.co", "sb_publishable_x")).toEqual({
      ok: false,
      problem: "invalid-url",
    });
    expect(parseSupabaseConfig("pas une url", "sb_publishable_x").ok).toBe(false);
    expect(parseSupabaseConfig("http://127.0.0.1:54321", "sb_publishable_x").ok).toBe(true);
  });

  it("accepte une clé publique et normalise l’URL", () => {
    expect(parseSupabaseConfig("https://abc.supabase.co/", "sb_publishable_x")).toEqual({
      ok: true,
      config: { url: "https://abc.supabase.co", publishableKey: "sb_publishable_x" },
    });
  });
});
