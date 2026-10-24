"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Badge, Card, LoadingBlock } from "@/components/ui/display";
import { useAuth } from "@/lib/auth/session-store";
import { refreshEntitlements, useEntitlements, type Entitlements } from "@/lib/billing/use-entitlements";
import { withdrawalDeadline, withdrawalOpen } from "@/lib/billing/withdrawal";
import type { BillingMode } from "@/components/billing/subscribe";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const dateTimeFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" });

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  trialing: "Période d’essai",
  past_due: "Paiement en échec : Stripe va réessayer",
  canceled: "Résilié",
  unpaid: "Impayé : accès suspendu",
  incomplete: "Paiement non finalisé",
  expired: "Expiré",
  paused: "En pause",
};

const ERRORS: Record<string, string> = {
  "aucun-abonnement": "Aucun abonnement en cours n’est rattaché à votre compte.",
  "delai-de-retractation-depasse": "Le délai de rétractation est dépassé : vous pouvez résilier votre contrat.",
  "stripe-indisponible": "Le service de paiement ne répond pas : rien n’a été modifié. Réessayez plus tard.",
  "paiement-non-configure": "Le paiement n’est pas configuré : aucun abonnement n’existe.",
  "connexion-requise": "Connectez-vous pour continuer.",
};

async function post(path: string): Promise<{ ok: boolean; body: Record<string, unknown> }> {
  try {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    return { ok: response.ok, body: (await response.json().catch(() => ({}))) as Record<string, unknown> };
  } catch {
    return { ok: false, body: { error: "stripe-indisponible" } };
  }
}

function errorOf(body: Record<string, unknown>): string {
  return ERRORS[String(body.error ?? "")] ?? ERRORS["stripe-indisponible"]!;
}

/** Préalable commun : compte connecté et droits chargés. */
function useAccount(mode: BillingMode) {
  const auth = useAuth();
  const state = useEntitlements();
  if (mode === "inactif") return { kind: "inactif" as const };
  if (auth.status === "local") return { kind: "local" as const };
  if (auth.status === "loading" || state.status === "loading") return { kind: "loading" as const };
  if (auth.status === "signed-out") return { kind: "signed-out" as const };
  if (state.status !== "pret") return { kind: "erreur" as const };
  return { kind: "ready" as const, email: auth.status === "signed-in" ? auth.user.email : "", entitlements: state.entitlements };
}

function Unavailable({ kind, next }: { kind: "inactif" | "local" | "signed-out" | "erreur"; next: string }) {
  if (kind === "signed-out") {
    return (
      <Card>
        <p className="text-sm">Connectez-vous au compte qui a souscrit l’abonnement.</p>
        <ButtonLink href={`/connexion?next=${next}`} className="mt-3">
          Se connecter
        </ButtonLink>
      </Card>
    );
  }
  return (
    <Alert tone="info" role="note" title="Aucun abonnement possible">
      {kind === "inactif"
        ? "Le paiement n’est pas configuré : aucun abonnement n’a pu être souscrit, il n’y a donc rien à gérer."
        : kind === "local"
          ? "Les comptes ne sont pas encore disponibles sur cette version de KODI."
          : "Vos droits n’ont pas pu être lus. Réessayez plus tard."}
    </Alert>
  );
}

const hasContract = (e: Entitlements) => e.status !== null && ["active", "trialing", "past_due"].includes(e.status);

