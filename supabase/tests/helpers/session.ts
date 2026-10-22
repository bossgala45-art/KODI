/**
 * Accès à la base de test sous différentes identités, comme le ferait
 * PostgREST : rôle Postgres + « claims » du jeton JWT dans la transaction.
 */
import { randomUUID } from "node:crypto";
import { Pool, type PoolClient } from "pg";
import { expect } from "vitest";

export type Query = <R extends object = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
) => Promise<R[]>;

export class TestDb {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString, max: 4 });
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  /** Superutilisateur : préparation des données uniquement. */
  async admin<R extends object = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<R[]> {
    const result = await this.pool.query(sql, params);
    return result.rows as R[];
  }

  /** Superutilisateur dans une transaction annulée à la fin (aucune trace). */
  async adminRollback<T>(fn: (q: Query) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const q: Query = async (sql, params) => (await client.query(sql, params)).rows;
      return await fn(q);
    } finally {
      await client.query("rollback").catch(() => {});
      client.release();
    }
  }

  /** Comme asUser, mais à l'intérieur d'une transaction existante. */
  static async impersonate(q: Query, userId: string): Promise<void> {
    await q("set local role authenticated");
    await q("select set_config('request.jwt.claims', $1, true)", [
      JSON.stringify({ sub: userId, role: "authenticated" }),
    ]);
  }

  /** Crée un compte comme le ferait Supabase Auth (déclenche handle_new_user). */
  async createUser(label = "utilisateur"): Promise<string> {
    const id = randomUUID();
    await this.admin("insert into auth.users (id, email) values ($1, $2)", [
      id,
      `${label}-${id.slice(0, 8)}@exemple.test`,
    ]);
    return id;
  }

  private async withRole<T>(
    role: "anon" | "authenticated" | "service_role",
    claims: Record<string, unknown>,
    fn: (q: Query) => Promise<T>,
  ): Promise<T> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query("begin");
      await client.query(`set local role ${role}`);
      await client.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify(claims)]);
      const q: Query = async (sql, params) => (await client.query(sql, params)).rows;
      const result = await fn(q);
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  asUser<T>(userId: string, fn: (q: Query) => Promise<T>): Promise<T> {
    return this.withRole("authenticated", { sub: userId, role: "authenticated" }, fn);
  }

  asAnon<T>(fn: (q: Query) => Promise<T>): Promise<T> {
    return this.withRole("anon", { role: "anon" }, fn);
  }

  asService<T>(fn: (q: Query) => Promise<T>): Promise<T> {
    return this.withRole("service_role", { role: "service_role" }, fn);
  }
}

/** Vérifie qu'une opération est refusée, avec un message attendu. */
export async function expectRejected(promise: Promise<unknown>, message: RegExp): Promise<void> {
  await expect(promise).rejects.toThrow(message);
}

export const PERMISSION_DENIED = /permission denied/;
export const RLS_VIOLATION = /row-level security/;

/** Parcourt un JSON et liste toutes ses clés (pour traquer les fuites). */
export function allKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach((v) => allKeys(v, keys));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      keys.add(k);
      allKeys(v, keys);
    }
  }
  return keys;
}
