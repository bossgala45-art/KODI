import type { Metadata } from "next";
import Link from "next/link";
import { DraftNotice, LegalSection } from "@/components/legal-draft";
import { PageHeader } from "@/components/ui/display";

export const metadata: Metadata = { title: "Conditions d’utilisation" };

const link = "font-semibold text-brand-text underline underline-offset-2";

export default function ConditionsPage() {
  return (
    <>
      <PageHeader title="Conditions d’utilisation" description="Les règles d’usage de KODI." />
      <DraftNotice />

      <LegalSection title="Objet">
        <p>KODI aide à se préparer à l’épreuve théorique générale du permis de conduire (code de la route).</p>
      </LegalSection>

      <LegalSection title="Ce que KODI n’est pas">
        <p>
          KODI n’est ni un service officiel ni une auto-école. Ses questions sont rédigées pour KODI : elles ne
          proviennent pas de la banque officielle de l’examen. Chaque contenu affiche son statut de relecture ; seuls les
          contenus « validés » ont été relus. Les sources officielles citées font foi.
        </p>
      </LegalSection>

      <LegalSection title="Compte">
        <p>
          L’application s’utilise sans compte. Un compte, facultatif, permet de synchroniser plusieurs appareils. Vous
          êtes responsable de la confidentialité de votre mot de passe. Vous pouvez supprimer votre compte à tout moment
          depuis{" "}
          <Link href="/profil" className={link}>
            Profil et paramètres
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Offre Premium">
        <p>
          L’offre Premium, payante, est régie par les{" "}
          <Link href="/cgv" className={link}>
            conditions générales de vente
          </Link>
          . Aucune vente n’est ouverte aujourd’hui.
        </p>
      </LegalSection>

      <LegalSection title="Usage loyal">
        <p>
          Il est interdit de tenter de contourner les protections de KODI, d’accéder aux données d’autres personnes ou
          de perturber le service.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Voir la{" "}
          <Link href="/confidentialite" className={link}>
            politique de confidentialité
          </Link>
          .
        </p>
      </LegalSection>
    </>
  );
}
