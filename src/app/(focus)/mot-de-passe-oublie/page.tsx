import type { Metadata } from "next";
import { FocusShell } from "@/components/app-shell";
import { ForgotPasswordForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <FocusShell backHref="/connexion" backLabel="Connexion">
      <div className="pb-6 pt-4 animate-enter">
        <h1 className="text-3xl font-bold tracking-tight">Mot de passe oublié</h1>
        <p className="mt-2 text-muted">
          Indiquez votre adresse : vous recevrez un lien pour choisir un nouveau mot de passe.
        </p>
      </div>
      <ForgotPasswordForm />
    </FocusShell>
  );
}
