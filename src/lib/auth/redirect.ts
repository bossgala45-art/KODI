/**
 * Destination après confirmation : uniquement un chemin interne connu, pour
 * empêcher toute redirection ouverte vers un site tiers (hameçonnage).
 */
const ALLOWED_NEXT = new Set(["/", "/profil", "/reinitialiser-mot-de-passe", "/bienvenue", "/simuler"]);

export function safeNextPath(next: string | null | undefined, fallback = "/profil"): string {
  if (!next) return fallback;
  return ALLOWED_NEXT.has(next) ? next : fallback;
}

export const EMAIL_OTP_TYPES = ["email", "signup", "recovery", "email_change"] as const;
export type ConfirmType = (typeof EMAIL_OTP_TYPES)[number];

export function isConfirmType(value: string | null): value is ConfirmType {
  return value !== null && (EMAIL_OTP_TYPES as readonly string[]).includes(value);
}
