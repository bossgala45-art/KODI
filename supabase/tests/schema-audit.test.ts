import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";
import { TestDb } from "./helpers/session";

let db: TestDb;
beforeAll(() => {
  db = new TestDb(inject("databaseUrl"));
});
afterAll(() => db.close());

describe("audit global du schéma public", () => {
  it("active RLS sur toutes les tables", async () => {
    const rows = await db.admin<{ relname: string }>(`
      select c.relname from pg_class c
      where c.relnamespace = 'public'::regnamespace and c.relkind = 'r' and not c.relrowsecurity
    `);
    expect(rows.map((r) => r.relname)).toEqual([]);
  });

  it("n’accorde aux clients que les droits de table attendus", async () => {
    const rows = await db.admin<{ grantee: string; table_name: string; privilege_type: string }>(`
      select grantee, table_name, privilege_type
      from information_schema.role_table_grants
      where table_schema = 'public' and grantee in ('anon', 'authenticated')
      order by grantee, table_name, privilege_type
    `);
    const actual = rows.map((r) => `${r.grantee}:${r.table_name}:${r.privilege_type}`);
    expect(actual).toEqual(
      [
        "anon:competences:SELECT",
        "anon:courses:SELECT",
        "anon:lesson_competences:SELECT",
        "anon:lessons:SELECT",
        "anon:simulation_scenes:SELECT",
        "authenticated:attempts:DELETE",
        "authenticated:attempts:SELECT",
        "authenticated:audit_events:SELECT",
        "authenticated:competences:SELECT",
        "authenticated:courses:SELECT",
        "authenticated:exam_items:SELECT",
        "authenticated:exams:SELECT",
        "authenticated:lesson_competences:SELECT",
        "authenticated:lessons:SELECT",
        "authenticated:preferences:SELECT",
        "authenticated:profiles:SELECT",
        "authenticated:question_choices:SELECT",
        "authenticated:question_competences:SELECT",
        "authenticated:questions:SELECT",
        "authenticated:revisions:DELETE",
        "authenticated:revisions:SELECT",
        "authenticated:simulation_runs:DELETE",
        "authenticated:simulation_runs:INSERT",
        "authenticated:simulation_runs:SELECT",
        "authenticated:simulation_scenes:SELECT",
        "authenticated:staff:SELECT",
      ].sort(),
    );
  });

  it("limite les modifications aux colonnes prévues", async () => {
    const rows = await db.admin<{ table_name: string; column_name: string }>(`
      select table_name, column_name from information_schema.column_privileges
      where table_schema = 'public' and grantee = 'authenticated' and privilege_type = 'UPDATE'
      order by table_name, column_name
    `);
    expect(rows.map((r) => `${r.table_name}.${r.column_name}`)).toEqual([
      "preferences.motion",
      "preferences.theme",
      "profiles.daily_goal",
      "profiles.first_name",
      "profiles.onboarding_completed",
    ]);
  });

  it("ne donne aucun accès direct aux bonnes réponses", async () => {
    const rows = await db.admin<{ anon: boolean; auth: boolean }>(`
      select has_table_privilege('anon', 'public.question_answers', 'select') as anon,
             has_table_privilege('authenticated', 'public.question_answers', 'select') as auth
    `);
    expect(rows[0]).toEqual({ anon: false, auth: false });
  });

  it("fixe le search_path de toutes les fonctions SECURITY DEFINER", async () => {
    const rows = await db.admin<{ name: string }>(`
      select n.nspname || '.' || p.proname as name
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname in ('public', 'private') and p.prosecdef
        and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')
    `);
    expect(rows).toEqual([]);
  });

  it("interdit aux visiteurs anonymes d’appeler les fonctions de l’application", async () => {
    const rows = await db.admin<{ name: string }>(`
      select p.proname as name from pg_proc p
      where p.pronamespace = 'public'::regnamespace
        and has_function_privilege('anon', p.oid, 'execute')
    `);
    expect(rows).toEqual([]);
  });

  it("n’expose aux clients aucune fonction interne sensible", async () => {
    const rows = await db.admin<{ name: string }>(`
      select p.proname as name from pg_proc p
      where p.pronamespace = 'private'::regnamespace
        and has_function_privilege('authenticated', p.oid, 'execute')
      order by 1
    `);
    // Seule la vérification du rôle éditorial est utilisée par les politiques.
    expect(rows.map((r) => r.name)).toEqual(["is_editor"]);
  });

  it("publie en temps réel uniquement les tables prévues", async () => {
    const rows = await db.admin<{ tablename: string }>(`
      select tablename from pg_publication_tables where pubname = 'supabase_realtime' order by 1
    `);
    expect(rows.map((r) => r.tablename)).toEqual(["exams", "preferences", "profiles"]);
  });
});
