"use client";

import { useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Card, Skeleton } from "@/components/ui/display";
import { signOut } from "@/lib/auth/actions";
import { useAuth } from "@/lib/auth/session-store";
import type { UserFacingError } from "@/lib/supabase/errors";
import {
  forgetAccountDataOnDevice,
  getSyncStatus,
  subscribeSyncStatus,
  syncNow,
  type SyncStatus,
} from "@/lib/sync/engine";

const timeFormat = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

function describe(status: SyncStatus): { text: string; tone: "ok" | "wait" | "bad" } {
  switch (status.state) {
    case "synced":
      return { text: `Synchronisé à ${timeFormat.format(new Date(status.at))}`, tone: "ok" };
    case "syncing":
      return { text: "Synchronisation…", tone: "wait" };
    case "pending":
      return { text: "Modifications en attente d’envoi", tone: "wait" };
    case "offline":
      return { text: "Hors ligne : vos modifications seront envoyées au retour du réseau", tone: "wait" };
    case "error":
      return { text: "La synchronisation a échoué", tone: "bad" };
    default:
      return { text: "Synchronisation inactive", tone: "wait" };
  }
}

function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribeSyncStatus, getSyncStatus, () => ({ state: "signed-out" }) as SyncStatus);
}

function SignedIn({ email }: { email: string }) {
  const sync = useSyncStatus();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<UserFacingError | null>(null);
  const { text, tone } = describe(sync);

  async function handleSignOut() {
    setPending(true);
    setError(null);
    const result = await signOut();
    setPending(false);
    if (result.ok) forgetAccountDataOnDevice();
    else setError(result.error);
  }

  return (
    <Card>
      <p className="text-sm text-muted">Connecté avec</p>
      <p className="truncate font-semibold">{email}</p>
      <p
        role="status"
        className="mt-3 flex items-center gap-2 text-sm font-medium"
      >
        <span
          aria-hidden="true"
          className={
            tone === "ok"
              ? "size-2.5 rounded-full bg-success"
              : tone === "bad"
                ? "size-2.5 rounded-full bg-danger"
                : "size-2.5 rounded-full bg-brand"
          }
        />
        {text}
      </p>
      <p className="mt-1 text-xs text-muted">
        Profil et réglages d’affichage sont synchronisés entre vos appareils.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => void syncNow()} disabled={sync.state === "syncing"}>
          <Icon name="refresh" size={18} />
          Synchroniser
        </Button>
        <Button variant="secondary" onClick={handleSignOut} loading={pending}>
          Se déconnecter
        </Button>
      </div>
      <div aria-live="polite">{error && <Alert tone="danger" role="alert" className="mt-4">{error.message}</Alert>}</div>
    </Card>
  );
}

export function AccountSection() {
  const auth = useAuth();

  if (auth.status === "loading") return <Skeleton className="h-36" />;
  if (auth.status === "signed-in") return <SignedIn email={auth.user.email} />;

  return (
    <Card>
      <p className="text-sm text-muted">
        {auth.status === "local"
          ? "Mode local : les comptes en ligne ne sont pas encore configurés sur cette version. Vos données restent sur cet appareil."
          : "Créez un compte pour retrouver votre profil et vos réglages sur tous vos appareils."}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <ButtonLink href="/connexion" variant="secondary">
          Connexion
        </ButtonLink>
        <ButtonLink href="/inscription">Inscription</ButtonLink>
      </div>
    </Card>
  );
}
