import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";
import { PERMISSION_DENIED, TestDb, expectRejected } from "./helpers/session";

let db: TestDb;
let alice: string;
let bob: string;

beforeAll(async () => {
  db = new TestDb(inject("databaseUrl"));
  alice = await db.createUser("alice");
  bob = await db.createUser("bob");
});
afterAll(() => db.close());

describe("création de compte", () => {
  it("crée profil, préférences, abonnement gratuit et événement d’audit", async () => {
    const [row] = await db.admin<{ p: number; pr: number; plan: string; ev: number }>(
      `select
        (select count(*) from public.profiles where id = $1)::int as p,
        (select count(*) from public.preferences where user_id = $1)::int as pr,
        (select plan from public.subscriptions where user_id = $1) as plan,
        (select count(*) from public.audit_events where actor_id = $1 and event_type = 'account.created')::int as ev`,
      [alice],
    );
    expect(row).toEqual({ p: 1, pr: 1, plan: "free", ev: 1 });
  });
});

describe("profils", () => {
  it("chacun ne lit que son propre profil", async () => {
    const rows = await db.asUser(alice, (q) => q<{ id: string }>("select id from public.profiles"));
    expect(rows).toEqual([{ id: alice }]);
  });

  it("les visiteurs anonymes n’ont aucun accès", async () => {
    await expectRejected(db.asAnon((q) => q("select * from public.profiles")), PERMISSION_DENIED);
  });

  it("on modifie son profil, pas celui des autres", async () => {
    await db.asUser(alice, (q) =>
      q("update public.profiles set first_name = 'Alice', daily_goal = 40 where id = $1", [alice]),
    );
    const touched = await db.asUser(alice, (q) =>
      q("update public.profiles set first_name = 'Piratée' where id = $1 returning id", [bob]),
    );
    expect(touched).toEqual([]);
    const [bobRow] = await db.admin<{ first_name: string }>("select first_name from public.profiles where id = $1", [bob]);
    expect(bobRow?.first_name).toBe("");
  });

  it("refuse la modification des colonnes protégées", async () => {
    await expectRejected(
      db.asUser(alice, (q) => q("update public.profiles set id = $1 where id = $2", [bob, alice])),
      PERMISSION_DENIED,
    );
    await expectRejected(
      db.asUser(alice, (q) => q("update public.profiles set created_at = now() where id = $1", [alice])),
      PERMISSION_DENIED,
    );
  });

  it("refuse la création et la suppression directes", async () => {
    await expectRejected(
      db.asUser(alice, (q) => q("insert into public.profiles (id) values ($1)", [alice])),
      PERMISSION_DENIED,
    );
    await expectRejected(
      db.asUser(alice, (q) => q("delete from public.profiles where id = $1", [alice])),
      PERMISSION_DENIED,
    );
  });

  it("valide les données (objectif autorisé, longueur du prénom)", async () => {
    await expectRejected(
      db.asUser(alice, (q) => q("update public.profiles set daily_goal = 15 where id = $1", [alice])),
      /check constraint/,
    );
    await expectRejected(
      db.asUser(alice, (q) => q("update public.profiles set first_name = $1 where id = $2", ["x".repeat(31), alice])),
      /check constraint/,
    );
  });

  it("journalise les changements effectifs seulement", async () => {
    const count = async () =>
      Number(
        (await db.admin<{ n: string }>(
          "select count(*) as n from public.audit_events where actor_id = $1 and event_type = 'profile.updated'",
          [alice],
        ))[0]?.n,
      );
    const before = await count();
    await db.asUser(alice, (q) => q("update public.profiles set daily_goal = daily_goal where id = $1", [alice]));
    expect(await count()).toBe(before);
    await db.asUser(alice, (q) => q("update public.profiles set daily_goal = 10 where id = $1", [alice]));
    expect(await count()).toBe(before + 1);
  });
});

