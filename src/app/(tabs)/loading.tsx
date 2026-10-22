import { LoadingBlock, Skeleton } from "@/components/ui/display";

export default function Loading() {
  return (
    <div className="pt-2">
      <Skeleton className="mb-6 h-9 w-48" />
      <LoadingBlock label="Chargement de la page…" lines={4} />
    </div>
  );
}
