import { FIRST_NAME_MAX_LENGTH } from "@/lib/profile";

export const PASSWORD_MIN_LENGTH = 8;

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

// Volontairement simple : la vérification réelle se fera par e-mail.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Saisissez votre adresse e-mail.";
  if (!EMAIL_PATTERN.test(email)) {
    return "Adresse e-mail invalide (exemple : prenom@domaine.fr).";
  }
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Saisissez un mot de passe.";
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Au moins ${PASSWORD_MIN_LENGTH} caractères.`;
  }
  if (!/[A-Za-zÀ-ÿ]/.test(value) || !/\d/.test(value)) {
    return "Utilisez au moins une lettre et un chiffre.";
  }
  return undefined;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function validateLogin(input: LoginInput): FieldErrors<keyof LoginInput> {
  const errors: FieldErrors<keyof LoginInput> = {};
  const email = validateEmail(input.email);
  if (email) errors.email = email;
  if (!input.password) errors.password = "Saisissez votre mot de passe.";
  return errors;
}

export interface SignupInput {
  firstName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export function validateSignup(
  input: SignupInput,
): FieldErrors<keyof SignupInput> {
  const errors: FieldErrors<keyof SignupInput> = {};
  if (input.firstName.trim().length > FIRST_NAME_MAX_LENGTH) {
    errors.firstName = `${FIRST_NAME_MAX_LENGTH} caractères maximum.`;
  }
  const email = validateEmail(input.email);
  if (email) errors.email = email;
  const password = validatePassword(input.password);
  if (password) errors.password = password;
  if (!input.confirmPassword) {
    errors.confirmPassword = "Confirmez votre mot de passe.";
  } else if (input.confirmPassword !== input.password) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas.";
  }
  if (!input.acceptTerms) {
    errors.acceptTerms = "Vous devez accepter les conditions pour continuer.";
  }
  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