export function SubscriptionPanel({ mode, justPaid }: { mode: BillingMode; justPaid: boolean }) {
  const account = useAccount(mode);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  if (account.kind === "loading") return <LoadingBlock label="Chargement de l’abonnement" />;
  if (account.kind !== "ready") return <Unavailable kind={account.kind} next="/abonnement" />;
  const e = account.entitlements;
  const contract = hasContract(e);
  const startedAt = e.startedAt ? new Date(e.startedAt) : null;

  async function openPortal() {
    setOpening(true);
    setPortalError(null);
    const { ok, body } = await post("/api/paiement/portail");
    if (ok && typeof body.url === "string") {
      window.location.assign(body.url);
      return;
    }
    setPortalError(errorOf(body));
    setOpening(false);
  }

  return (
    <div className="space-y-4">
      {justPaid && !e.premium && (
        <Alert tone="info" role="status" title="Paiement en cours de confirmation">
          Stripe doit encore confirmer le paiement à KODI. Rechargez la page dans quelques instants.
          <Button variant="secondary" className="mt-3" onClick={refreshEntitlements}>
            Actualiser
          </Button>
        </Alert>
      )}
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-bold">Votre offre</h2>
          <Badge tone={e.premium ? "brand" : "neutral"}>{e.premium ? "Premium" : "Gratuite"}</Badge>
          {mode === "test" && <Badge tone="neutral">Mode test : aucun paiement réel</Badge>}
        </div>
        {e.status && <p className="mt-2 text-sm">Statut : {STATUS_LABELS[e.status] ?? e.status}</p>}
        {e.currentPeriodEnd && contract && (
          <p className="mt-1 text-sm">
            {e.cancelAtPeriodEnd ? "Fin de l’abonnement le " : "Prochain renouvellement le "}
            {dateFormat.format(new Date(e.currentPeriodEnd))}.
          </p>
        )}
        {e.status === "past_due" && (
          <p className="mt-2 text-sm font-semibold">
            Le dernier paiement a échoué. Mettez à jour votre moyen de paiement pour garder Premium.
          </p>
        )}
        {!e.premium && !contract && (
          <ButtonLink href="/premium" className="mt-4">
            Découvrir Premium
          </ButtonLink>
        )}
      </Card>

      {contract && (
        <Card className="space-y-3">
          <Button variant="secondary" block loading={opening} onClick={openPortal}>
            Moyen de paiement et factures
          </Button>
          {portalError && (
            <Alert tone="danger" role="alert">
              {portalError}
            </Alert>
          )}
          {!e.cancelAtPeriodEnd && (
            <ButtonLink href="/abonnement/resilier" variant="secondary" block>
              Résilier votre contrat
            </ButtonLink>
          )}
          {withdrawalOpen(startedAt, new Date()) && (
            <ButtonLink href="/abonnement/retractation" variant="ghost" block>
              Renoncer au contrat ici
            </ButtonLink>
          )}
        </Card>
      )}
    </div>
  );
}

