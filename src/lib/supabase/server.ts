import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseConfig } from "@/lib/supabase/config";

/**
 * Client Supabase côté serveur, agissant au nom de l'utilisateur (cookies de
 * session + clé publique). Il ne contourne jamais RLS.
 */
export async function getServerSupabase(): Promise<SupabaseClient | null> {
  if (!supabaseConfig.ok) return null;
  const cookieStore = await cookies();
  return createServerClient(supabaseConfig.config.url, supabaseConfig.config.publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Composant serveur : écriture impossible, la session est rafraîchie par src/proxy.ts.
        }
      },
    },
  });
}
