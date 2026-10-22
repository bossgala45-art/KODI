# Feuille de route

Chaque phase se termine par un état compilable, testé et validé par le porteur
de projet. **On ne passe pas à la phase suivante sans validation explicite.**

Légende : ✅ terminée · 🟡 en cours · ⬜ à venir

La liste affichée sur la page d’accueil (`src/content/project.ts`) doit rester
synchronisée avec ce fichier.

## 🟡 Phase 0 — Fondations du projet

Livré :
- Projet Next.js 16.4 + TypeScript strict + Tailwind CSS 4.
- ESLint (zéro avertissement), Vitest + Testing Library, Playwright.
- Page d’accueil responsive, honnête sur l’état du projet.
- Thèmes clair / sombre / auto, mémorisés, sans flash au chargement.
- Documentation : README, spécification, feuille de route, décisions, AGENTS.
- CI GitHub Actions (lint, types, tests, build, E2E).

Reste à faire pour clôturer :
- [ ] Vérifier que la CI GitHub Actions passe sur la branche.
- [ ] Relecture et validation par le porteur de projet.
- [ ] Décider de l’hébergement de prévisualisation (DECISIONS.md, Q-01).

## ⬜ Phase 1 — Design system et PWA installable

- Identité visuelle (logo, palette validée en contraste AA, typographie).
- Composants de base (bouton, carte, champ, navigation mobile).
- Manifest, icônes, écran de démarrage iOS, service worker, page hors ligne.
- Prévisualisation en ligne accessible depuis l’iPhone.
- Critères : installation vérifiée manuellement sur iPhone (Safari) et Android
  (Chrome) ; audit Lighthouse PWA/accessibilité sans erreur bloquante.

## ⬜ Phase 2 — Comptes et base de données

- Projet Supabase (plan gratuit), schéma PostgreSQL versionné en migrations.
- Authentification, Row Level Security testée, progression locale puis
  synchronisée.

## ⬜ Phase 3 — Modèle de contenu et vérification

- Identification et citation des sources officielles.
- Validation du découpage en 10 univers / 72 leçons.
- Schéma des questions, cycle de vie, outil de relecture, contrôles
  automatiques (source présente, relecteur différent de l’auteur, etc.).

## ⬜ Phase 4 — Leçons et entraînement

- Lecteur de leçons, entraînement libre, premières questions publiées.

## ⬜ Phase 5 — Modes d’examen

- Les 4 modes, statistiques de résultats.

## ⬜ Phase 6 — Moteur adaptatif

- Répétition espacée, maîtrise par leçon, tests unitaires exhaustifs.

## ⬜ Phase 7 — Scènes 3D

- Three.js / React Three Fiber, 4 caméras, repli 2D, budget de performance.

## ⬜ Phase 8 — Gamification

- Séries, objectifs, badges liés à la maîtrise.

## ⬜ Phase 9 — Coach IA

- Dépend d’une décision budgétaire (Q-03).

## ⬜ Phase 10 — Premium

- Périmètre, paiement, gestion des abonnements, documents légaux.

## ⬜ Phase 11 — Validation et lancement

- Atteinte de l’objectif de contenu vérifié, audits (sécurité, accessibilité,
  performance, RGPD), tests sur appareils réels, levée du `noindex`,
  publication.
