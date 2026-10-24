import type { Metadata } from "next";
import { CoachDashboard } from "@/components/coach";
import { StorageNotice } from "@/components/storage-notice";
import { PageHeader } from "@/components/ui/display";

export const metadata: Metadata = { title: "Coach" };

export default function CoachPage() {
  return (
    <>
      <PageHeader
        title="Coach"
        description="Vos points faibles, la suite conseillée et vos récompenses, calculés par des règles fixes à partir de vos réponses."
      />
      <StorageNotice />
      <CoachDashboard />
    </>
  );
}
