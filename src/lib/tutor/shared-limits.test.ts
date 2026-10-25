// @vitest-environment node
import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { sharedBudget, sharedLimiter } = await import("@/lib/tutor/shared-limits");

const NOW = new Date("2026-10-25T10:00:00Z");
const client = (rpc: (name: string, args: unknown) => { data: unknown; error: unknown }) =>
  ({ rpc: vi.fn(async (name: string, args: unknown) => rpc(name, args)) }) as unknown as SupabaseClient & { rpc: ReturnType<typeof vi.fn> };

describe("compteurs partagés (base de données)", () => {
  it("transmet les limites et lit les réponses de la base", async () => {
    const admin = client((name) => ({ data: name === "tutor_ai_used" ? 1 : true, error: null }));
    const limiter = sharedLimiter(admin, { perMinute: 5, aiPerDay: 20 });
    expect(await limiter.hit("empreinte", NOW)).toBe(true);
    expect(await limiter.aiUsed("empreinte", NOW)).toBe(1);
    expect(admin.rpc).toHaveBeenCalledWith("tutor_hit", { p_client: "empreinte", p_per_minute: 5 });
    const budget = sharedBudget(admin, 0.5);
    const reservation = await budget.reserve(0.03, NOW);
    expect(reservation).toEqual({ id: 0, amount: 0.03, day: "2026-10-25" });
    await budget.settle(reservation!, 0.01, NOW);
    expect(admin.rpc).toHaveBeenCalledWith("tutor_settle", { p_day: "2026-10-25", p_reserved: 0.03, p_actual: 0.01 });
  });

  it("base indisponible : aucune dépense engagée, explications prédéfinies toujours accessibles", async () => {
    const admin = client(() => ({ data: null, error: { message: "panne" } }));
    const limiter = sharedLimiter(admin, { perMinute: 5, aiPerDay: 20 });
    expect(await limiter.hit("empreinte", NOW)).toBe(true);
    expect(await limiter.aiUsed("empreinte", NOW)).toBe(20);
    expect(await limiter.takeAi("empreinte", NOW)).toBe(false);
    expect(await sharedBudget(admin, 0.5).reserve(0.03, NOW)).toBeNull();
  });
});
