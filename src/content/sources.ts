/**
 * Sources officielles réellement consultées pour rédiger les questions.
 * Chaque entrée correspond à une page lue intégralement à la date indiquée.
 * Les articles listés sont ceux que la page cite elle-même : ils n'ont pas
 * été relus sur Légifrance (inaccessible depuis l'environnement de
 * développement), d'où la mention « cités par la page ».
 */
export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  /** Date de consultation, format AAAA-MM-JJ. */
  consultedAt: string;
  citedArticles?: readonly string[];
}

const SR = "Sécurité routière (securite-routiere.gouv.fr)";
const SR_URL = "https://www.securite-routiere.gouv.fr/";
const CONSULTED = "2026-10-22";

function sr(id: string, title: string, path: string, citedArticles?: string[]): Source {
  return { id, title, publisher: SR, url: SR_URL + path, consultedAt: CONSULTED, citedArticles };
}

export const SOURCES = {
  examen: {
    id: "examen",
    title: "Permis de conduire : comment passer le code (épreuve théorique générale) ?",
    publisher: "Service-Public.gouv.fr (DILA)",
    url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F33694",
    consultedAt: CONSULTED,
    citedArticles: ["R221-3-1 à R221-3-3"],
  },
  priorites: sr("priorites", "Intersections et priorités", "reglementation-liee-la-route/intersections-et-priorites", [
    "R415-1",
    "R415-2",
    "R415-5",
    "R415-12",
    "R311-1",
    "R433-17",
  ]),
  depassement: sr("depassement", "Croisement et dépassement", "reglementation-liee-la-route/croisement-et-depassement", [
    "R414-1 à R414-3",
    "R414-4 à R414-17",
    "R414-6",
    "R414-9",
    "R414-12",
    "R416-6",
  ]),
  autoroute: sr("autoroute", "Autoroute", "reglementation-liee-la-route/autoroute"),
  vitesse: sr("vitesse", "Réglementation de la vitesse au volant", "reglementation-liee-aux-risques/reglementation-de-la-vitesse-au-volant"),
  alcool: sr("alcool", "Réglementation de l’alcool au volant", "reglementation-liee-aux-risques/reglementation-de-lalcool-au-volant"),
  telephone: sr("telephone", "Réglementation du téléphone au volant", "reglementation-liee-aux-risques/reglementation-du-telephone-au-volant", [
    "R412-6-1",
  ]),
  drogue: sr("drogue", "Réglementation de la drogue au volant", "reglementation-liee-aux-risques/reglementation-de-la-drogue-au-volant"),
  ceinture: sr("ceinture", "Réglementation du port de la ceinture", "reglementation-liee-aux-modes-de-deplacements/en-voiture/reglementation-du-port-de-la-ceinture", [
    "R412-2",
    "R411-23-1",
  ]),
  equipements: sr("equipements", "Équipements obligatoires en voiture", "reglementation-liee-aux-modes-de-deplacements/en-voiture/equipements-obligatoires-en-voiture"),
  accident: sr("accident", "Accident de la route", "chaque-situation-sa-conduite/accident-de-la-route"),
  panne: sr("panne", "Véhicule en panne : conseils pratiques", "chaque-situation-sa-conduite/vehicule-en-panne-conseils-pratiques"),
  passageNiveau: sr("passageNiveau", "Passage à niveau", "chaque-situation-sa-conduite/conduire-sur-routes-specifiques/passage-niveau", [
    "R422-3",
    "R412-30",
  ]),
  tunnel: sr("tunnel", "Conduire dans un tunnel", "chaque-situation-sa-conduite/conduire-sur-routes-specifiques/conduire-dans-un-tunnel"),
  brouillard: sr("brouillard", "Conduire par temps de brouillard", "chaque-situation-sa-conduite/conduire-selon-la-meteo/conduire-par-temps-de-brouillard"),
  eco: sr("eco", "Éco-conduite en voiture", "chacun-son-mode-de-deplacement/dangers-de-la-route-en-voiture/mieux-conduire-en-voiture/eco"),
  codeRue: sr("codeRue", "Le code de la rue", "reglementation-liee-la-route/le-code-de-la-rue"),
  stationnement: sr("stationnement", "Arrêt et stationnement", "reglementation-liee-la-route/arret-et-stationnement"),
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;

export function formatConsultedAt(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}