/** Résiliation : récapitulatif (2e clic) puis « Notifier la résiliation » (3e clic). */
export function CancelFlow({ mode }: { mode: BillingMode }) {
  const account = useAccount(mode);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ endsAt: string | null; notifiedAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <Alert tone="success" role="status" title="Résiliation enregistrée">
        <p>
          Votre demande a été reçue le {dateTimeFormat.format(new Date(done.notifiedAt))}.{" "}
          {done.endsAt
            ? `Votre contrat prend fin le ${dateFormat.format(new Date(done.endsAt))} : Premium reste actif jusque-là, aucun nouveau paiement ne sera prélevé.`
            : "Aucun nouveau paiement ne sera prélevé."}
        </p>
        <p className="mt-2">Conservez cette page (vous pouvez l’imprimer) comme preuve de votre demande.</p>
      </Alert>
    );
  }
  if (account.kind === "loading") return <LoadingBlock label="Chargement de l’abonnement" />;
  if (account.kind !== "ready") return <Unavailable kind={account.kind} next="/abonnement/resilier" />;
  const e = account.entitlements;

  if (!hasContract(e) || e.cancelAtPeriodEnd) {
    return (
      <Alert tone="info" role="note" title="Rien à résilier">
        {e.cancelAtPeriodEnd
          ? "La résiliation de votre contrat est déjà enregistrée."
          : "Aucun abonnement en cours n’est rattaché à votre compte."}
      </Alert>
    );
  }

  async function notify() {
    setSending(true);
    setError(null);
    const { ok, body } = await post("/api/paiement/resiliation");
    if (ok) {
      setDone({ endsAt: (body.endsAt as string | null) ?? null, notifiedAt: String(body.notifiedAt) });
      refreshEntitlements();
    } else setError(errorOf(body));
    setSending(false);
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-bold">Récapitulatif de la résiliation</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="text-muted">Compte</dt>
            <dd className="font-semibold break-all">{account.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Contrat</dt>
            <dd className="font-semibold">KODI Premium, abonnement mensuel</dd>
          </div>
          <div>
            <dt className="text-muted">Date de fin</dt>
            <dd className="font-semibold">
              {e.currentPeriodEnd
                ? `${dateFormat.format(new Date(e.currentPeriodEnd))} (fin de la période déjà payée)`
                : "fin de la période déjà payée"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Effets</dt>
            <dd>Aucun frais ni préavis. Premium reste actif jusqu’à la date de fin, puis votre compte passe à l’offre gratuite. Vos données de progression sont conservées.</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm">
          Une information à corriger ?{" "}
          <Link href="/profil" className="font-semibold text-brand-text underline underline-offset-2">
            Modifier mon profil
          </Link>
        </p>
      </Card>
      <Button block size="lg" variant="danger" loading={sending} onClick={notify}>
        Notifier la résiliation
      </Button>
      <div aria-live="polite">
        {error && (
          <Alert tone="danger" role="alert" title="Résiliation non enregistrée">
            {error}
          </Alert>
        )}
      </div>
    </div>
  );
}

/** Rétractation : « Renoncer au contrat ici » puis « Confirmer la rétractation ». */
export function WithdrawFlow({ mode }: { mode: BillingMode }) {
  const account = useAccount(mode);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ refundedCents: number; refundFailed: boolean; requestedAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <Alert tone={done.refundFailed ? "danger" : "success"} role="status" title="Rétractation enregistrée">
        <p>
          Votre demande a été reçue le {dateTimeFormat.format(new Date(done.requestedAt))}. Votre abonnement est
          arrêté.
        </p>
        <p className="mt-2">
          {done.refundFailed
            ? "Le remboursement automatique a échoué : il n’a PAS été effectué. Il doit être fait par KODI dans les 14 jours ; contactez KODI si vous ne le recevez pas."
            : done.refundedCents > 0
              ? `Remboursement demandé à Stripe : ${(done.refundedCents / 100).toFixed(2).replace(".", ",")} €. Le délai d’arrivée dépend de votre banque.`
              : "Aucun paiement à rembourser n’a été trouvé."}
        </p>
        <p className="mt-2">Conservez cette page comme preuve de votre demande.</p>
      </Alert>
    );
  }
  if (account.kind === "loading") return <LoadingBlock label="Chargement de l’abonnement" />;
  if (account.kind !== "ready") return <Unavailable kind={account.kind} next="/abonnement/retractation" />;
  const e = account.entitlements;
  const startedAt = e.startedAt ? new Date(e.startedAt) : null;

  if (!hasContract(e) || !withdrawalOpen(startedAt, new Date())) {
    return (
      <Alert tone="info" role="note" title="Rétractation indisponible">
        {hasContract(e)
          ? "Le délai de rétractation est dépassé. Vous pouvez résilier votre contrat à tout moment."
          : "Aucun abonnement en cours n’est rattaché à votre compte."}
      </Alert>
    );
  }

  async function confirm() {
    setSending(true);
    setError(null);
    const { ok, body } = await post("/api/paiement/retractation");
    if (ok) {
      setDone({
        refundedCents: Number(body.refundedCents ?? 0),
        refundFailed: body.refundFailed === true,
        requestedAt: String(body.requestedAt),
      });
      refreshEntitlements();
    } else setError(errorOf(body));
    setSending(false);
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-bold">Renoncer au contrat</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="text-muted">Compte</dt>
            <dd className="font-semibold break-all">{account.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Contrat</dt>
            <dd className="font-semibold">KODI Premium, abonnement mensuel</dd>
          </div>
          {startedAt && (
            <div>
              <dt className="text-muted">Rétractation possible jusqu’au</dt>
              <dd className="font-semibold">
                {dateFormat.format(new Date(withdrawalDeadline(startedAt).getTime() - 1))} inclus
              </dd>
            </div>
          )}
          <div>
            <dt className="text-muted">Effets</dt>
            <dd>Arrêt immédiat de Premium et remboursement intégral du paiement.</dd>
          </div>
        </dl>
      </Card>
      <Button block size="lg" variant="danger" loading={sending} onClick={confirm}>
        <Icon name="refresh" size={18} />
        Confirmer la rétractation
      </Button>
      <div aria-live="polite">
        {error && (
          <Alert tone="danger" role="alert" title="Rétractation non enregistrée">
            {error}
          </Alert>
        )}
      </div>
    </div>
  );
}
