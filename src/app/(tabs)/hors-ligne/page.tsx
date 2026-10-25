import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";

export const metadata: Metadata = { title: "Hors ligne" };

/** Affichée par le service worker quand une page jamais consultée est demandée sans réseau. */
export default function HorsLignePage() {
  return (
    <EmptyState
      icon="info"
      title="Vous êtes hors ligne"
      headingLevel={1}
      action={<ButtonLink href="/">Retour à l’accueil</ButtonLink>}
    >
      Cette page n’a pas encore été consultée sur cet appareil, elle n’est donc pas disponible sans réseau. Les pages
      déjà ouvertes, vos leçons et votre progression enregistrée sur l’appareil restent accessibles.
    </EmptyState>
  );
}
