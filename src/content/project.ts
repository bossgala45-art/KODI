/**
 * État réel du projet affiché sur la page d'accueil.
 * Toute modification de statut doit refléter docs/ROADMAP.md : on n'annonce
 * « disponible » que ce qui fonctionne réellement en production.
 */

export type FeatureStatus = "available" | "planned";

export interface Feature {
  title: string;
  description: string;
  target: string;
  status: FeatureStatus;
}

export type PhaseStatus = "done" | "in-progress" | "todo";

export interface Phase {
  id: number;
  title: string;
  status: PhaseStatus;
}

export const features: readonly Feature[] = [
  {
    title: "Univers thématiques",
    description: "Le programme découpé en grands thèmes, du plus simple au plus exigeant.",
    target: "10 univers",
    status: "planned",
  },
  {
    title: "Leçons guidées",
    description: "Des explications courtes, illustrées et reliées aux règles applicables.",
    target: "72 leçons",
    status: "planned",
  },
  {
    title: "Questions vérifiées",
    description: "Des questions originales, chacune relue et rattachée à une source citée.",
    target: "Objectif 2 000",
    status: "planned",
  },
  {
    title: "Modes d’examen",
    description: "Des formats d’entraînement variés, jusqu’à la mise en condition réelle.",
    target: "4 modes",
    status: "planned",
  },
  {
    title: "Scènes 3D",
    description: "Des situations de conduite à observer sous plusieurs angles de caméra.",
    target: "20 scènes · 4 caméras",
    status: "planned",
  },
  {
    title: "Révision adaptative",
    description: "Les questions reviennent au bon moment selon vos points faibles.",
    target: "Moteur adaptatif",
    status: "planned",
  },
  {
    title: "Coach",
    description: "Un accompagnement qui explique vos erreurs et propose la suite.",
    target: "Coach IA",
    status: "planned",
  },
  {
    title: "Progression synchronisée",
    description: "Votre compte et votre avancée sur téléphone comme sur ordinateur.",
    target: "Comptes · Premium",
    status: "planned",
  },
];

export const phases: readonly Phase[] = [
  { id: 0, title: "Fondations du projet", status: "in-progress" },
  { id: 1, title: "Design system et PWA installable", status: "todo" },
  { id: 2, title: "Comptes et base de données", status: "todo" },
  { id: 3, title: "Modèle de contenu et vérification", status: "todo" },
  { id: 4, title: "Leçons et entraînement", status: "todo" },
  { id: 5, title: "Modes d’examen", status: "todo" },
  { id: 6, title: "Moteur adaptatif", status: "todo" },
  { id: 7, title: "Scènes 3D", status: "todo" },
  { id: 8, title: "Gamification", status: "todo" },
  { id: 9, title: "Coach IA", status: "todo" },
  { id: 10, title: "Premium", status: "todo" },
  { id: 11, title: "Validation et lancement", status: "todo" },
];
