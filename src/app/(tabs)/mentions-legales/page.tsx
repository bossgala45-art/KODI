import type { Metadata } from "next";
import { Alert, PageHeader } from "@/components/ui/display";
import { LEGAL_DOCUMENTS_READY } from "@/content/legal";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHeader title="Mentions légales" />
      {!LEGAL_DOCUMENTS_READY && (
        <Alert tone="info" role="note" title="Document pas encore publié">
          KODI est en développement et n’est pas encore publié. Les mentions légales (éditeur, directeur de la
          publication, hébergeur, numéro d’immatriculation) seront publiées avant la mise en ligne publique.
        </Alert>
      )}
    </>
  );
}
