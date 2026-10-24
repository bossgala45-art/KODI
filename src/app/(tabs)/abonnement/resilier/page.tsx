import type { Metadata } from "next";
import { connection } from "next/server";
import { CancelFlow } from "@/components/billing/subscription";
import { PageHeader } from "@/components/ui/display";
import { billingStatus } from "@/lib/billing/server";

export const metadata: Metadata = { title: "Résilier votre contrat" };

export default async function ResilierPage() {
  await connection();
  return (
    <>
      <PageHeader
        title="Résilier votre contrat"
        description="Vérifiez le récapitulatif, puis notifiez la résiliation. Sans frais ni préavis."
      />
      <CancelFlow mode={billingStatus().mode} />
    </>
  );
}
