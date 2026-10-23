import type { Metadata } from "next";
import { ProgressDashboard } from "@/components/progress-dashboard";
import { MasteryOverview } from "@/components/learning";
import { PageHeader, SectionTitle } from "@/components/ui/display";

export const metadata: Metadata = { title: "Progression" };

export default function ProgressPage() {
  return (
    <>
      <PageHeader
        title="Progression"
        description="Vos résultats, enregistrés uniquement sur cet appareil."
      />
      <ProgressDashboard />
      <section aria-labelledby="maitrise" className="mt-10">
        <SectionTitle id="maitrise">Maîtrise par compétence</SectionTitle>
        <MasteryOverview />
      </section>
    </>
  );
}
