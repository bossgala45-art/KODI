import type { Metadata } from "next";
import { FocusShell } from "@/components/app-shell";
import { SignupForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Inscription" };

export default function SignupPage() {
  return (
    <FocusShell backHref="/profil" backLabel="Profil">
      <div className="pb-6 pt-4 animate-enter">
        <h1 className="text-3xl font-bold tracking-tight">Créer un compte</h1>
        <p className="mt-2 text-muted">
          Un compte servira à synchroniser votre progression entre vos appareils.
        </p>
      </div>
      <SignupForm />
    </FocusShell>
  );
}
