import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";
import { PERMISSION_DENIED, TestDb, expectRejected } from "./helpers/session";

let db: TestDb;
beforeAll(() => {
  db = new TestDb(inject("databaseUrl"));
});
afterAll(() => db.close());

const save = (user: string, answers: unknown[], version: number, lessons: object = {}, sessions: unknown[] = []) =>
  db.asUser(user, async (q) =>
    (await q<{ v: number }>("select public.save_learning_state($1, $2, $3, $4) as v", [
      JSON.stringify(answers),
      JSON.stringify(lessons),
      JSON.stringify(sessions),
      version,
    ]))[0]!.v,
  );

describe("progression synchronisée", () => {
  it("chacun enregistre et lit la sienne uniquement, avec contrôle de version", async () => {
    const alice = await db.createUser("progression-alice");
    const bob = await db.createUser("progression-bob");
    expect(await save(alice, [{ id: "r1" }], 0, { "l-1": "2026-10-24T10:00:00Z" })).toBe(1);
    expect(await save(alice, [{ id: "r1" }, { id: "r2" }], 1)).toBe(2);
    // Écriture fondée sur une version dépassée : refusée (un autre appareil a écrit).
    await expectRejected(save(alice, [], 1), /KODI_SYNC_CONFLICT/);
    const mine = await db.asUser(alice, (q) => q<{ version: number; answers: unknown[] }>("select version, answers from public.learning_states"));
    expect(mine).toEqual([{ version: 2, answers: [{ id: "r1" }, { id: "r2" }] }]);
    expect(await db.asUser(bob, (q) => q("select * from public.learning_states"))).toEqual([]);
    expect(await db.asAnon((q) => q("select * from public.learning_states").catch(() => "refusé"))).toBe("refusé");
  });

  it("aucune écriture directe ; tailles limitées", async () => {
    const user = await db.createUser("progression-triche");
    await expectRejected(
      db.asUser(user, (q) => q("insert into public.learning_states (user_id) values ($1)", [user])),
      PERMISSION_DENIED,
    );
    await expectRejected(save(user, Array.from({ length: 5001 }, (_, i) => ({ id: i })), 0), /KODI_INVALID_LEARNING_STATE/);
    await expectRejected(
      db.asUser(user, (q) => q("select public.save_learning_state('{}'::jsonb, '{}'::jsonb, '[]'::jsonb, 0)")),
      /KODI_INVALID_LEARNING_STATE/,
    );
  });
});

describe("export des données", () => {
  it("contient le compte, le profil, l’offre et la progression, sans données d’autrui ni identifiants Stripe", async () => {
    const user = await db.createUser("export");
    const other = await db.createUser("export-autre");
    await save(user, [{ id: "r1" }], 0);
    await save(other, [{ id: "secret" }], 0);
    const [row] = await db.asUser(user, (q) => q<{ e: Record<string, unknown> }>("select public.export_my_data() as e"));
    const data = row!.e;
    expect(data).toMatchObject({ format: "kodi-export-1", compte: { id: user }, profil: { daily_goal: 20 }, abonnement: { offre: "free" } });
    expect(data.progression).toMatchObject({ reponses: [{ id: "r1" }] });
    const text = JSON.stringify(data);
    expect(text).not.toContain("secret");
    expect(text).not.toMatch(/provider_customer_id|cus_|sub_/);
    await expectRejected(db.asAnon((q) => q("select public.export_my_data()")), PERMISSION_DENIED);
  });
});

describe("suppression du compte", () => {
  it("exige une confirmation explicite", async () => {
    const user = await db.createUser("suppression-confirmation");
    await expectRejected(db.asUser(user, (q) => q("select public.delete_my_account('oui')")), /KODI_CONFIRMATION_REQUIRED/);
    expect(await db.admin("select 1 from auth.users where id = $1", [user])).toHaveLength(1);
  });

  it("efface le compte et ses données, et anonymise son journal", async () => {
    const user = await db.createUser("suppression");
    await save(user, [{ id: "r1" }], 0);
    await db.asUser(user, (q) => q("select public.delete_my_account('SUPPRIMER')"));
    expect(await db.admin("select 1 from auth.users where id = $1", [user])).toHaveLength(0);
    expect(await db.admin("select 1 from public.learning_states where user_id = $1", [user])).toHaveLength(0);
    expect(await db.admin("select 1 from public.profiles where id = $1", [user])).toHaveLength(0);
    expect(await db.admin("select 1 from public.audit_events where actor_id = $1", [user])).toHaveLength(0);
  });

  it("refuse tant qu’un abonnement payant n’est pas résilié", async () => {
    const user = await db.createUser("suppression-abonne");
    await db.admin(
      "update public.subscriptions set plan = 'premium', status = 'active', provider = 'stripe', cancel_at_period_end = false where user_id = $1",
      [user],
    );
    await expectRejected(db.asUser(user, (q) => q("select public.delete_my_account('SUPPRIMER')")), /KODI_ACTIVE_SUBSCRIPTION/);
    await db.admin("update public.subscriptions set cancel_at_period_end = true where user_id = $1", [user]);
    await db.asUser(user, (q) => q("select public.delete_my_account('SUPPRIMER')"));
    expect(await db.admin("select 1 from auth.users where id = $1", [user])).toHaveLength(0);
  });

  it("personne ne peut supprimer le compte d’un autre", async () => {
    const alice = await db.createUser("suppression-alice");
    await expectRejected(db.asAnon((q) => q("select public.delete_my_account('SUPPRIMER')")), PERMISSION_DENIED);
    expect(await db.admin("select 1 from auth.users where id = $1", [alice])).toHaveLength(1);
  });
});
