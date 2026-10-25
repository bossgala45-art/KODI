import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";
import { PERMISSION_DENIED, TestDb, expectRejected } from "./helpers/session";

let db: TestDb;
beforeAll(() => {
  db = new TestDb(inject("databaseUrl"));
});
afterAll(() => db.close());

const service = <T extends object>(sql: string, params: unknown[] = []) => db.asService((q) => q<T>(sql, params));
const one = async (sql: string, params: unknown[] = []) => Object.values((await service<Record<string, unknown>>(sql, params))[0]!)[0];

describe("quotas partagés du professeur IA", () => {
  it("limite la fréquence par client, sur une minute", async () => {
    const client = "client-frequence-1";
    expect(await one("select public.tutor_hit($1, 2)", [client])).toBe(true);
    expect(await one("select public.tutor_hit($1, 2)", [client])).toBe(true);
    expect(await one("select public.tutor_hit($1, 2)", [client])).toBe(false);
    expect(await one("select public.tutor_hit($1, 2)", ["client-frequence-2"])).toBe(true);
    await db.admin("update private.tutor_rate set window_start = now() - interval '61 seconds' where client = $1", [client]);
    expect(await one("select public.tutor_hit($1, 2)", [client])).toBe(true);
  });

  it("applique le quota quotidien de réponses IA", async () => {
    const client = "client-quota-1";
    expect(await one("select public.tutor_ai_used($1)", [client])).toBe(0);
    expect(await one("select public.tutor_take_ai($1, 2)", [client])).toBe(true);
    expect(await one("select public.tutor_take_ai($1, 2)", [client])).toBe(true);
    expect(await one("select public.tutor_take_ai($1, 2)", [client])).toBe(false);
    expect(await one("select public.tutor_ai_used($1)", [client])).toBe(2);
  });

  it("réserve le budget du jour sur le pire cas puis l’ajuste au coût réel", async () => {
    await db.admin("delete from private.tutor_budget");
    expect(await one("select public.tutor_reserve(0.03, 0.05)")).toBe(true);
    // Une seconde réservation dépasserait le budget, même en parallèle d'un appel en cours.
    expect(await one("select public.tutor_reserve(0.03, 0.05)")).toBe(false);
    await service("select public.tutor_settle((now() at time zone 'UTC')::date, 0.03, 0.006)");
    const [row] = await db.admin<{ committed: string }>("select committed from private.tutor_budget");
    expect(Number(row!.committed)).toBeCloseTo(0.006);
    expect(await one("select public.tutor_reserve(0.03, 0.05)")).toBe(true);
    expect(await one("select public.tutor_reserve(0, 0.05)")).toBe(false);
  });

  it("aucun client ni visiteur ne peut appeler ces fonctions", async () => {
    const user = await db.createUser("quota-triche");
    await expectRejected(db.asUser(user, (q) => q("select public.tutor_reserve(1, 100)")), PERMISSION_DENIED);
    await expectRejected(db.asAnon((q) => q("select public.tutor_hit('client-xxxxxxx', 99)")), PERMISSION_DENIED);
  });
});
