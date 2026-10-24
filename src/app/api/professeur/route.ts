import type { NextRequest } from "next/server";
import { MAX_BODY_BYTES, parseTutorRequest } from "@/lib/tutor/request";
import { getServerSupabase } from "@/lib/supabase/server";
import { askTutor, clientFingerprint } from "@/lib/tutor/server";

/** Droit Premium lu dans la base (private.has_premium), jamais déclaré par le navigateur. */
async function isPremium(): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;
  const { data, error } = await supabase.rpc("my_entitlements");
  return !error && (data as { premium?: unknown } | null)?.premium === true;
}

const NO_STORE = { "Cache-Control": "no-store" };

function error(status: number, code: string, headers: Record<string, string> = {}) {
  return Response.json({ error: code }, { status, headers: { ...NO_STORE, ...headers } });
}

/**
 * Professeur de KODI. Toute la logique (et l'éventuel appel à une IA) a lieu
 * ici, côté serveur : le navigateur n'envoie qu'une demande et ne voit
 * jamais de clé.
 */
export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return error(415, "type-non-pris-en-charge");
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return error(413, "demande-trop-longue");

  const body = await request.text();
  if (new TextEncoder().encode(body).length > MAX_BODY_BYTES) return error(413, "demande-trop-longue");

  let raw: unknown;
  try {
    raw = JSON.parse(body);
  } catch {
    return error(400, "demande-invalide");
  }
  const tutorRequest = parseTutorRequest(raw);
  if (!tutorRequest) return error(400, "demande-invalide");

  // Adresse donnée par l'hébergeur ; seule son empreinte (salée, éphémère) est utilisée.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "inconnue";
  const client = clientFingerprint(ip, request.headers.get("user-agent") ?? "");

  const outcome = await askTutor(tutorRequest, client, await isPremium());
  if (!outcome.ok) return error(429, outcome.error, { "Retry-After": "60" });
  return Response.json(outcome.response, { headers: NO_STORE });
}
