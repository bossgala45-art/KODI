"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/display";

export function PremiumCta() {
  const [requested, setRequested] = useState(false);
  return (
    <div>
      <Button size="lg" block onClick={() => setRequested(true)}>
        <Icon name="crown" size={18} />
        Passer à Premium
      </Button>
      <div aria-live="polite">
        {requested && (
          <Alert tone="info" title="Premium n’est pas encore disponible" className="mt-4">
            Aucun paiement n’est possible pendant le développement et aucune
            information n’a été enregistrée. L’offre sera définie avant le
            lancement.
          </Alert>
        )}
      </div>
    </div>
  );
}
