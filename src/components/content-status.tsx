import { Badge } from "@/components/ui/display";
import { cn } from "@/lib/cn";
import type { ContentStatus } from "@/lib/content/schema";

/**
 * Statut éditorial d'un contenu. Une démonstration est toujours signalée
 * comme non validée ; un contenu « à vérifier » n'a pas encore été relu.
 */
export function StatusBadge({
  status,
  demo = false,
  className,
}: {
  status: ContentStatus;
  demo?: boolean;
  className?: string;
}) {
  if (demo) {
    return (
      <Badge tone="neutral" className={cn("border border-dashed border-line-strong", className)}>
        Démonstration · non validé
      </Badge>
    );
  }
  switch (status) {
    case "valide":
      return (
        <Badge tone="success" className={className}>
          Validé
        </Badge>
      );
    case "a-verifier":
      return (
        <Badge tone="brand" className={className}>
          À vérifier
        </Badge>
      );
    case "brouillon":
      return (
        <Badge tone="neutral" className={className}>
          Brouillon · non validé
        </Badge>
      );
    case "retire":
      return (
        <Badge tone="danger" className={className}>
          Retiré
        </Badge>
      );
  }
}
