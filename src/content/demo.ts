/**
 * DONNÉES FICTIVES DE DÉMONSTRATION.
 *
 * Elles servent uniquement à faire fonctionner les écrans tant qu'aucun
 * contenu vérifié n'existe. Les questions portent volontairement sur
 * l'application KODI elle-même, et non sur le code de la route, afin de ne
 * fabriquer aucune règle ni aucune question pouvant passer pour officielle.
 * Tout écran qui les affiche doit porter le badge « Données fictives ».
 */
import type { QuizQuestion } from "@/lib/quiz";

export const DEMO_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "demo-1",
    prompt: "Combien d’onglets compte la barre de navigation de KODI ?",
    choices: [
      { id: "a", label: "Trois" },
      { id: "b", label: "Cinq" },
      { id: "c", label: "Sept" },
    ],
    correct: ["b"],
    explanation:
      "Accueil, Apprendre, Simuler, S’entraîner et Progression : cinq onglets.",
  },
  {
    id: "demo-2",
    prompt: "Quels thèmes d’affichage KODI propose-t-il ?",
    choices: [
      { id: "a", label: "Clair" },
      { id: "b", label: "Sombre" },
      { id: "c", label: "Sépia" },
      { id: "d", label: "Automatique (selon l’appareil)" },
    ],
    correct: ["a", "b", "d"],
    explanation:
      "Clair, sombre ou automatique, à choisir dans Profil et paramètres.",
  },
  {
    id: "demo-3",
    prompt: "Quelle couleur KODI utilise-t-il pour signaler une bonne réponse ?",
    choices: [
      { id: "a", label: "Vert" },
      { id: "b", label: "Rouge" },
      { id: "c", label: "Gris" },
    ],
    correct: ["a"],
    explanation: "Le vert signale une bonne réponse, le rouge une erreur.",
  },
  {
    id: "demo-4",
    prompt: "Où peut-on réduire les animations de l’application ?",
    choices: [
      { id: "a", label: "Dans l’onglet Progression" },
      { id: "b", label: "Dans Profil et paramètres" },
      { id: "c", label: "Ce n’est pas possible" },
    ],
    correct: ["b"],
    explanation:
      "Le réglage « Animations » se trouve dans Profil et paramètres.",
  },
  {
    id: "demo-5",
    prompt: "Que signifie le badge « Données fictives » ?",
    choices: [
      { id: "a", label: "Le contenu affiché est un exemple" },
      { id: "b", label: "Le contenu est officiel" },
      { id: "c", label: "Le contenu est payant" },
    ],
    correct: ["a"],
    explanation:
      "Ce badge indique un contenu d’exemple, sans valeur pédagogique.",
  },
  {
    id: "demo-6",
    prompt: "Dans quel onglet trouve-t-on l’examen blanc ?",
    choices: [
      { id: "a", label: "Apprendre" },
      { id: "b", label: "Simuler" },
      { id: "c", label: "Progression" },
    ],
    correct: ["b"],
    explanation: "L’onglet Simuler propose l’examen blanc.",
  },
  {
    id: "demo-7",
    prompt: "Où sont enregistrés vos résultats pour l’instant ?",
    choices: [
      { id: "a", label: "Sur cet appareil uniquement" },
      { id: "b", label: "Sur un serveur KODI" },
      { id: "c", label: "Nulle part" },
    ],
    correct: ["a"],
    explanation:
      "Sans compte en ligne, les résultats restent dans le navigateur de cet appareil.",
  },
  {
    id: "demo-8",
    prompt: "Que faut-il faire avant de pouvoir valider une réponse ?",
    choices: [
      { id: "a", label: "Sélectionner au moins une proposition" },
      { id: "b", label: "Attendre la fin d’un minuteur" },
      { id: "c", label: "Créer un compte" },
    ],
    correct: ["a"],
    explanation:
      "Le bouton Valider s’active dès qu’une proposition est sélectionnée.",
  },
  {
    id: "demo-9",
    prompt: "Quelles informations l’onglet Progression affiche-t-il ?",
    choices: [
      { id: "a", label: "Le taux de réussite" },
      { id: "b", label: "Les jours d’activité consécutifs" },
      { id: "c", label: "Le classement des autres joueurs" },
    ],
    correct: ["a", "b"],
    explanation:
      "Progression affiche vos propres résultats, sans classement d’autres personnes.",
  },
  {
    id: "demo-10",
    prompt: "Combien de modes d’examen sont prévus dans KODI ?",
    choices: [
      { id: "a", label: "Deux" },
      { id: "b", label: "Quatre" },
      { id: "c", label: "Dix" },
    ],
    correct: ["b"],
    explanation: "Quatre modes d’examen sont prévus dans la spécification.",
  },
];

export const TRAINING_LENGTH = 5;
export const SIMULATION_LENGTH = 10;

export interface DemoUniverse {
  id: string;
  title: string;
  lessons: number;
  /** Progression fictive, entre 0 et 1. */
  progress: number;
}

/** Dix univers d'exemple : noms et chiffres sont inventés. */
export const DEMO_UNIVERSES: readonly DemoUniverse[] = [
  { id: "u1", title: "Univers fictif 1", lessons: 8, progress: 0.75 },
  { id: "u2", title: "Univers fictif 2", lessons: 7, progress: 0.4 },
  { id: "u3", title: "Univers fictif 3", lessons: 7, progress: 0.15 },
  { id: "u4", title: "Univers fictif 4", lessons: 8, progress: 0 },
  { id: "u5", title: "Univers fictif 5", lessons: 6, progress: 0 },
  { id: "u6", title: "Univers fictif 6", lessons: 7, progress: 0 },
  { id: "u7", title: "Univers fictif 7", lessons: 7, progress: 0 },
  { id: "u8", title: "Univers fictif 8", lessons: 8, progress: 0 },
  { id: "u9", title: "Univers fictif 9", lessons: 7, progress: 0 },
  { id: "u10", title: "Univers fictif 10", lessons: 7, progress: 0 },
];
