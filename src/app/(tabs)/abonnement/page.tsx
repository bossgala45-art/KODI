import type { Metadata } from "next";
import { connection } from "next/server";
import { SubscriptionPanel } from "@/components/billing/subscription";
import { PageHeader } from "@/components/ui/display";
import { billingStatus } from "@/lib/billing/server";

export const metadata: Metadata = { title: "Mon abonnement" };

export default async function AbonnementPage({ searchParams }: PageProps<"/abonnement">) {
  await connection();
  const { paiement } = await searchParams;
  return (
    <>
      <PageHeader title="Mon abonnement" description="Votre offre, vos paiements, la résiliation et la rétractation." />
      <SubscriptionPanel mode={billingStatus().mode} justPaid={paiement === "termine"} />
    </>
  );
}
