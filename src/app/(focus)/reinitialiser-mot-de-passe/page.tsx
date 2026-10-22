import type { Metadata } from "next";
import { FocusShell } from "@/components/app-shell";
import { ResetPasswordForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default function ResetPasswordPage() {
  return (
    <FocusShell backHref="/profil" backLabel="Profil">
      <div className="pb-6 pt-4 animate-enter">
        <h1 className="text-3xl font-bold tracking-tight">Nouveau mot de passe</h1>
        <p className="mt-2 text-muted">Choisissez votre nouveau mot de passe.</p>
      </div>
      <ResetPasswordForm />
    </FocusShell>
  );
}
