import { Icon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";

/** Message d'erreur générique avec possibilité de réessayer. */
export function ErrorPanel({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-3xl bg-danger-soft px-6 py-10 text-center animate-enter"
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-danger text-on-status">
        <Icon name="alert" size={26} />
      </span>
      <h1 className="mt-4 text-xl font-bold">Un problème est survenu</h1>
      <p className="mt-2 max-w-sm text-sm">
        Cette page n’a pas pu s’afficher. Vos données enregistrées sur cet
        appareil ne sont pas affectées.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button onClick={onRetry}>
          <Icon name="refresh" size={18} />
          Réessayer
        </Button>
        <ButtonLink href="/" variant="secondary">
          Retour à l’accueil
        </ButtonLink>
      </div>
    </div>
  );
}
