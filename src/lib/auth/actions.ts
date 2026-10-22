"use client";

import { getBrowserSupabase } from "@/lib/supabase/browser";
import { toUserFacingError, type UserFacingError } from "@/lib/supabase/errors";

export type ActionResult<T = void> = { ok: true; value: T } | { ok: false; error: UserFacingError };

const NOT_CONFIGURED: ActionResult<never> = {
  ok: false,
  error: {
    kind: "unknown",
    message: "Les comptes ne sont pas configurés sur cette version de KODI (mode local).",
    retryable: false,
  },
};

function confirmUrl(next: string): string {
  return `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`;
}

/** Exécute un appel Supabase Auth et convertit erreurs et pannes réseau. */
async function run(operation: () => Promise<{ error: unknown }>): Promise<ActionResult> {
  try {
    const { error } = await operation();
    if (error) return { ok: false, error: toUserFacingError(error) };
    return { ok: true, value: undefined };
  } catch (error) {
    return { ok: false, error: toUserFacingError(error) };
  }
}

export async function signUp(email: string, password: string): Promise<ActionResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) return NOT_CONFIGURED;
  return run(() =>
    supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: confirmUrl("/profil") },
    }),
  );
}

export async function signIn(email: string, password: string): Promise<ActionResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) return NOT_CONFIGURED;
  return run(() => supabase.auth.signInWithPassword({ email: email.trim(), password }));
}

export async function resendConfirmation(email: string): Promise<ActionResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) return NOT_CONFIGURED;
  return run(() =>
    supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: confirmUrl("/profil") },
    }),
  );
}

/**
 * Demande un lien de réinitialisation. Par sécurité, l'interface affiche le
 * même message que l'adresse existe ou non (pas d'énumération des comptes).
 */
export async function requestPasswordReset(email: string): Promise<ActionResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) return NOT_CONFIGURED;
  return run(() =>
    supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: confirmUrl("/reinitialiser-mot-de-passe"),
    }),
  );
}

export async function updatePassword(password: string): Promise<ActionResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) return NOT_CONFIGURED;
  return run(() => supabase.auth.updateUser({ password }));
}

export async function signOut(): Promise<ActionResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) return NOT_CONFIGURED;
  // « local » : déconnecte cet appareil ; la session reste active ailleurs.
  return run(() => supabase.auth.signOut({ scope: "local" }));
}
