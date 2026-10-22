# Spécification de KODI

Version 0.1 — rédigée en Phase 0. Ce document décrit la cible. Tout ce qui y
figure est **à construire** ; l’état réel est suivi dans [ROADMAP.md](ROADMAP.md).

Les éléments marqués **[À VALIDER]** sont des propositions de l’équipe
technique qui demandent une décision du porteur de projet. Les éléments marqués
**[À VÉRIFIER]** dépendent d’une source officielle qui n’a pas encore été
identifiée ni consultée : ils ne doivent pas être affichés aux utilisateurs
avant vérification.

## 1. Vision

KODI aide une personne à préparer l’épreuve théorique du code de la route en
France, sur téléphone en priorité, avec des explications claires, un
entraînement adapté à ses faiblesses et des mises en situation visuelles.

## 2. Publics

- Candidats à l’épreuve théorique générale (principalement 15-25 ans, mais pas
  seulement), souvent sur téléphone, parfois avec une connexion instable.
- Personnes reprenant la conduite après une longue interruption.

## 3. Principes non négociables

1. **Honnêteté** : une fonctionnalité n’est présentée comme disponible que si
   elle fonctionne réellement en production. Pas de données fictives présentées
   comme réelles.
2. **Contenu original** : aucune question n’est présentée comme officielle ou
   issue de la banque de l’examen. Aucune question n’est copiée d’un manuel,
   d’un site ou d’une application tiers.
3. **Sources vérifiées** : chaque question et chaque leçon est rattachée à au
   moins une source réglementaire précise (texte, article, date de version),
   consultée par un humain. Aucune source n’est inventée ; une source non
   retrouvée bloque la publication.
4. **Qualité vérifiable** : chaque phase livre un état compilable et testé.
5. **Accessibilité** : objectif de conformité RGAA / WCAG 2.2 niveau AA.
6. **Sobriété** : performance correcte sur téléphone d’entrée de gamme et en
   réseau mobile dégradé.

## 4. Fonctionnalités cibles

### 4.1 Univers et leçons

- **10 univers** thématiques, **72 leçons** prévues au total.
- Le découpage doit correspondre aux thèmes de l’épreuve théorique.
  **[À VÉRIFIER]** Hypothèse de travail, non vérifiée, à confirmer sur une
  source officielle avant tout usage : circulation routière ; conducteur ;
  route ; autres usagers ; notions diverses ; premiers secours ; prendre et
  quitter son véhicule ; mécanique et équipements ; sécurité du passager et du
  véhicule ; environnement.
- La répartition des 72 leçons par univers sera fixée en Phase 3.

### 4.2 Questions

- Objectif : **2 000 questions vérifiées**. Le nombre affiché aux utilisateurs
  ne compte que les questions au statut « publiée ».
- Cycle de vie d’une question : `brouillon → relue → sourcée → publiée`, avec
  possibilité de `retirée` (par exemple après une évolution réglementaire).
- Chaque question publiée porte : énoncé, propositions, bonne(s) réponse(s),
  explication, source(s) avec date de consultation, auteur, relecteur, date de
  relecture, univers, leçon, difficulté.
- Les médias (photos, schémas, scènes) doivent être originaux ou sous licence
  compatible, avec la licence enregistrée.

### 4.3 Modes d’examen (4)

Adoptés (D-010) :

1. **Entraînement libre** — par univers ou par leçon, correction immédiate.
2. **Examen blanc** — reproduit le format de l’épreuve réelle
   (**[À VÉRIFIER]** nombre de questions, durée, seuil de réussite et règles
   d’affichage, à établir depuis une source officielle).
3. **Révision des erreurs** — uniquement les questions échouées ou fragiles.
4. **Série courte** — 10 questions pour les sessions de quelques minutes.

### 4.4 Scènes 3D et caméras

- **20 scènes** de situations de conduite rendues avec Three.js /
  React Three Fiber, consultables sous **4 caméras**.
- Caméras adoptées (D-010) : vue conducteur, vue aérienne, vue arrière
  (poursuite), vue d’un autre usager.
- Contraintes : chargement progressif, repli 2D si WebGL indisponible ou
  appareil trop lent, aucune scène indispensable pour réussir une leçon.

### 4.5 Moteur adaptatif

- Choix des prochaines questions selon l’historique de réponses (maîtrise par
  leçon, répétition espacée).
- Algorithme déterministe, explicable et testé unitairement.

### 4.6 Coach IA

- Explique une erreur, propose la suite de révision.
- Ne produit jamais de règle non sourcée : ses réponses s’appuient sur les
  explications et sources déjà vérifiées de KODI.
- **[À VALIDER]** Toute API d’IA est payante à l’usage ; l’abonnement Claude
  Pro n’inclut pas d’accès API. Voir DECISIONS.md, question ouverte Q-03.

### 4.7 Gamification équilibrée

- Séries de jours, objectifs, badges de progression liés à la maîtrise réelle.
- Pas de mécanique punitive, pas de pression à l’achat, pas de classement
  public par défaut.

### 4.8 Comptes, synchronisation, Premium

- Usage possible sans compte (progression locale) ; compte pour synchroniser
  entre appareils (Supabase Auth + PostgreSQL avec Row Level Security).
- **Premium** : périmètre gratuit / payant **[À VALIDER]**. Le paiement
  n’est mis en place qu’à la phase dédiée.
- Conformité RGPD : consentement, export et suppression des données, mentions
  légales, politique de confidentialité, CGU / CGV avant lancement.

### 4.9 PWA et thèmes

- Installable (manifest, icônes, écran de démarrage), fonctionnement hors
  ligne du contenu déjà téléchargé.
- Thèmes clair, sombre et automatique (suit le système). **Disponible depuis
  la Phase 0.**
- Animations discrètes, désactivables (Activées / Réduites / Auto, qui suit
  le réglage « réduire les animations » de l’appareil). **Disponible depuis
  la Phase 1.**

### 4.10 Direction artistique (Phase 1)

- Bleu nuit #101B30, bleu principal #287CFF, vert succès #32C89A, rouge
  erreur #FF746D, fond clair #F4F7FB ; modes clair et sombre.
- Interface premium, moderne et légèrement ludique ; animations fluides,
  discrètes et désactivables.
- Navigation mobile à cinq onglets : Accueil, Apprendre, Simuler,
  S’entraîner, Progression. Profil et Premium accessibles depuis l’en-tête.

## 5. Exigences de qualité

- TypeScript strict (`strict`, `noUncheckedIndexedAccess`, etc.), aucun `any`.
- ESLint sans avertissement.
- Tests unitaires pour toute logique pure, tests de composants pour les
  interactions, tests de bout en bout pour les parcours critiques.
- CI verte obligatoire avant fusion.
- Interface en français ; textes relus.
