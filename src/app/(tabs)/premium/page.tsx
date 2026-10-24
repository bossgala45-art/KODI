import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { SubscribeForm } from "@/components/billing/subscribe";
import { Icon } from "@/components/icons";
import { Alert, Badge, Card, PageHeader, SectionTitle } from "@/components/ui/display";
import { ENVISAGED_PRICE, PLAN_FEATURES, formatPrice } from "@/lib/billing/plans";
import { billingStatus } from "@/lib/billing/server";

export const metadata: Metadata = { title: "Premium" };

export default async function PremiumPage({ searchParams }: PageProps<"/premium">) {
  // L'état du paiement dépend de la configuration du serveur, lue à chaque demande.
  await connection();
  const status = billingStatus();
  const { paiement } = await searchParams;
  const price = formatPrice(ENVISAGED_PRICE.amountCents);

  return (
    <>
      <PageHeader title="KODI Premium" description="L’offre gratuite pour apprendre, Premium pour aller plus loin." />

      {status.mode === "inactif" && (
        <Alert tone="info" role="note" className="mb-6" title="Paiement non disponible">
          Le paiement n’est pas encore configuré : aucun abonnement ne peut être souscrit et aucun paiement ne vous
          sera demandé. Toutes les fonctionnalités de l’offre gratuite restent disponibles.
        </Alert>
      )}
      {status.mode === "test" && (
        <Alert tone="info" role="note" className="mb-6" title="Mode test Stripe">
          Les paiements de cette version sont des paiements de test : aucune somme réelle n’est prélevée.
        </Alert>
      )}
      {paiement === "annule" && (
        <Alert tone="info" role="status" className="mb-6" title="Paiement annulé">
          Vous avez quitté la page de paiement : aucune somme n’a été prélevée.
        </Alert>
      )}

      <section aria-labelledby="comparatif">
        <SectionTitle id="comparatif">Gratuit ou Premium</SectionTitle>
        <div className="overflow-hidden rounded-3xl border border-line bg-surface">
          <table className="w-full table-fixed text-left text-sm">
            <caption className="sr-only">Fonctionnalités de l’offre gratuite et de l’offre Premium</caption>
            <thead className="bg-surface-2">
              <tr>
                <th scope="col" className="w-2/5 px-3 py-3 font-semibold">
                  Fonctionnalité
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Gratuit
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {PLAN_FEATURES.map((f) => (
                <tr key={f.feature}>
                  <th scope="row" className="px-3 py-3 align-top font-medium wrap-break-word">
                    {f.label}
                  </th>
                  <td className="px-3 py-3 align-top wrap-break-word">
                    {f.free === false ? <span className="text-muted">Non inclus</span> : f.free}
                  </td>
                  <td className="px-3 py-3 align-top wrap-break-word">{f.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">
          Le professeur IA n’est pas encore connecté à un service d’IA : il fonctionne aujourd’hui sans IA générative,
          pour tout le monde.
        </p>
      </section>

      <section aria-labelledby="prix" className="mt-8">
        <SectionTitle id="prix">Prix</SectionTitle>
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-3xl font-extrabold">
              {price}
              <span className="text-base font-semibold"> TTC par mois</span>
            </p>
            {!ENVISAGED_PRICE.confirmed && <Badge tone="neutral">Prix envisagé, à confirmer</Badge>}
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex gap-2">
              <Icon name="check" size={18} className="shrink-0 text-success-text" />
              Abonnement mensuel sans engagement, renouvelé chaque mois jusqu’à résiliation.
            </li>
            <li className="flex gap-2">
              <Icon name="check" size={18} className="shrink-0 text-success-text" />
              Résiliation à tout moment en 3 clics depuis{" "}
              <Link href="/abonnement" className="font-semibold text-brand-text underline underline-offset-2">
                Mon abonnement
              </Link>
              , effective à la fin du mois payé.
            </li>
            <li className="flex gap-2">
              <Icon name="check" size={18} className="shrink-0 text-success-text" />
              Droit de rétractation de 14 jours avec remboursement intégral, depuis « Renoncer au contrat ici » dans
              Mon abonnement.
            </li>
          </ul>
        </Card>
      </section>

      <section aria-labelledby="souscrire" className="mt-8">
        <SectionTitle id="souscrire">S’abonner</SectionTitle>
        <SubscribeForm mode={status.mode} />
        <p className="mt-4 text-xs text-muted">
          <Link href="/cgv" className="underline underline-offset-2">
            Conditions générales de vente
          </Link>{" "}
          ·{" "}
          <Link href="/mentions-legales" className="underline underline-offset-2">
            Mentions légales
          </Link>
        </p>
      </section>
    </>
  );
}
