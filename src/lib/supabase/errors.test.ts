import { describe, expect, it, vi } from "vitest";
import { isNetworkError, toUserFacingError, unwrapRow, withNetworkRetry } from "@/lib/supabase/errors";

describe("erreurs Supabase", () => {
  it("reconnaît les coupures réseau", () => {
    expect(isNetworkError(new TypeError("Failed to fetch"))).toBe(true);
    expect(isNetworkError({ name: "AuthRetryableFetchError", message: "x" })).toBe(true);
    expect(isNetworkError({ message: "Load failed" })).toBe(true);
    expect(isNetworkError({ status: 503, message: "x" })).toBe(true);
    expect(isNetworkError({ code: "invalid_credentials", status: 400, message: "x" })).toBe(false);
  });

  it("traduit les erreurs d’authentification sans détail technique", () => {
    const error = toUserFacingError({ code: "invalid_credentials", status: 400, message: "Invalid login credentials" });
    expect(error).toMatchObject({ kind: "auth", retryable: false, code: "invalid_credentials" });
    expect(error.message).toBe("Adresse e-mail ou mot de passe incorrect.");
  });

  it("signale les limites de fréquence", () => {
    expect(toUserFacingError({ code: "over_email_send_rate_limit", message: "x" }).kind).toBe("rate-limit");
    expect(toUserFacingError({ status: 429, message: "x" }).kind).toBe("rate-limit");
  });

  it("traduit les erreurs métier de la base", () => {
    expect(toUserFacingError({ message: "KODI_EXAM_NOT_SUBMITTED", code: "P0001" }).message).toMatch(/après la remise/);
  });

  it("ne divulgue jamais un message technique inconnu", () => {
    const error = toUserFacingError({ message: 'relation "secret_table" does not exist', code: "42P01" });
    expect(error.kind).toBe("unknown");
    expect(error.message).not.toMatch(/secret_table/);
  });

  it("signale l’absence de réseau", () => {
    const spy = vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    expect(toUserFacingError(new Error("x")).message).toMatch(/hors ligne/);
    spy.mockRestore();
  });

  it("réessaie uniquement les erreurs réseau", async () => {
    const flaky = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce("ok");
    await expect(withNetworkRetry(flaky, { baseDelayMs: 1 })).resolves.toBe("ok");
    expect(flaky).toHaveBeenCalledTimes(2);

    const denied = vi.fn<() => Promise<string>>().mockRejectedValue({ code: "42501", message: "denied" });
    await expect(withNetworkRetry(denied, { baseDelayMs: 1 })).rejects.toMatchObject({ code: "42501" });
    expect(denied).toHaveBeenCalledTimes(1);
  });

  it("considère une ligne absente comme une erreur", () => {
    expect(() => unwrapRow({ data: null, error: null })).toThrow("KODI_ROW_NOT_FOUND");
    expect(unwrapRow({ data: { a: 1 }, error: null })).toEqual({ a: 1 });
  });
});
