import { afterAll, beforeAll, describe, expect, inject, it, onTestFinished } from "vitest";
import { PERMISSION_DENIED, TestDb, expectRejected } from "./helpers/session";

let db: TestDb;
beforeAll(() => {
  db = new TestDb(inject("databaseUrl"));
});
afterAll(() => db.close());

let seq = 0;
const eventId = () => `evt_test${(seq += 1)}x${Date.now()}`;

interface Snapshot {
  event?: string;
  type?: string;
  user: string | null;
  customer?: string;
  subscription?: string;
  status: string;
  periodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}

const apply = (s: Snapshot) =>
  db.asService(async (q) => {
    const rows = await q<{ r: string }>(
      `select public.billing_apply_subscription($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) as r`,
      [
        s.event ?? eventId(),
        s.type ?? "customer.subscription.updated",
        s.user,
        s.customer ?? `cus_${s.user?.slice(0, 8)}`,
        s.subscription ?? `sub_${s.user?.slice(0, 8)}`,
        "price_test",
        s.status,
        s.periodEnd === undefined ? new Date(Date.now() + 30 * 86_400_000) : s.periodEnd,
        s.cancelAtPeriodEnd ?? false,
        new Date(),
        false,
      ],
    );
    return rows[0]!.r;
  });

interface Entitlements {
  premium: boolean;
  plan: string;
  status: string;
  cancel_at_period_end: boolean;
  exams_today: number;
  free_daily_exams: number;
}
const entitlements = (user: string) =>
  db.asUser(user, async (q) => (await q<{ e: Entitlements }>("select public.my_entitlements() as e"))[0]!.e);

describe("abonnements : écriture réservée au webhook du serveur", () => {
  it("ni un visiteur ni un compte ne peuvent appliquer un abonnement", async () => {
    const user = await db.createUser("tricheur");
    const call = `select public.billing_apply_subscription('evt_x', 't', $1, 'cus_x', 'sub_x', 'p', 'active', now(), false, now(), false)`;
    await expectRejected(db.asUser(user, (q) => q(call, [user])), PERMISSION_DENIED);
    await expectRejected(db.asAnon((q) => q(call, [user])), PERMISSION_DENIED);
    await expectRejected(db.asUser(user, (q) => q("select * from public.billing_customer_of($1)", [user])), PERMISSION_DENIED);
    await expectRejected(db.asUser(user, (q) => q("select * from private.billing_events")), PERMISSION_DENIED);
    expect((await entitlements(user)).premium).toBe(false);
  });

  it("un abonnement actif donne Premium ; la lecture ne montre pas les identifiants Stripe", async () => {
    const user = await db.createUser("abonne");
    expect(await apply({ user, status: "active" })).toBe("applique");
    expect(await entitlements(user)).toMatchObject({ premium: true, plan: "premium", status: "active" });
    await expectRejected(
      db.asUser(user, (q) => q("select provider_customer_id from public.subscriptions")),
      PERMISSION_DENIED,
    );
  });

  it("traite un même événement une seule fois (idempotence)", async () => {
    const user = await db.createUser("idempotent");
    const event = eventId();
    expect(await apply({ event, user, status: "active" })).toBe("applique");
    // Le même événement renvoyé par Stripe, même avec un contenu différent, est ignoré.
    expect(await apply({ event, user, status: "canceled" })).toBe("deja-traite");
    expect((await entitlements(user)).premium).toBe(true);
    const [row] = await db.admin<{ n: number }>("select count(*)::int as n from private.billing_events where event_id = $1", [event]);
    expect(row!.n).toBe(1);
  });

  it.each([
    ["active", true],
    ["trialing", true],
    ["past_due", true],
    ["canceled", false],
    ["unpaid", false],
    ["incomplete", false],
    ["incomplete_expired", false],
    ["paused", false],
  ])("statut Stripe « %s » → Premium : %s", async (status, premium) => {
    const user = await db.createUser(`statut-${status}`);
    expect(await apply({ user, status })).toBe("applique");
    expect((await entitlements(user)).premium).toBe(premium);
  });

  it("échec de paiement puis relances épuisées : l’accès est retiré", async () => {
    const user = await db.createUser("echec");
    await apply({ user, status: "active" });
    await apply({ user, status: "past_due", type: "invoice.payment_failed" });
    expect((await entitlements(user)).premium).toBe(true);
    await apply({ user, status: "unpaid" });
    expect(await entitlements(user)).toMatchObject({ premium: false, plan: "free", status: "unpaid" });
  });

  it("résiliation : Premium jusqu’à la fin de la période, puis gratuit", async () => {
    const user = await db.createUser("resiliation");
    await apply({ user, status: "active" });
    await apply({ user, status: "active", cancelAtPeriodEnd: true });
    expect(await entitlements(user)).toMatchObject({ premium: true, cancel_at_period_end: true });
    await apply({ user, status: "canceled", type: "customer.subscription.deleted" });
    expect((await entitlements(user)).premium).toBe(false);
  });

  it("sans nouvelle de Stripe après la fin de période (+2 jours), l’accès s’arrête", async () => {
    const user = await db.createUser("expire");
    await apply({ user, status: "active", periodEnd: new Date(Date.now() - 3 * 86_400_000) });
    expect((await entitlements(user)).premium).toBe(false);
    const recent = await db.createUser("renouvellement");
    await apply({ user: recent, status: "active", periodEnd: new Date(Date.now() - 86_400_000) });
    expect((await entitlements(recent)).premium).toBe(true);
  });

  it("ignore un événement sans compte KODI ou pour un compte inconnu", async () => {
    expect(await apply({ user: null, status: "active", customer: "cus_orphelin", subscription: "sub_orphelin" })).toBe("ignore");
    expect(
      await apply({ user: "00000000-0000-0000-0000-000000000000", status: "active", customer: "cus_x2", subscription: "sub_x2" }),
    ).toBe("ignore");
  });

  it("refuse de rattacher le client Stripe d’un compte à un autre compte", async () => {
    const alice = await db.createUser("alice-paie");
    const mallory = await db.createUser("mallory-paie");
    await apply({ user: alice, status: "active", customer: "cus_alice" });
    expect(await apply({ user: mallory, status: "active", customer: "cus_alice", subscription: "sub_mallory" })).toBe("ignore");
    expect((await entitlements(mallory)).premium).toBe(false);
  });

  it("un ancien abonnement terminé n’écrase pas l’abonnement en cours", async () => {
    const user = await db.createUser("deux-abonnements");
    await apply({ user, status: "active", subscription: "sub_nouveau" });
    expect(await apply({ user, status: "canceled", subscription: "sub_ancien" })).toBe("ignore");
    expect((await entitlements(user)).premium).toBe(true);
  });
});

