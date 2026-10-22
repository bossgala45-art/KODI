import { defineConfig } from "vitest/config";

/** Tests de sécurité de la base (RLS, privilèges, fonctions) sur PostgreSQL réel. */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["supabase/tests/**/*.test.ts"],
    globalSetup: ["./supabase/tests/global-setup.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
