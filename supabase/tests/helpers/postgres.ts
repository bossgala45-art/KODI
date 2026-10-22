/**
 * Démarre un PostgreSQL temporaire pour les tests de sécurité, ou utilise
 * celui indiqué par KODI_TEST_DATABASE_URL.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "pg";

export interface TestDatabase {
  connectionString: string;
  stop: () => void;
}

const ROOT = join(__dirname, "..", "..", "..");

function findPgBin(): string {
  if (process.env.PG_BIN) return process.env.PG_BIN;
  const base = "/usr/lib/postgresql";
  if (existsSync(base)) {
    const versions = readdirSync(base)
      .filter((v) => existsSync(join(base, v, "bin", "initdb")))
      .sort((a, b) => Number(b) - Number(a));
    if (versions[0]) return join(base, versions[0], "bin");
  }
  throw new Error(
    "PostgreSQL introuvable : installez-le ou définissez PG_BIN / KODI_TEST_DATABASE_URL.",
  );
}

/** PostgreSQL refuse de tourner en root : on passe alors par l'utilisateur postgres. */
function run(bin: string, args: string[], asPostgres: boolean): void {
  if (asPostgres) {
    const quoted = [bin, ...args].map((a) => `'${a.replace(/'/g, "'\\''")}'`).join(" ");
    execFileSync("su", ["postgres", "-s", "/bin/sh", "-c", quoted], { stdio: "pipe" });
  } else {
    execFileSync(bin, args, { stdio: "pipe" });
  }
}

export function startPostgres(): TestDatabase {
  if (process.env.KODI_TEST_DATABASE_URL) {
    return { connectionString: process.env.KODI_TEST_DATABASE_URL, stop: () => {} };
  }
  const bin = findPgBin();
  const asPostgres = process.getuid?.() === 0;
  const dir = mkdtempSync(join(tmpdir(), "kodi-pg-"));
  chmodSync(dir, 0o777);
  if (asPostgres) spawnSync("chown", ["postgres", dir]);
  const data = join(dir, "data");
  const port = String(55000 + Math.floor(Math.random() * 5000));

  run(join(bin, "initdb"), ["-D", data, "-U", "postgres", "--auth=trust", "-E", "UTF8"], asPostgres);
  run(
    join(bin, "pg_ctl"),
    ["-D", data, "-l", join(dir, "log"), "-w", "-o", `-p ${port} -k ${dir} -c listen_addresses=`, "start"],
    asPostgres,
  );

  return {
    connectionString: `postgresql://postgres@/postgres?host=${encodeURIComponent(dir)}&port=${port}`,
    stop: () => {
      try {
        run(join(bin, "pg_ctl"), ["-D", data, "-m", "immediate", "stop"], asPostgres);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    },
  };
}

export function migrationFiles(): string[] {
  const dir = join(ROOT, "supabase", "migrations");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => join(dir, f));
}

/** Applique le shim Supabase puis toutes les migrations, dans l'ordre. */
export async function applySchema(connectionString: string): Promise<void> {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(readFileSync(join(ROOT, "supabase", "tests", "supabase-shim.sql"), "utf8"));
    for (const file of migrationFiles()) {
      try {
        await client.query(readFileSync(file, "utf8"));
      } catch (error) {
        throw new Error(`Échec de la migration ${file} : ${(error as Error).message}`);
      }
    }
  } finally {
    await client.end();
  }
}
