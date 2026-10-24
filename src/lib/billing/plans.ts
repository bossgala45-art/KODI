/**
 * Offres de KODI (prompt « freemium », D-030). Données partagées par le
 * serveur et l'interface ; les droits eux-mêmes sont décidés côté serveur
 * (private.has_premium dans la base).
 */

export const FEATURES = [
  "cours-essentiels",
  "cours-complets",
  "quiz",
  "corrections",
  "examens",
  "scenes-decouverte",
  "scenes-toutes",
  "statistiques-avancees",
  "coach-basique",
  "coach-etendu",
  "professeur-ia",
] as const;
export type Feature = (typeof FEATURES)[number];

export type Plan = "free" | "premium";

export interface PlanFeature {
  feature: Feature;
  label: string;
  free: string | false;
  premium: string;
  /** Comment le droit est contrôlé (affiché dans la documentation). */
  control: "serveur" | "appareil";
}

export const FREE_DAILY_EXAMS = 1;

/** Prix ENVISAGÉ, à confirmer avant commercialisation : jamais présenté comme une offre ferme. */
export const ENVISAGED_PRICE = { amountCents: 499, currency: "EUR", interval: "mois", confirmed: false } as const;

export function formatPrice(amountCents: number): string {
  return `${(amountCents / 100).toFixed(2).replace(".", ",")} €`;
}

export const PLAN_FEATURES: readonly PlanFeature[] = [
  {
    feature: "cours-essentiels",
    label: "Cours",
    free: "Cours essentiels",
    premium: "Tous les cours",
    control: "serveur",
  },
  { feature: "quiz", label: "Quiz et entraînement", free: "Inclus", premium: "Inclus", control: "appareil" },
  { feature: "corrections", label: "Corrections détaillées", free: "Incluses", premium: "Incluses", control: "appareil" },
  {
    feature: "examens",
    label: "Examens blancs",
    free: `${FREE_DAILY_EXAMS} par jour`,
    premium: "Illimités",
    control: "serveur",
  },
  {
    feature: "scenes-decouverte",
    label: "Scènes 3D",
    free: "Scènes de découverte",
    premium: "Toutes les scènes",
    control: "appareil",
  },
  {
    feature: "statistiques-avancees",
    label: "Statistiques",
    free: "Essentielles",
    premium: "Avancées (par mode, sessions détaillées)",
    control: "appareil",
  },
  {
    feature: "coach-basique",
    label: "Coach pédagogique",
    free: "Basique",
    premium: "Étendu (révisions sur 7 jours, suivi des examens)",
    control: "appareil",
  },
  {
    feature: "professeur-ia",
    label: "Professeur IA",
    free: false,
    premium: "Selon les quotas disponibles",
    control: "serveur",
  },
];

const PREMIUM_ONLY: ReadonlySet<Feature> = new Set([
  "cours-complets",
  "scenes-toutes",
  "statistiques-avancees",
  "coach-etendu",
  "professeur-ia",
]);

export function hasFeature(plan: Plan, feature: Feature): boolean {
  return plan === "premium" || !PREMIUM_ONLY.has(feature);
}
