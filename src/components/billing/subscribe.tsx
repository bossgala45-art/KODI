"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/display";
import { Checkbox } from "@/components/ui/form";
import { useAuth } from "@/lib/auth/session-store";
import { isPremium, useEntitlements } from "@/lib/billing/use-entitlements";

export type BillingMode = "inactif" | "test" | "live";

const ERRORS: Record<string, string> = {
  "deja-abonne": "Vous êtes déjà abonné à Premium.",
  "connexion-requise": "Connectez-vous pour vous abonner.",
  "consentement-requis": "Cochez les deux cases pour continuer.",
  "stripe-indisponible": "Le service de paiement ne répond pas. Aucun paiement n’a été demandé ; réessayez plus tard.",
  "paiement-non-configure": "Le paiement n’est pas disponible : aucun abonnement ne peut être souscrit.",
};

/**
 * Commande de l'abonnement. L'information précontractuelle est affichée
 * au-dessus par la page ; ici : acceptation des CGV, demande d'accès
 * immédiat, puis bouton « Commander avec obligation de paiement » qui ouvre
 * la page de paiement hébergée par Stripe.
 */
export function SubscribeForm({ mode }: { mode: BillingMode }) {
  const auth = useAuth();
  const entitlements = useEntitlements();
  const [cgv, setCgv] = useState(false);
  const [immediate, setImmediate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (mode === "inactif") {
    return (
      <Alert tone="info" role="note" title="Abonnement indisponible">
        Le paiement n’est pas configuré : aucun abonnement ne peut être souscrit et aucun paiement ne vous sera
        demandé.
      </Alert>
    );
  }
  if (auth.status === "local") {
    return (
      <Alert tone="info" role="note" title="Abonnement indisponible">
        Les comptes ne sont pas encore disponibles sur cette version de KODI : un compte est nécessaire pour
        s’abonner.
      </Alert>
    );
  }
  if (auth.status !== "signed-in") {
    return (
      <div className="space-y-3">
        <p className="text-sm">Un compte est nécessaire pour s’abonner : l’abonnement lui est rattaché.</p>
        <ButtonLink href="/connexion?next=/premium" block>
          Se connecter
        </ButtonLink>
      </div>
    );
  }
  if (isPremium(entitlements)) {
    return (
      <Alert tone="success" role="status" title="Vous êtes abonné à Premium">
        <Link href="/abonnement" className="font-semibold underline underline-offset-2">
          Gérer mon abonnement
        </Link>
      </Alert>
    );
  }

  async function order() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/paiement/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cgv: true, accesImmediat: true }),
      });
      const body = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (response.ok && body.url) {
        window.location.assign(body.url);
        return;
      }
      setError(ERRORS[body.error ?? ""] ?? ERRORS["stripe-indisponible"]!);
    } catch {
      setError(ERRORS["stripe-indisponible"]!);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {mode === "test" && (
        <Alert tone="info" role="note" title="Mode test Stripe">
          Aucun paiement réel : seules les cartes de test de Stripe sont acceptées. Un abonnement de test ne donne
          aucun droit en production.
        </Alert>
      )}
      <Checkbox
        checked={cgv}
        onChange={setCgv}
        label={
          <>
            J’ai lu et j’accepte les{" "}
            <Link href="/cgv" className="font-semibold text-brand-text underline underline-offset-2">
              conditions générales de vente
            </Link>
            .
          </>
        }
      />
      <Checkbox
        checked={immediate}
        onChange={setImmediate}
        label="Je demande que mon accès Premium commence dès le paiement. Je garde mon droit de rétractation de 14 jours, avec remboursement intégral."
      />
      <Button block size="lg" disabled={!cgv || !immediate} loading={loading} onClick={order}>
        <Icon name="crown" size={18} />
        Commander avec obligation de paiement
      </Button>
      <p className="text-xs text-muted">
        Vous allez être redirigé vers la page de paiement sécurisée de Stripe, qui affiche le récapitulatif de la
        commande avant validation.
      </p>
      <div aria-live="polite">
        {error && (
          <Alert tone="danger" role="alert" title="Commande non passée">
            {error}
          </Alert>
        )}
      </div>
    </div>
  );
}
