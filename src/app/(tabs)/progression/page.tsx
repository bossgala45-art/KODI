import type { Metadata } from "next";
import { ProgressDashboard } from "@/components/progress-dashboard";
import { PageHeader } from "@/components/ui/display";

export const metadata: Metadata = { title: "Progression" };

export default function ProgressPage() {
  return (
    <>
      <PageHeader
        title="Progression"
        description="Vos résultats, enregistrés uniquement sur cet appareil."
      />
      <ProgressDashboard />
    </>
  );
}
