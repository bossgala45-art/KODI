import type { ReactNode } from "react";
import { Alert, Badge } from "@/components/ui/display";

/** Section d'un document légal. */
export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="font-bold">{title}</h2>
      <div className="mt-2 space-y-2 text-sm">{children}</div>
    </section>
  );
}

/** Bandeau des documents encore à valider (aucune information inventée). */
export function DraftNotice() {
  return (
    <Alert tone="info" role="note" title="Projet de document">
      <Badge tone="neutral">Non validé juridiquement</Badge>
      <p className="mt-2">
        Ce texte décrit fidèlement le fonctionnement actuel de KODI, qui n’est pas encore publié. Il sera complété
        (identité et coordonnées du responsable) et relu avant la mise en ligne.
      </p>
    </Alert>
  );
}
