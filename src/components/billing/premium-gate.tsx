"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card, Skeleton } from "@/components/ui/display";
import { isPremium, useEntitlements } from "@/lib/billing/use-entitlements";

/**
 * Contenu réservé à Premium. Les données affichées ici sont calculées sur
 * l'appareil : ce verrou est un choix d'offre, pas une protection de
 * données (les ressources du serveur vérifient elles-mêmes le droit).
 */
export function PremiumGate({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const state = useEntitlements();
  if (state.status === "loading") return <Skeleton className="h-28" />;
  if (isPremium(state)) return <>{children}</>;
  return (
    <Card className="border-dashed">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">
          <Icon name="crown" size={14} />
          Premium
        </Badge>
        <h3 className="font-bold">{title}</h3>
      </div>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <div className="mt-4">
        <ButtonLink href="/premium" variant="secondary">
          Voir l’offre Premium
        </ButtonLink>
      </div>
    </Card>
  );
}