describe("préférences", () => {
  it("lecture et modification des siennes uniquement", async () => {
    await db.asUser(alice, (q) => q("update public.preferences set theme = 'dark' where user_id = $1", [alice]));
    const others = await db.asUser(alice, (q) =>
      q("update public.preferences set theme = 'dark' where user_id = $1 returning user_id", [bob]),
    );
    expect(others).toEqual([]);
    const seen = await db.asUser(bob, (q) => q<{ theme: string }>("select theme from public.preferences"));
    expect(seen).toEqual([{ theme: "system" }]);
  });

  it("refuse les valeurs inconnues", async () => {
    await expectRejected(
      db.asUser(alice, (q) => q("update public.preferences set theme = 'rose' where user_id = $1", [alice])),
      /check constraint/,
    );
  });
});

describe("abonnements", () => {
  it("chacun lit son offre, sans les identifiants du prestataire", async () => {
    const rows = await db.asUser(alice, (q) =>
      q<{ plan: string; status: string }>("select plan, status from public.subscriptions"),
    );
    expect(rows).toEqual([{ plan: "free", status: "active" }]);
    await expectRejected(
      db.asUser(alice, (q) => q("select provider_customer_id from public.subscriptions")),
      PERMISSION_DENIED,
    );
  });

  it("personne ne peut s’attribuer Premium depuis l’application", async () => {
    await expectRejected(
      db.asUser(alice, (q) => q("update public.subscriptions set plan = 'premium' where user_id = $1", [alice])),
      PERMISSION_DENIED,
    );
    await expectRejected(
      db.asUser(alice, (q) => q("insert into public.subscriptions (user_id, plan) values ($1, 'premium')", [alice])),
      PERMISSION_DENIED,
    );
  });

  it("le serveur (clé secrète) peut changer l’offre, ce qui est journalisé", async () => {
    await db.asService((q) => q("update public.subscriptions set plan = 'premium' where user_id = $1", [bob]));
    const events = await db.asUser(bob, (q) =>
      q<{ event_type: string }>("select event_type from public.audit_events where event_type = 'subscription.changed'"),
    );
    expect(events).toEqual([{ event_type: "subscription.changed" }]);
  });
});

describe("journal d’audit", () => {
  it("chacun ne voit que ses événements", async () => {
    const rows = await db.asUser(alice, (q) => q<{ actor_id: string }>("select distinct actor_id from public.audit_events"));
    expect(rows).toEqual([{ actor_id: alice }]);
  });

  it("aucun client ne peut écrire dans le journal", async () => {
    await expectRejected(
      db.asUser(alice, (q) => q("insert into public.audit_events (actor_id, event_type) values ($1, 'faux.evenement')", [alice])),
      PERMISSION_DENIED,
    );
    await expectRejected(
      db.asUser(alice, (q) => q("delete from public.audit_events where actor_id = $1", [alice])),
      PERMISSION_DENIED,
    );
  });

  it("même le serveur ne peut ni modifier ni effacer un événement", async () => {
    await expectRejected(
      db.asService((q) => q("update public.audit_events set event_type = 'autre.evenement' where actor_id = $1", [alice])),
      /ajout seul/,
    );
    await expectRejected(
      db.asService((q) => q("delete from public.audit_events where actor_id = $1", [alice])),
      /ajout seul/,
    );
  });

  it("la suppression d’un compte efface ses données et anonymise son journal", async () => {
    const carol = await db.createUser("carol");
    await db.admin("delete from auth.users where id = $1", [carol]);
    const [row] = await db.admin<{ profiles: number; anonymized: number; kept: number }>(
      `select
        (select count(*) from public.profiles where id = $1)::int as profiles,
        (select count(*) from public.audit_events where actor_id = $1)::int as anonymized,
        (select count(*) from public.audit_events where actor_id is null and entity_id = $1::text)::int as kept`,
      [carol],
    );
    expect(row).toEqual({ profiles: 0, anonymized: 0, kept: 1 });
  });
});

describe("équipe éditoriale", () => {
  it("personne ne peut s’ajouter à l’équipe", async () => {
    await expectRejected(
      db.asUser(alice, (q) => q("insert into public.staff (user_id, role) values ($1, 'admin')", [alice])),
      PERMISSION_DENIED,
    );
  });
});
