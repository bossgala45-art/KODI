import type { Metadata } from "next";
import { FocusShell } from "@/components/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";

export const metadata: Metadata = { title: "Lien invalide" };

export default function InvalidLinkPage() {
  return (
    <FocusShell backHref="/connexion" backLabel="Connexion">
      <div className="pt-10">
        <EmptyState
          icon="alert"
          headingLevel={1}
          title="Ce lien n’est plus valide"
          action={<ButtonLink href="/mot-de-passe-oublie">Demander un nouveau lien</ButtonLink>}
        >
          Il a peut-être expiré (une heure) ou déjà été utilisé. Si vous venez de
          confirmer votre adresse, essayez simplement de vous connecter.
        </EmptyState>
      </div>
    </FocusShell>
  );
}
