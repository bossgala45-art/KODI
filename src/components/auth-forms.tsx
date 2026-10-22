"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, LoadingBlock } from "@/components/ui/display";
import { Checkbox, PasswordField, TextField } from "@/components/ui/form";
import {
  requestPasswordReset,
  resendConfirmation,
  signIn,
  signUp,
  updatePassword,
} from "@/lib/auth/actions";
import { useAuth } from "@/lib/auth/session-store";
import { FIRST_NAME_MAX_LENGTH } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { UserFacingError } from "@/lib/supabase/errors";
import {
  PASSWORD_MIN_LENGTH,
  hasErrors,
  validateEmail,
  validateLogin,
  validatePassword,
  validateSignup,
  type FieldErrors,
  type LoginInput,
  type SignupInput,
} from "@/lib/validation";

const LINK = "font-semibold text-brand-text underline-offset-2 hover:underline";

/** Mode local : Supabase n'est pas configuré sur cette version. */
export function LocalModeNotice() {
  return (
    <Alert tone="info" role="note" title="Mode local" className="mb-5">
      Les comptes en ligne ne sont pas encore configurés sur cette version de
      KODI. Vous pouvez utiliser l’application sans compte : vos données
      restent sur cet appareil.
    </Alert>
  );
}

function AccountsUnavailable() {
  return (
    <Alert tone="info" role="status" title="Comptes non configurés">
      Votre saisie est valide, mais les comptes ne sont pas encore activés sur
      cette version. Rien n’a été envoyé.
    </Alert>
  );
}

function ServerError({ error, children }: { error: UserFacingError; children?: ReactNode }) {
  return (
    <Alert tone="danger" role="alert" title={error.kind === "network" ? "Problème de connexion" : undefined}>
      {error.message}
      {children}
    </Alert>
  );
}

