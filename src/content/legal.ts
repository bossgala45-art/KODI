/**
 * Informations légales du vendeur (D-030, docs/PAIEMENTS.md).
 *
 * AUCUNE n'est connue aujourd'hui : le porteur n'a pas encore indiqué de
 * structure juridique (entreprise individuelle, société…). Tant qu'un champ
 * est vide, les documents légaux sont incomplets et le paiement en
 * production est refusé (src/lib/billing/config.ts).
 * Ne jamais inventer ces valeurs.
 */
export interface SellerInfo {
  /** Nom et prénom suivis de « EI », ou dénomination sociale et forme juridique. */
  identity: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  /** SIREN / RCS ou RNE selon l'activité. */
  registration: string | null;
  /** Numéro de TVA intracommunautaire, ou mention d'exonération vérifiée. */
  vat: string | null;
  publicationDirector: string | null;
  /** Médiateur de la consommation : nom et adresse du site. */
  mediator: { name: string; url: string } | null;
  host: { name: string; address: string; phone: string } | null;
}

export const SELLER: SellerInfo = {
  identity: null,
  address: null,
  email: null,
  phone: null,
  registration: null,
  vat: null,
  publicationDirector: null,
  mediator: null,
  host: null,
};

export const MISSING_SELLER_FIELDS: readonly string[] = (Object.entries(SELLER) as [string, unknown][])
  .filter(([, value]) => value === null || value === "")
  .map(([key]) => key);

/** Les CGV et mentions légales ne peuvent être complètes sans ces informations. */
export const LEGAL_DOCUMENTS_READY = MISSING_SELLER_FIELDS.length === 0;