describe("offre gratuite : un examen par jour", () => {
  const start = (user: string) =>
    db.asUser(user, async (q) => (await q<{ id: string }>("select public.start_exam_mode('express') as id"))[0]!.id);
  const abandon = (user: string, id: string) => db.asUser(user, (q) => q("select public.abandon_exam($1)", [id]));
  const availability = (user: string) =>
    db.asUser(user, async (q) => (await q<{ a: { reason: string | null; daily_limit_reached: boolean } }>("select public.exam_availability('express') as a"))[0]!.a);

  it("un compte gratuit ne lance qu’un examen par jour, abandonné ou non", async () => {
    const user = await db.createUser("gratuit-examens");
    expect(await availability(user)).toMatchObject({ reason: null, daily_limit_reached: false });
    await abandon(user, await start(user));
    expect(await availability(user)).toMatchObject({ reason: "KODI_DAILY_EXAM_LIMIT", daily_limit_reached: true });
    await expectRejected(start(user), /KODI_DAILY_EXAM_LIMIT/);
    expect(await entitlements(user)).toMatchObject({ exams_today: 1, free_daily_exams: 1 });
  });

  it("le compteur repart le lendemain (jour civil de Paris)", async () => {
    const user = await db.createUser("gratuit-lendemain");
    await abandon(user, await start(user));
    await db.admin("update public.exams set started_at = now() - interval '1 day' where user_id = $1", [user]);
    expect((await availability(user)).daily_limit_reached).toBe(false);
  });

  it("Premium : examens illimités", async () => {
    const user = await db.createUser("premium-examens");
    await apply({ user, status: "active" });
    for (let i = 0; i < 3; i += 1) await abandon(user, await start(user));
    expect((await availability(user)).daily_limit_reached).toBe(false);
  });

  it("le compteur ne peut pas être modifié par la personne", async () => {
    const user = await db.createUser("gratuit-triche");
    await abandon(user, await start(user));
    await expectRejected(
      db.asUser(user, (q) => q("update public.exams set started_at = now() - interval '2 days' where user_id = $1", [user])),
      PERMISSION_DENIED,
    );
    await expectRejected(db.asUser(user, (q) => q("delete from public.exams where user_id = $1", [user])), PERMISSION_DENIED);
  });
});

describe("leçons Premium", () => {
  it("une leçon Premium publiée n’est lue que par un abonné", async () => {
    const free = await db.createUser("lecteur-gratuit");
    const premium = await db.createUser("lecteur-premium");
    await apply({ user: premium, status: "active" });
    const [course] = await db.admin<{ id: string }>(
      "insert into public.courses (slug, title, status) values ('univers-premium', 'Univers premium', 'draft') returning id",
    );
    // Retiré à la fin : les autres fichiers de test comptent les leçons publiées.
    onTestFinished(() => db.admin("delete from public.courses where id = $1", [course!.id]).then(() => undefined));
    await db.admin(
      `insert into public.lessons (course_id, slug, title, position, status, sources, reviewed_at, access) values
         ($1, 'lecon-gratuite', 'Gratuite', 1, 'published', '[{"title":"S"}]', now(), 'gratuit'),
         ($1, 'lecon-premium', 'Premium', 2, 'published', '[{"title":"S"}]', now(), 'premium')`,
      [course!.id],
    );
    const slugs = (rows: { slug: string }[]) => rows.map((r) => r.slug).sort();
    const sql = "select slug from public.lessons where course_id = $1";
    expect(slugs(await db.asAnon((q) => q<{ slug: string }>(sql, [course!.id])))).toEqual(["lecon-gratuite"]);
    expect(slugs(await db.asUser(free, (q) => q<{ slug: string }>(sql, [course!.id])))).toEqual(["lecon-gratuite"]);
    expect(slugs(await db.asUser(premium, (q) => q<{ slug: string }>(sql, [course!.id])))).toEqual(["lecon-gratuite", "lecon-premium"]);
  });
});
