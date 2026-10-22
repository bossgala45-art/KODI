"use client";

import { Alert } from "@/components/ui/display";
import { isStorageAvailable } from "@/lib/local-store";
import { useHydrated } from "@/lib/use-store";

/** Avertit si le navigateur refuse l'enregistrement local (navigation privée stricte…). */
export function StorageNotice() {
  const hydrated = useHydrated();
  if (!hydrated || isStorageAvailable()) return null;
  return (
    <Alert tone="danger" role="alert" title="Enregistrement impossible sur cet appareil" className="mb-4">
      Votre navigateur bloque le stockage local. Vos réglages et résultats
      fonctionneront pendant cette visite mais ne seront pas conservés.
    </Alert>
  );
}
