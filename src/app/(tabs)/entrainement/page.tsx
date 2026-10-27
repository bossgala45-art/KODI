import type { Metadata } from "next";
import { TrainingCenter } from "@/components/training-center";
import { PageHeader } from "@/components/ui/display";
import { REVISION_BANK, REVISION_SERIES_LENGTH, REVISION_THEMES } from "@/content/revision";

export const metadata: Metadata = { title: "S’entraîner" };

export default function TrainingPage() {
  return (
    <>
      <PageHeader
        title="S’entraîner"
        description="Répondez à votre rythme : la correction s’affiche après chaque question."
      />
      <TrainingCenter bank={REVISION_BANK} themes={REVISION_THEMES} length={REVISION_SERIES_LENGTH} />
    </>
  );
}
