import { NextResponse, type NextRequest } from "next/server";
import { isConfirmType, safeNextPath } from "@/lib/auth/redirect";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * Redirection relative : le navigateur reste sur l'adresse réellement
 * utilisée (on ne reconstruit pas d'URL absolue à partir d'en-têtes).
 */
function redirectTo(path: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}

/**
 * Lien reçu par e-mail (confirmation d'adresse, réinitialisation du mot de
 * passe). Deux formats acceptés :
 *  - token_hash + type (modèles d'e-mail KODI, recommandé : fonctionne même si
 *    le lien est ouvert sur un autre appareil) ;
 *  - code (flux PKCE par défaut de Supabase, même navigateur uniquement).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"));
  const failure = redirectTo("/auth/lien-invalide");

  const supabase = await getServerSupabase();
  if (!supabase) return failure;

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  try {
    if (tokenHash && isConfirmType(type)) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      if (error) return failure;
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return failure;
    } else {
      return failure;
    }
  } catch {
    // Erreur réseau entre le serveur et Supabase : même page d'explication.
    return failure;
  }

  return redirectTo(next);
}
