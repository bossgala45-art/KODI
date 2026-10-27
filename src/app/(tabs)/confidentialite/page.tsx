import type { Metadata } from "next";
import Link from "next/link";
import { DraftNotice, LegalSection } from "@/components/legal-draft";
import { PageHeader } from "@/components/ui/display";

export const metadata: Metadata = { title: "Politique de confidentialité" };

const link = "font-semibold text-brand-text underline underline-offset-2";

export default function ConfidentialitePage() {
  return (
    <>
      <PageHeader title="Politique de confidentialité" description="Quelles données KODI utilise, pourquoi, et vos droits." />
      <DraftNotice />

      <LegalSection title="Application personnelle">
        <p>KODI est une application à usage personnel : elle n’est ni vendue, ni proposée au public.</p>
      </LegalSection>

      <LegalSection title="Sans compte : tout reste sur votre appareil">
        <p>
          Votre prénom (facultatif), votre objectif quotidien, vos réponses, votre progression et vos réglages
          d’affichage sont enregistrés dans le stockage de votre navigateur. Ils ne sont envoyés à aucun serveur.
        </p>
      </LegalSection>

      <LegalSection title="Avec un compte">
        <p>
          Pour synchroniser vos appareils, KODI enregistre dans sa base de données (service Supabase) : votre adresse
          e-mail, votre mot de passe (sous forme protégée, géré par le service d’authentification), votre profil, vos
          réglages, votre progression, vos examens et un journal de sécurité (connexions).
        </p>
        <p>Ces données servent uniquement à faire fonctionner votre compte. Elles ne sont ni vendues, ni utilisées pour de la publicité.</p>
      </LegalSection>


      <LegalSection title="Professeur">
        <p>
          Le texte de vos questions n’est pas enregistré. Les e-mails, téléphones, plaques et numéros qu’il contient
          sont retirés avant tout traitement. Aucun service d’intelligence artificielle n’est connecté aujourd’hui ; si
          c’était le cas, le texte ainsi masqué lui serait transmis, et cette page l’indiquerait.
        </p>
      </LegalSection>

      <LegalSection title="Cookies et traceurs">
        <p>
          KODI n’utilise ni mesure d’audience, ni publicité, ni réseau social. Seuls servent le stockage local de
          l’application et, si vous êtes connecté, les cookies de session de votre compte.
        </p>
      </LegalSection>

      <LegalSection title="Durée de conservation">
        <p>
          Les données de votre compte sont conservées tant que le compte existe. À sa suppression, elles sont effacées
          et le journal de sécurité est anonymisé. Les données de l’appareil restent jusqu’à ce que vous les effaciez.
        </p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Depuis{" "}
          <Link href="/profil" className={link}>
            Profil et paramètres
          </Link>{" "}
          : modifier vos informations, télécharger toutes vos données, supprimer votre compte, effacer les données de
          l’appareil. Vous pouvez aussi adresser une réclamation à la Commission nationale de l’informatique et des
          libertés (CNIL).
        </p>
      </LegalSection>
    </>
  );
}
