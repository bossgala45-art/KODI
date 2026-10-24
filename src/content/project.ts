/**
 * Phases du projet affichées dans Profil > À propos.
 * Toute modification de statut doit refléter docs/ROADMAP.md.
 */

export type PhaseStatus = "done" | "in-progress" | "todo";

export interface Phase {
  id: number;
  title: string;
  status: PhaseStatus;
}

export const phases: readonly Phase[] = [
  { id: 0, title: "Fondations du projet", status: "done" },
  { id: 1, title: "Design system et écrans principaux", status: "done" },
  { id: 2, title: "Comptes et base de données", status: "in-progress" },
  { id: 3, title: "Moteur pédagogique et contenus", status: "done" },
  { id: 4, title: "Leçons et entraînement", status: "todo" },
  { id: 5, title: "Modes d’examen", status: "done" },
  { id: 6, title: "Moteur adaptatif", status: "todo" },
  { id: 7, title: "Scènes 3D", status: "done" },
  { id: 8, title: "Coach pédagogique et gamification", status: "done" },
  { id: 9, title: "Coach IA", status: "todo" },
  { id: 10, title: "Premium", status: "todo" },
  { id: 11, title: "Validation et lancement", status: "todo" },
];
