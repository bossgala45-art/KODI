import type { Metadata } from "next";
import { ReviewCenter } from "@/components/learning";
import { StorageNotice } from "@/components/storage-notice";
import { PageHeader } from "@/components/ui/display";

export const metadata: Metadata = { title: "Révisions" };

export default function ReviewsPage() {
  return (
    <>
      <PageHeader
        title="Révisions"
        description="Votre programme du jour, vos révisions espacées et votre carnet d’erreurs."
      />
      <StorageNotice />
      <ReviewCenter />
    </>
  );
}
