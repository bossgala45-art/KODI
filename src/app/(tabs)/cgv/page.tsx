import type { Metadata } from "next";
import { Alert, PageHeader } from "@/components/ui/display";
import { LEGAL_DOCUMENTS_READY } from "@/content/legal";

export const metadata: Metadata = { title: "Conditions générales de vente" };

/**
 * Les CGV ne peuvent être publiées sans l'identité du vendeur (structure
 * juridique, SIREN, médiateur…), encore inconnue : aucune n'est inventée.
 */
export default function CgvPage() {
  return (
    <>
      <PageHeader title="Conditions générales de vente" />
      {!LEGAL_DOCUMENTS_READY && (
        <Alert tone="info" role="note" title="Document pas encore publié">
          <p>
            Les conditions générales de vente de KODI Premium seront publiées avant toute vente. Aucune vente n’est
            ouverte aujourd’hui : aucun paiement réel ne peut être effectué.
          </p>
          <p className="mt-2">
            Elles préciseront notamment l’identité du vendeur, le prix toutes taxes comprises, la durée de
            l’abonnement et sa résiliation, le droit de rétractation de 14 jours et son formulaire, les garanties
            légales et le médiateur de la consommation.
          </p>
        </Alert>
      )}
    </>
  );
}