function focusFirstInvalid(form: HTMLFormElement | null) {
  requestAnimationFrame(() => form?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
}

// ---------------------------------------------------------------------------
// Connexion
// ---------------------------------------------------------------------------
export function LoginForm() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<LoginInput>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<keyof LoginInput>>({});
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<UserFacingError | null>(null);
  const [localSubmitted, setLocalSubmitted] = useState(false);
  const [resent, setResent] = useState(false);

  function update<K extends keyof LoginInput>(key: K, value: LoginInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setServerError(null);
    setLocalSubmitted(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validateLogin(values);
    setErrors(next);
    if (hasErrors(next)) return focusFirstInvalid(formRef.current);
    if (!configured) return setLocalSubmitted(true);

    setPending(true);
    setServerError(null);
    const result = await signIn(values.email, values.password);
    setPending(false);
    if (result.ok) router.push("/profil");
    else setServerError(result.error);
  }

  async function handleResend() {
    setPending(true);
    const result = await resendConfirmation(values.email);
    setPending(false);
    if (result.ok) setResent(true);
    else setServerError(result.error);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      {!configured && <LocalModeNotice />}
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
      <p className="-mt-2 text-right text-sm">
        <Link href="/mot-de-passe-oublie" className={LINK}>
          Mot de passe oublié ?
        </Link>
      </p>
      <Button type="submit" size="lg" block loading={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
      <div aria-live="polite" className="space-y-3">
        {localSubmitted && <AccountsUnavailable />}
        {serverError && (
          <ServerError error={serverError}>
            {serverError.code === "email_not_confirmed" && !resent && (
              <Button variant="ghost" className="mt-2 -ml-3" onClick={handleResend} disabled={pending}>
                Renvoyer l’e-mail de confirmation
              </Button>
            )}
          </ServerError>
        )}
        {resent && (
          <Alert tone="success" role="status">
            E-mail de confirmation renvoyé. Pensez à vérifier vos indésirables.
          </Alert>
        )}
      </div>
      <p className="text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className={LINK}>
          Créer un compte
        </Link>
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Inscription
// ---------------------------------------------------------------------------
export function SignupForm() {
  const configured = isSupabaseConfigured();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<SignupInput>({
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FieldErrors<keyof SignupInput>>({});
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<UserFacingError | null>(null);
  const [localSubmitted, setLocalSubmitted] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  function update<K extends keyof SignupInput>(key: K, value: SignupInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setServerError(null);
    setLocalSubmitted(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validateSignup(values);
    setErrors(next);
    if (hasErrors(next)) return focusFirstInvalid(formRef.current);
    if (!configured) return setLocalSubmitted(true);

    setPending(true);
    setServerError(null);
    const result = await signUp(values.email, values.password);
    setPending(false);
    if (result.ok) setSentTo(values.email.trim());
    else setServerError(result.error);
  }

  if (sentTo) {
    return (
      <div className="space-y-5 animate-enter" role="status">
        <div className="rounded-3xl bg-success-soft p-5">
          <p className="flex items-center gap-2 font-bold">
            <Icon name="check" className="text-success-text" />
            Vérifiez votre boîte de réception
          </p>
          <p className="mt-2 text-sm">
            Si cette adresse peut être utilisée, un e-mail de confirmation a été
            envoyé à <strong>{sentTo}</strong>. Ouvrez le lien qu’il contient pour
            activer votre compte, puis connectez-vous.
          </p>
        </div>
        {resent ? (
          <p className="text-sm text-muted">E-mail renvoyé.</p>
        ) : (
          <Button
            variant="secondary"
            loading={pending}
            onClick={async () => {
              setPending(true);
              const result = await resendConfirmation(sentTo);
              setPending(false);
              if (result.ok) setResent(true);
              else setServerError(result.error);
            }}
          >
            Renvoyer l’e-mail
          </Button>
        )}
        {serverError && <ServerError error={serverError} />}
        <ButtonLink href="/connexion" block size="lg">
          Aller à la connexion
        </ButtonLink>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      {!configured && <LocalModeNotice />}
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
      <Button type="submit" size="lg" block loading={pending}>
        {pending ? "Création…" : "Créer mon compte"}
      </Button>
      <div aria-live="polite">
        {localSubmitted && <AccountsUnavailable />}
        {serverError && <ServerError error={serverError} />}
      </div>
      <p className="text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className={LINK}>
          Se connecter
        </Link>
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Mot de passe oublié
// ---------------------------------------------------------------------------
export function ForgotPasswordForm() {
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<UserFacingError | null>(null);
  const [done, setDone] = useState(false);
  const [localSubmitted, setLocalSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const invalid = validateEmail(email);
    setError(invalid);
    if (invalid) return;
    if (!configured) return setLocalSubmitted(true);
    setPending(true);
    setServerError(null);
    const result = await requestPasswordReset(email);
    setPending(false);
    // Même message que le compte existe ou non (pas d'énumération).
    if (result.ok) setDone(true);
    else setServerError(result.error);
  }

  if (done) {
    return (
      <Alert tone="success" role="status" title="Demande envoyée">
        Si un compte existe pour cette adresse, un e-mail contenant un lien de
        réinitialisation vient d’être envoyé. Le lien est valable une heure.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {!configured && <LocalModeNotice />}
      <TextField
        label="Adresse e-mail"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(undefined);
          setServerError(null);
          setLocalSubmitted(false);
        }}
        error={error}
      />
      <Button type="submit" size="lg" block loading={pending}>
        Recevoir un lien
      </Button>
      <div aria-live="polite">
        {localSubmitted && <AccountsUnavailable />}
        {serverError && <ServerError error={serverError} />}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Nouveau mot de passe (après le lien de réinitialisation)
// ---------------------------------------------------------------------------
export function ResetPasswordForm() {
  const auth = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<UserFacingError | null>(null);
  const [done, setDone] = useState(false);

  if (auth.status === "loading") return <LoadingBlock label="Vérification du lien…" lines={2} />;
  if (auth.status === "local") return <LocalModeNotice />;
  if (auth.status === "signed-out") {
    return (
      <Alert tone="danger" role="alert" title="Lien expiré ou invalide">
        Ouvrez le dernier lien reçu par e-mail, ou{" "}
        <Link href="/mot-de-passe-oublie" className={LINK}>
          demandez-en un nouveau
        </Link>
        .
      </Alert>
    );
  }
  if (done) {
    return (
      <div className="space-y-5">
        <Alert tone="success" role="status" title="Mot de passe modifié">
          Votre nouveau mot de passe est enregistré.
        </Alert>
        <ButtonLink href="/profil" block size="lg">
          Aller à mon profil
        </ButtonLink>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = {
      password: validatePassword(password),
      confirm: !confirm
        ? "Confirmez votre mot de passe."
        : confirm !== password
          ? "Les mots de passe ne correspondent pas."
          : undefined,
    };
    setErrors(next);
    if (next.password || next.confirm) return;
    setPending(true);
    setServerError(null);
    const result = await updatePassword(password);
    setPending(false);
    if (result.ok) setDone(true);
    else setServerError(result.error);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <PasswordField
        label="Nouveau mot de passe"
        name="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        hint={`Au moins ${PASSWORD_MIN_LENGTH} caractères, dont une lettre et un chiffre.`}
      />
      <PasswordField
        label="Confirmer le nouveau mot de passe"
        name="confirmPassword"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={errors.confirm}
      />
      <Button type="submit" size="lg" block loading={pending}>
        Enregistrer
      </Button>
      <div aria-live="polite">{serverError && <ServerError error={serverError} />}</div>
    </form>
  );
}
