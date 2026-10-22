import type { Metadata } from "next";
import { FocusShell } from "@/components/app-shell";
import { LoginForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <FocusShell backHref="/profil" backLabel="Profil">
      <div className="pb-6 pt-4 animate-enter">
        <h1 className="text-3xl font-bold tracking-tight">Connexion</h1>
        <p className="mt-2 text-muted">
          Retrouvez votre progression sur tous vos appareils.
        </p>
      </div>
      <LoginForm />
    </FocusShell>
  );
}
