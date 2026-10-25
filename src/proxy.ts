import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfig } from "@/lib/supabase/config";

/**
 * Rafraîchit la session Supabase avant chaque page ou route serveur (modèle
 * recommandé par @supabase/ssr) : les composants serveur, qui ne peuvent pas
 * écrire de cookie, voient ainsi une session valide. Sans Supabase configuré
 * (mode local), la requête passe sans traitement.
 */
export async function proxy(request: NextRequest) {
  if (!supabaseConfig.ok) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseConfig.config.url, supabaseConfig.config.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });
  // Vérifie le jeton auprès de Supabase et le renouvelle s'il a expiré.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    // Ni fichiers statiques, ni service worker, ni webhook Stripe (corps brut, sans session).
    "/((?!_next/static|_next/image|favicon.ico|icons/|sw.js|manifest.webmanifest|api/stripe/webhook|contenus/).*)",
  ],
};
