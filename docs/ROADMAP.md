# Feuille de route

Chaque phase se termine par un état compilable, testé et validé par le porteur
de projet. **On ne passe pas à la phase suivante sans validation explicite.**

Légende : ✅ terminée · 🟡 en cours · ⬜ à venir

La liste affichée sur la page d’accueil (`src/content/project.ts`) doit rester
synchronisée avec ce fichier.

## ✅ Phase 0 — Fondations du projet

Livré :
- Projet Next.js 16.4 + TypeScript strict + Tailwind CSS 4.
- ESLint (zéro avertissement), Vitest + Testing Library, Playwright.
- Page d’accueil responsive, honnête sur l’état du projet.
- Thèmes clair / sombre / auto, mémorisés, sans flash au chargement.
- Documentation : README, spécification, feuille de route, décisions, AGENTS.
- CI GitHub Actions (lint, types, tests, build, E2E).

Clôture (22/10/2026) :
- [x] CI GitHub Actions verte sur la branche `phase-0-fondations`.
- [x] Revérification après réinstallation propre : lint, types, 15 tests
  unitaires, build, 10 tests E2E (dont navigation clavier), contrastes AA des
  jetons de couleur dans les deux thèmes.
- [x] Validation déléguée par le porteur (« vérifie tout et si c’est bon,
  passe à la phase 1 »).
- Reporté : choix de l’hébergement de prévisualisation (Q-01).

## ✅ Phase 1 — Design system et écrans principaux

Périmètre défini par le porteur (prompt du 22/10/2026).

Livré, en attente de validation :
- Palette demandée (bleu nuit, bleu principal, vert, rouge, fond clair) en
  jetons CSS, modes clair / sombre / auto, nuances AA (D-011).
- Animations fluides et discrètes, désactivables (Activées / Réduites / Auto).
- Composants réutilisables : bouton, lien-bouton, carte, badge, badge
  « Données fictives », alerte, barre de progression, squelette de
  chargement, écran vide, tuile statistique, en-tête de page, champs texte et
  mot de passe, case à cocher, sélecteur segmenté, icônes.
- Navigation mobile à cinq onglets (barre latérale sur grand écran).
- Dix écrans : Accueil, Apprendre, Simuler, S’entraîner, Progression,
  Connexion, Inscription, Onboarding, Profil et paramètres, Premium.
- États de chargement, écrans vides, messages d’erreur (formulaires, erreur
  de page avec « Réessayer », page introuvable, stockage bloqué).
- Interactions réelles : séries et examen blanc jouables, historique local,
  statistiques, profil local, onboarding, réglages, réinitialisation.
- Tests : unitaires et composants (Vitest), bout en bout sur mobile et
  bureau, audit d’accessibilité axe (WCAG 2.2 A/AA) en clair et sombre,
  absence de défilement horizontal jusqu’à 320 px.

Ajout demandé en cours de phase (22/10/2026) : examen blanc au format
officiel (40 questions, seuil de 35) avec 68 questions originales sourcées,
au statut « non relues » (D-015).

Non réalisé dans cette phase (non demandé) : PWA installable (manifest,
icônes, service worker, hors ligne) et prévisualisation en ligne.

## 🟡 Phase 2 — Comptes et base de données

Périmètre défini par le porteur (prompt du 22/10/2026).

Livré (code, migrations, tests) :
- Supabase Auth e-mail + mot de passe : inscription avec confirmation,
  connexion, renvoi de confirmation, mot de passe oublié et
  réinitialisation, route `/auth/confirm`, déconnexion.
- 6 migrations versionnées : profils, préférences, cours, compétences,
  questions (propositions, réponses cachées), tentatives, examens, révisions,
  scènes et parcours de simulation, abonnements, journal d’audit, fonctions
  serveur, temps réel.
- RLS sur toutes les tables, privilèges minimaux, fonctions SECURITY DEFINER.
- Examen blanc côté serveur pour les comptes connectés (corrigé après remise).
- Synchronisation profil et réglages entre sessions (temps réel, file hors
  ligne, dernière modification gagnante).
- Gestion des erreurs réseau, mode local si Supabase n’est pas configuré.
- Tests de sécurité sur PostgreSQL réel (`npm run test:db`), en CI.

Reste à faire (étapes manuelles, voir docs/SUPABASE.md) :
- [ ] Créer le projet Supabase et régler l’authentification.
- [ ] Ajouter les secrets GitHub et lancer le déploiement de la base.
- [ ] Héberger l’application (Q-01) et y définir les variables publiques.
- [ ] Vérifier manuellement le parcours complet sur iPhone.

## 🟡 Phase 3 — Moteur pédagogique et contenus

Périmètre défini par le porteur (prompt « moteur pédagogique »). Il reprend
le modèle de contenu prévu ici et une partie des phases 4 et 6.

Livré, en attente de validation :
- 10 univers issus des thèmes officiels de l’examen (D-020), 72 leçons
  prévues (répartition provisoire, Q-11), 20 compétences.
- Leçons en blocs : texte, image, vidéo (ou « à produire » avec
  transcription), simulation (scène à venir en phase 7).
- Questions à réponse unique ou multiple, explications, sources
  réglementaires consultées, compétences associées.
- Moteur sans IA (D-021) : correction tout ou rien avec détail, historique
  des réponses, maîtrise estimée par compétence, révisions espacées
  adaptatives, carnet d’erreurs, programme quotidien personnalisé.
- Système d’import (D-022, docs/CONTENU.md) : statuts brouillon, à vérifier,
  validé, retiré ; transitions contrôlées ; catalogue et import SQL générés.
- Migration `pedagogy` : leçons, compétences des leçons et des questions,
  révisions adaptatives identiques au TypeScript, examen limité aux
  questions prévues pour lui et jamais aux démonstrations.
- Écrans : univers, leçon, révisions (programme du jour, carnet d’erreurs),
  maîtrise dans Progression, programme du jour sur l’accueil.
- Exemples de démonstration clairement marqués non validés (D-023) ; aucune
  question ajoutée pour remplir la base.
- Tests unitaires du calcul de maîtrise, des révisions et de la correction
  des réponses multiples ; tests de l’import ; parité SQL/TypeScript ;
  parcours de bout en bout.

Reste à faire :
- [ ] Validation de la phase par le porteur.
- [ ] Relecture des contenus (aucun n’est validé à ce jour).
- [ ] Rédaction progressive des leçons (2 sur 72, de démonstration).

## ⬜ Phase 4 — Leçons et entraînement

- Lecteur de leçons et entraînement par leçon : livrés en phase 3.
- Reste : entraînement libre par univers, premières questions publiées.

## ⬜ Phase 5 — Modes d’examen

- Les 4 modes, statistiques de résultats.

## ⬜ Phase 6 — Moteur adaptatif

- Répétition espacée et maîtrise par compétence : livrées en phase 3.
- Reste : synchronisation de l’historique des réponses avec le compte,
  ajustement des paramètres sur des données réelles.

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
