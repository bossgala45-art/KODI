"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/supabase/config";

let client: SupabaseClient | null = null;

/**
 * Client Supabase du navigateur (clé publique uniquement). La session est
 * stockée dans des cookies, lisibles par la route /auth/confirm.
 * Renvoie null en mode local (Supabase non configuré).
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!supabaseConfig.ok) return null;
  if (!client) {
    client = createBrowserClient(supabaseConfig.config.url, supabaseConfig.config.publishableKey);
  }
  return client;
}
