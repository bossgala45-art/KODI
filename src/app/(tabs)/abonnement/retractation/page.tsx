import type { Metadata } from "next";
import { connection } from "next/server";
import { WithdrawFlow } from "@/components/billing/subscription";
import { PageHeader } from "@/components/ui/display";
import { billingStatus } from "@/lib/billing/server";

export const metadata: Metadata = { title: "Renoncer au contrat" };

export default async function RetractationPage() {
  await connection();
  return (
    <>
      <PageHeader
        title="Renoncer au contrat"
        description="Dans les 14 jours suivant l’abonnement : arrêt immédiat et remboursement intégral."
      />
      <WithdrawFlow mode={billingStatus().mode} />
    </>
  );
}
