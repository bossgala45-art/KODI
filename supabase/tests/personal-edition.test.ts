import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";
import { TestDb } from "./helpers/session";

let db: TestDb;
beforeAll(() => {
  db = new TestDb(inject("databaseUrl"));
});
afterAll(() => db.close());

describe("édition personnelle gratuite (D-032)", () => {
  it("donne tous les droits à un compte sans abonnement", async () => {
    const user = await db.createUser("perso");
    const [row] = await db.asUser(user, (q) => q<{ e: { premium: boolean } }>("select public.my_entitlements() as e"));
    expect(row!.e.premium).toBe(true);
  });

  it("rend lisibles par tous les leçons publiées autrefois réservées à Premium", async () => {
    await db.adminRollback(async (q) => {
      const [course] = await q<{ id: string }>(
        "insert into public.courses (slug, title, status) values ('univers-perso', 'Univers perso', 'published') returning id",
      );
      await q(
        `insert into public.lessons (course_id, slug, title, position, status, sources, reviewed_at, access)
         values ($1, 'lecon-perso', 'Leçon perso', 1, 'published', '[{"title":"Source"}]', now(), 'premium')`,
        [course!.id],
      );
      await q("set local role anon");
      expect(await q("select id from public.lessons where slug = 'lecon-perso'")).toHaveLength(1);
    });
  });

  it("ne garde aucune fonction de paiement", async () => {
    const rows = await db.admin("select proname from pg_proc where proname like 'billing_%'");
    expect(rows).toEqual([]);
  });
});
