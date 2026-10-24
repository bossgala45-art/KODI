/**
 * Programme des 20 scènes de simulation (spécification §4.4).
 *
 * Proposée par l'agent (aucune liste n'existait), retenue par validation
 * déléguée du porteur le 24/10/2026.
 * Seule la scène 1 est produite. Les autres sont des intentions (titre,
 * univers, briques nécessaires) : aucune règle n'y est encore rédigée, et
 * chacune devra être sourcée puis relue avant d'être produite.
 */
import type { ActorKind } from "@/lib/simulation/scene";
import type { Layout } from "@/lib/simulation/layout";

export type PlannedLayout = Layout["kind"] | "passage-a-niveau" | "tunnel" | "voie-rapide" | "stationnement";

export interface PlannedScene {
  slug: string;
  title: string;
  universeId: string;
  /** Produite (dans SCENES) ou seulement prévue. */
  available: boolean;
  layout: PlannedLayout;
  actors: readonly ActorKind[];
  /** Besoins non couverts par les briques actuelles. */
  missing?: readonly string[];
}

/**
 * Scènes « de découverte », incluses dans l'offre gratuite (D-030) ; les
 * autres sont réservées à Premium. Proposition de l'agent, à confirmer par
 * le porteur.
 */
export const DISCOVERY_SCENES: ReadonlySet<string> = new Set(["intersection-sans-signalisation"]);

export function sceneAccess(slug: string): "decouverte" | "premium" {
  return DISCOVERY_SCENES.has(slug) ? "decouverte" : "premium";
}

export const SCENE_PLAN: readonly PlannedScene[] = [
  { slug: "intersection-sans-signalisation", title: "Intersection sans signalisation", universeId: "u04", available: true, layout: "carrefour", actors: ["voiture"] },
  { slug: "intersection-stop", title: "Intersection avec panneau stop", universeId: "u04", available: false, layout: "carrefour", actors: ["voiture"], missing: ["panneau stop et ligne d’arrêt, à vérifier sur une source officielle"] },
  { slug: "vehicule-prioritaire", title: "Laisser passer un véhicule prioritaire en intervention", universeId: "u04", available: false, layout: "carrefour", actors: ["voiture", "utilitaire"], missing: ["gyrophare et sirène"] },
  { slug: "tourner-a-gauche", title: "Tourner à gauche à une intersection", universeId: "u04", available: false, layout: "carrefour", actors: ["voiture"], missing: ["trajectoires courbes (virage)"] },
  { slug: "creneau", title: "Se garer le long du trottoir", universeId: "u01", available: false, layout: "stationnement", actors: ["voiture"], missing: ["places de stationnement", "marche arrière"] },
  { slug: "portiere", title: "Ouvrir sa portière en sécurité", universeId: "u01", available: false, layout: "ligne-droite", actors: ["voiture", "velo"], missing: ["portière animée"] },
  { slug: "croisement-route-etroite", title: "Croiser un véhicule sur une route étroite", universeId: "u02", available: false, layout: "ligne-droite", actors: ["voiture", "utilitaire"] },
  { slug: "depasser-cycliste", title: "Dépasser un cycliste", universeId: "u02", available: false, layout: "ligne-droite", actors: ["voiture", "velo"] },
  { slug: "anticiper-ralentissement", title: "Anticiper un ralentissement", universeId: "u03", available: false, layout: "ligne-droite", actors: ["voiture"] },
  { slug: "insertion-voie-rapide", title: "S’insérer sur une voie rapide", universeId: "u05", available: false, layout: "voie-rapide", actors: ["voiture", "utilitaire"], missing: ["voie d’accélération"] },
  { slug: "entree-agglomeration", title: "Adapter sa vitesse en entrant en agglomération", universeId: "u05", available: false, layout: "ligne-droite", actors: ["voiture"], missing: ["panneau d’entrée d’agglomération, à vérifier"] },
  { slug: "marquages-au-sol", title: "Lire les marquages au sol", universeId: "u06", available: false, layout: "ligne-droite", actors: ["voiture"], missing: ["marquages réglementaires, à vérifier"] },
  { slug: "passage-a-niveau", title: "Franchir un passage à niveau", universeId: "u07", available: false, layout: "passage-a-niveau", actors: ["voiture"], missing: ["voie ferrée, barrières et feux, à vérifier", "train"] },
  { slug: "tunnel", title: "Circuler dans un tunnel", universeId: "u07", available: false, layout: "tunnel", actors: ["voiture", "utilitaire"], missing: ["tunnel et éclairage"] },
  { slug: "conduite-de-nuit", title: "Utiliser ses feux la nuit", universeId: "u08", available: false, layout: "ligne-droite", actors: ["voiture"], missing: ["éclairage nocturne et phares"] },
  { slug: "pluie-brouillard", title: "Conduire sous la pluie ou dans le brouillard", universeId: "u08", available: false, layout: "ligne-droite", actors: ["voiture"], missing: ["effets de pluie et de brouillard"] },
  { slug: "pieton-passage", title: "Céder le passage à un piéton", universeId: "u09", available: false, layout: "carrefour-en-t", actors: ["voiture", "pieton"], missing: ["passage piéton, à vérifier"] },
  { slug: "zone-de-rencontre", title: "Circuler en zone de rencontre", universeId: "u09", available: false, layout: "ligne-droite", actors: ["voiture", "pieton", "velo"], missing: ["signalisation de zone, à vérifier"] },
  { slug: "panne-gilet-triangle", title: "Panne au bord de la route : gilet et triangle", universeId: "u10", available: false, layout: "ligne-droite", actors: ["voiture", "pieton"], missing: ["triangle de présignalisation et gilet"] },
  { slug: "distraction-telephone", title: "Rester attentif : le téléphone au volant", universeId: "u10", available: false, layout: "carrefour-en-t", actors: ["voiture", "pieton"] },
];
