import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const verifyOtp = vi.hoisted(() => vi.fn());
const exchangeCodeForSession = vi.hoisted(() => vi.fn());
const configured = vi.hoisted(() => ({ value: true }));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabase: async () => (configured.value ? { auth: { verifyOtp, exchangeCodeForSession } } : null),
}));

const { GET } = await import("@/app/auth/confirm/route");

const call = (query: string) => GET(new NextRequest(`https://kodi.example/auth/confirm?${query}`));

describe("/auth/confirm", () => {
  it("vérifie le jeton et redirige vers la page demandée (chemin relatif)", async () => {
    verifyOtp.mockResolvedValueOnce({ error: null });
    const response = await call("token_hash=abc&type=recovery&next=/reinitialiser-mot-de-passe");
    expect(verifyOtp).toHaveBeenCalledWith({ token_hash: "abc", type: "recovery" });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/reinitialiser-mot-de-passe");
  });

  it("ignore une destination externe (pas de redirection ouverte)", async () => {
    verifyOtp.mockResolvedValueOnce({ error: null });
    const response = await call("token_hash=abc&type=email&next=https://pirate.example");
    expect(response.headers.get("location")).toBe("/profil");
  });

  it("accepte aussi le code du flux PKCE", async () => {
    exchangeCodeForSession.mockResolvedValueOnce({ error: null });
    const response = await call("code=xyz");
    expect(exchangeCodeForSession).toHaveBeenCalledWith("xyz");
    expect(response.headers.get("location")).toBe("/profil");
  });

  it.each([
    ["jeton refusé", "token_hash=abc&type=email", () => verifyOtp.mockResolvedValueOnce({ error: { code: "otp_expired" } })],
    ["type inconnu", "token_hash=abc&type=magiclink", () => {}],
    ["aucun paramètre", "", () => {}],
    ["coupure réseau", "token_hash=abc&type=email", () => verifyOtp.mockRejectedValueOnce(new TypeError("fetch failed"))],
  ])("explique un lien invalide (%s)", async (_label, query, arrange) => {
    arrange();
    const response = await call(query);
    expect(response.headers.get("location")).toBe("/auth/lien-invalide");
  });

  it("en mode local, renvoie vers l’explication", async () => {
    configured.value = false;
    const response = await call("token_hash=abc&type=email");
    expect(response.headers.get("location")).toBe("/auth/lien-invalide");
    configured.value = true;
  });
});
