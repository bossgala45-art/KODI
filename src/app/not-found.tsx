import type { Metadata } from "next";
import { FocusShell } from "@/components/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";

export const metadata: Metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <FocusShell>
      <div className="pt-10">
        <EmptyState
          icon="flag"
          headingLevel={1}
          title="Page introuvable"
          action={<ButtonLink href="/">Retour à l’accueil</ButtonLink>}
        >
          L’adresse demandée n’existe pas ou a été déplacée.
        </EmptyState>
      </div>
    </FocusShell>
  );
}
