"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/display";
import { Checkbox, PasswordField, TextField } from "@/components/ui/form";
import { FIRST_NAME_MAX_LENGTH } from "@/lib/profile";
import {
  PASSWORD_MIN_LENGTH,
  hasErrors,
  validateLogin,
  validateSignup,
  type FieldErrors,
  type LoginInput,
  type SignupInput,
} from "@/lib/validation";

/** Comptes non disponibles avant la phase « Comptes et base de données ». */
function AccountsUnavailable() {
  return (
    <Alert tone="info" role="status" title="Les comptes ne sont pas encore disponibles">
      Votre saisie est valide, mais aucun compte ne peut encore être créé ni
      utilisé. Rien n’a été envoyé : vous pouvez continuer à utiliser KODI sur
      cet appareil sans compte.
    </Alert>
  );
}

function focusFirstInvalid(form: HTMLFormElement | null) {
  form?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
}

export function LoginForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<LoginInput>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<keyof LoginInput>>({});
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof LoginInput>(key: K, value: LoginInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setSubmitted(false);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validateLogin(values);
    setErrors(next);
    setSubmitted(!hasErrors(next));
    if (hasErrors(next)) requestAnimationFrame(() => focusFirstInvalid(formRef.current));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      <TextField
        label="Adresse e-mail"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={values.email}
        onChange={(e) => update("email", e.target.value)}
        error={errors.email}
      />
      <PasswordField
        label="Mot de passe"
        name="password"
        autoComplete="current-password"
        value={values.password}
        onChange={(e) => update("password", e.target.value)}
        error={errors.password}
      />
      <Button type="submit" size="lg" block>
        Se connecter
      </Button>
      <div aria-live="polite">{submitted && <AccountsUnavailable />}</div>
      <p className="text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-brand-text underline-offset-2 hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<SignupInput>({
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FieldErrors<keyof SignupInput>>({});
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof SignupInput>(key: K, value: SignupInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setSubmitted(false);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validateSignup(values);
    setErrors(next);
    setSubmitted(!hasErrors(next));
    if (hasErrors(next)) requestAnimationFrame(() => focusFirstInvalid(formRef.current));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      <TextField
        label="Prénom (facultatif)"
        name="firstName"
        autoComplete="given-name"
        maxLength={FIRST_NAME_MAX_LENGTH}
        value={values.firstName}
        onChange={(e) => update("firstName", e.target.value)}
        error={errors.firstName}
      />
      <TextField
        label="Adresse e-mail"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={values.email}
        onChange={(e) => update("email", e.target.value)}
        error={errors.email}
      />
      <PasswordField
        label="Mot de passe"
        name="password"
        autoComplete="new-password"
        value={values.password}
        onChange={(e) => update("password", e.target.value)}
        error={errors.password}
        hint={`Au moins ${PASSWORD_MIN_LENGTH} caractères, dont une lettre et un chiffre.`}
      />
      <PasswordField
        label="Confirmer le mot de passe"
        name="confirmPassword"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={(e) => update("confirmPassword", e.target.value)}
        error={errors.confirmPassword}
      />
      <Checkbox
        name="acceptTerms"
        checked={values.acceptTerms}
        onChange={(checked) => update("acceptTerms", checked)}
        error={errors.acceptTerms}
        label="J’accepte les conditions d’utilisation et la politique de confidentialité (documents en cours de rédaction)."
      />
      <Button type="submit" size="lg" block>
        Créer mon compte
      </Button>
      <div aria-live="polite">{submitted && <AccountsUnavailable />}</div>
      <p className="text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-semibold text-brand-text underline-offset-2 hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
