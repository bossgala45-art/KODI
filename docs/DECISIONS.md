# Journal des décisions

Format : contexte → décision → conséquences. Une décision n’est modifiée que
par une nouvelle entrée qui la remplace explicitement.

## D-001 — Next.js 16.4 avec App Router et Cache Components (Phase 0)

- **Contexte** : cible Next.js + TypeScript. Version stable la plus récente au
  22/10/2026 : 16.4.2.
- **Décision** : projet généré par `create-next-app@16.4.2`, options par
  défaut conservées (App Router, `src/`, Turbopack, `cacheComponents`,
  `partialPrefetching`).
- **Conséquences** : la documentation de référence est celle livrée dans
  `node_modules/next/dist/docs/` (les API diffèrent des versions antérieures).

## D-002 — npm et Node.js 22

- **Décision** : npm (fourni avec Node), `package-lock.json` versionné,
  `npm ci` en CI. Node.js ≥ 22 (`engines`). `@types/node` aligné sur la v22.

## D-003 — TypeScript 5, mode strict renforcé

- **Contexte** : TypeScript 7 est publié, mais sa compatibilité avec le plugin
  Next.js et l’outillage n’a pas été vérifiée.
- **Décision** : TypeScript 5 (choix du générateur) avec `strict`,
  `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`,
  `noFallthroughCasesInSwitch`, `allowJs: false`.
- **À revoir** : migration vers TypeScript 7 quand Next.js la documente.

## D-004 — ESLint 9 avec `eslint-config-next`

- **Décision** : configuration du générateur + `no-explicit-any` en erreur,
  `consistent-type-imports`, `--max-warnings=0`.
- **Point d’attention** : ESLint 9 est signalé obsolète par npm ;
  `eslint-config-next@16.4.2` est la configuration générée. `npm audit`
  signale 5 vulnérabilités « high » (paquet `braces`) dans cette chaîne
  d’outils de développement uniquement ; elles ne sont pas livrées dans
  l’application. Le correctif proposé (`audit fix --force`) rétrograderait
  vers `eslint-config-next@14`, donc refusé. À réévaluer à chaque mise à jour.

## D-005 — Tests : Vitest + Testing Library, Playwright

- **Décision** : Vitest 5 (jsdom) pour la logique et les composants,
  Playwright pour les parcours navigateur sur le build de production
  (profils mobile Pixel 7 et desktop).
- **Playwright épinglé à 1.56.1** : c’est la version dont le Chromium est
  pré-installé dans l’environnement cloud Claude Code
  (`/opt/pw-browsers`). Mettre à jour Playwright implique de vérifier ce point.
- **Limite** : seul Chromium est testé automatiquement. Safari / WebKit
  (iPhone) n’est pas installé dans l’environnement : les vérifications iOS
  restent manuelles sur l’iPhone.

## D-006 — Thèmes clair / sombre / auto

- **Décision** : couleurs en variables CSS, thème appliqué via l’attribut
  `data-theme` sur `<html>`, variante Tailwind `dark:` liée à cet attribut.
  Choix mémorisé dans `localStorage` (`kodi-theme`) ; script inline dans
  `<head>` pour éviter le flash ; sans JavaScript, la préférence système
  s’applique.
- **Plus tard** : synchroniser la préférence avec le compte (Phase 2).

## D-007 — Pas d’indexation avant le lancement

- **Décision** : `robots: noindex, nofollow` dans les métadonnées. À lever
  uniquement en Phase 11.

## D-008 — CI GitHub Actions

- **Contexte** : développement exclusivement depuis iPhone, aucune machine
  locale. Le dépôt est public : GitHub Actions est gratuit sur les runners
  standards.
- **Décision** : un workflow unique (lint, typecheck, tests, build, E2E) à
  chaque push et pull request.

## D-009 — Développement sans dépense

- **Décision** : n’utiliser que des services au plan gratuit pendant le
  développement ; toute dépense future est signalée comme question ouverte
  avant d’être engagée.
- **Conséquence** : le dépôt est public, donc le code est visible de tous.
  Ne jamais y versionner de secret (`.env*` est ignoré par Git).

## D-010 — Modes d’examen, caméras et usage sans compte

- **Contexte** : propositions de la spécification v0.1, soumises au porteur
  le 22/10/2026, qui a délégué la validation.
- **Décision** : adoption des 4 modes (entraînement libre, examen blanc,
  révision des erreurs, série courte), des 4 caméras (conducteur, aérienne,
  arrière, autre usager) et de l’usage sans compte avec synchronisation
  optionnelle. Révisables par une nouvelle décision.
- **Reste [À VÉRIFIER]** : le format exact de l’examen blanc (source
  officielle à identifier, Q-05).

## D-011 — Palette et accessibilité des contrastes

- **Contexte** : couleurs imposées par la direction artistique. Mesures
  WCAG : texte blanc sur #287CFF = 3,88:1 ; #32C89A et #FF746D comme texte sur
  fond clair = 1,98:1 et 2,45:1. Le seuil AA pour du texte courant est 4,5:1.
- **Décision** : les couleurs d’origine restent les couleurs d’identité
  (icônes, barres, contours, fonds de pastilles, éléments non textuels). Des
  nuances dérivées ne servent que là où du texte doit rester lisible :
  `brand-strong` #1F69E0 (fond des boutons principaux, texte blanc 5,0:1),
  `brand-text` #1C62D6 / #7FB0FF (texte bleu en clair / sombre),
  `success-text` #1B7A5C / #4FD8AE, `danger-text` #B3443F / #FF8F89. Sur les
  fonds vert et rouge, le texte est en bleu nuit (8,1:1 et 6,5:1).
- **Conséquence** : toute nouvelle couleur passe par un jeton de
  `globals.css` et doit être vérifiée en clair et en sombre.

## D-012 — Données locales et données de démonstration

- **Contexte** : aucun compte ni base de données avant la phase 2, mais les
  interactions visibles doivent fonctionner.
- **Décision** : profil, réglages et historique sont enregistrés dans le
  `localStorage` du navigateur (magasins validés à la lecture, repli en
  mémoire si le stockage est bloqué). Les contenus d’exemple vivent dans
  `src/content/demo.ts` ; les questions fictives portent sur l’application
  elle-même, jamais sur le code de la route, et tout écran qui les affiche
  porte le badge « Données fictives ». Connexion, inscription et Premium
  valident la saisie puis indiquent clairement que le service n’existe pas
  encore ; rien n’est envoyé.
- **Conséquence** : à la phase 2, ces magasins locaux deviendront la source
  hors ligne synchronisée avec le compte.

## D-013 — Routes en français et groupes de routes

- **Décision** : URL en français (`/apprendre`, `/simuler`, `/entrainement`,
  `/progression`, `/profil`, `/premium`, `/connexion`, `/inscription`,
  `/bienvenue`). Groupe `(tabs)` avec la navigation à onglets, groupe
  `(focus)` sans onglets pour les parcours ciblés.

## D-014 — Audit d’accessibilité automatisé

- **Décision** : `@axe-core/playwright` (gratuit) dans les tests de bout en
  bout, règles WCAG 2.0/2.1/2.2 A et AA, sur chaque écran en clair et en
  sombre. Tout écart fait échouer la CI.
- **Limite** : un audit automatique ne remplace pas un test avec lecteur
  d’écran (VoiceOver sur iPhone), à faire manuellement.

## D-015 — Examen blanc au format officiel et premières questions réelles

- **Contexte** : demande du porteur (22/10/2026) d’un examen blanc « comme
  le vrai », avec le même nombre de questions. La banque officielle (environ
  1 000 questions) n’est pas publique et ne peut pas être reproduite.
- **Décision** :
  - format : 40 questions, réussite à 35 (source service-public.gouv.fr) ;
    une réponse n’est comptée juste que si toutes les bonnes propositions
    sont cochées ; le nombre de réponses attendues est affiché ;
  - contenu : 68 questions **originales**, rédigées par IA à partir de
    20 pages officielles de la Sécurité routière et de la fiche
    Service-Public F19459 (triangle et gilet), lues le 22/10/2026 (`src/content/sources.ts`, `docs/SOURCES.md`). Chaque question
    cite ses sources, affichées dans le corrigé ;
  - statut : toutes « non relues ». L’interface affiche le badge
    « Non relues » et précise qu’il ne s’agit pas des questions officielles ;
  - situations décrites par écrit : l’examen réel s’appuie sur des photos et
    des vidéos, que KODI n’a pas encore.
- **Limites** : Légifrance refuse l’accès automatisé depuis l’environnement
  de développement ; les articles du code de la route sont ceux cités par
  les pages officielles, non relus sur Légifrance. La distance du triangle,
  contradictoire entre deux pages de la Sécurité routière (30 m / 200 m), a
  été tranchée par la fiche Service-Public F19459 : « à 30 mètres ou plus ». Le mode S’entraîner reste sur les questions
  fictives (non demandé).

## D-016 — Supabase : architecture de sécurité

- **Clés** : l’application n’utilise que l’URL et la clé *publishable*
  (publiques). Aucune clé secrète dans le code ; une clé secrète placée par
  erreur dans la variable publique est refusée (mode local).
- **RLS** sur toutes les tables ; privilèges par défaut de Supabase retirés
  puis accordés au minimum, parfois colonne par colonne (profil, préférences,
  abonnement sans identifiants du prestataire).
- **Écritures sensibles par fonctions** `SECURITY DEFINER` (search_path vide) :
  réponses de pratique, examens, révisions, relecture. Un client ne peut ni
  écrire une tentative, ni modifier un score, ni s’attribuer Premium.
- **Bonnes réponses** dans `question_answers`, illisible par les clients ;
  renvoyées après réponse (pratique) ou après remise (examen). Une question
  d’un examen en cours ne peut pas être « testée » en pratique.
- **Contenus** : seuls les contenus `published` sont visibles ; une question
  publiée exige une relecture datée et au moins une source.
- **Audit** : journal en ajout seul (même le serveur ne peut ni modifier ni
  effacer), anonymisé à la suppression d’un compte.
- **Liens e-mail** : modèles avec `token_hash` vers `/auth/confirm`,
  destination limitée à une liste de chemins internes, redirection relative.

## D-017 — Synchronisation entre sessions

- Profil (prénom, objectif, onboarding) et réglages (thème, animations) :
  stockage local + compte, « dernière modification gagnante » (horodatage
  serveur vs horodatage local), file d’attente hors ligne, envoi au retour
  du réseau, mise à jour en temps réel (Supabase Realtime) et au retour sur
  l’application.
- Premier rattachement d’un appareil : un compte neuf adopte les données de
  l’appareil ; un compte déjà utilisé fait foi. Les données locales d’un autre
  compte ne sont jamais envoyées. La déconnexion retire le profil du compte
  de l’appareil.
- Examens : stockés côté serveur, donc communs à toutes les sessions. Les
  séries d’entraînement (questions fictives) restent locales.
- **Limite** : l’horloge de l’appareil intervient dans l’arbitrage d’un
  conflit hors ligne ; un écart d’horloge important peut faire gagner la
  mauvaise version.

## D-018 — Interprétations du prompt « Comptes et persistance »

- **Simulations** : scènes de simulation 3D (catalogue publié) et parcours
  de l’utilisateur (scène, caméra) ; l’examen blanc est la table `exams`.
- **Questions de l’examen blanc** chargées en base au statut `in_review`
  (non publiques). Connecté, l’examen serveur n’utilise que des questions
  publiées ; tant qu’il y en a moins de 40, l’application propose l’examen
  local (questions non relues, badge « Non relues »).

## D-019 — Tests de sécurité de la base

- **Contexte** : Docker n’est pas disponible dans l’environnement de
  développement, donc pas de pile Supabase locale.
- **Décision** : PostgreSQL 16 temporaire + reproduction minimale de
  Supabase (`supabase/tests/supabase-shim.sql` : rôles, `auth.uid()`,
  privilèges par défaut), migrations réelles, tests Vitest avec `pg`.
- **Vérification des tests** : deux failles volontairement injectées
  (brouillons publics, fuite des réponses pendant l’examen) ont bien fait
  échouer les tests correspondants.
- **Limite** : Auth, PostgREST et Realtime ne sont pas exécutés ; leur
  intégration est couverte par des tests unitaires avec client simulé et
  devra être vérifiée sur le vrai projet.

## D-020 — Dix univers tirés des thèmes officiels de l’examen

- **Source** : page de la Sécurité routière « Objectifs et réglementation de
  l’examen du code » (consultée le 22/10/2026, relue le 23/10/2026).
- **Constat** : la page annonce « Onze thèmes à connaître » mais n’en liste
  que dix : arrêt et stationnement ; croisement et dépassement ; économie et
  écoconduite ; règles de priorités ; règles de circulation ; signalisation ;
  tunnels et passages à niveau ; visibilité et éclairage ; usagers, partage
  de l’espace public ; prise de conscience des risques.
- **Décision** : ces dix thèmes deviennent les dix univers (`content/univers.json`),
  au statut « à vérifier ». Le onzième thème annoncé n’est pas identifié
  (Q-10) ; il n’est rien inventé pour le combler.
- **Répartition des 72 leçons** : 6, 7, 4, 8, 10, 9, 5, 6, 8, 9, validée
  par le porteur le 24/10/2026 ; l’import vérifie le total de 72.

## D-021 — Moteur pédagogique sans IA générative

- **Correction** : tout ou rien, comme l’examen blanc ; le détail (oublis,
  cochées à tort) sert à l’explication (`src/lib/pedagogy/grading.ts`).
- **Historique des réponses** : source unique de vérité (stockage local
  `kodi-answers`, 5 000 réponses au plus). Maîtrise, révisions et carnet
  d’erreurs en sont recalculés, donc toujours cohérents.
- **Maîtrise par compétence** : moyenne bayésienne, a priori 50 %, chaque
  réponse perdant la moitié de son poids en 30 jours ; confiance
  Σpoids / (Σpoids + 5) ; « non évaluée » sous 3 réponses, « maîtrisée » à
  80 % et confiance ≥ 0,5, « fragile » sous 50 %.
- **Révisions espacées** : variante de SM-2 en entiers (facilité ×100,
  intervalle en dixièmes de jour) : 1 jour, 3 jours, puis intervalle ×
  facilité ; erreur → retour dans 10 minutes. Intervalle réduit à 60 % si la
  compétence la plus faible de la question est fragile, 85 % si elle est en
  cours. Seules les réponses antérieures comptent pour la maîtrise utilisée.
- **Carnet d’erreurs** : une question manquée y reste jusqu’à deux bonnes
  réponses consécutives.
- **Programme du jour** : objectif quotidien moins les réponses du jour ;
  carnet d’erreurs (30 % au plus), puis révisions dues, puis questions
  nouvelles des compétences les plus faibles ; prochaine leçon non terminée.
- **Base de données** : le même calcul existe en SQL
  (`private.record_revision`, `private.competence_mastery`) ; un test
  compare réponse par réponse les résultats SQL et TypeScript, et a détecté
  les modifications volontairement injectées.

## D-022 — Contenus versionnés et importés

- **Décision** : contenus en JSON dans `content/`, validés par schéma (zod)
  et règles d’intégrité, importés par `npm run content:build` vers un
  catalogue lu par l’application et un import SQL rejouable à identifiants
  stables (UUID v5). Statuts brouillon, à vérifier, validé, retiré, avec
  transitions contrôlées par `content/statuts.lock.json` (voir
  `docs/CONTENU.md`).
- **Pourquoi** : relecture et historique dans Git, aucun outil
  d’administration ni service payant à ce stade, contrôles automatiques
  avant chaque import.
- **Conséquence** : les fichiers font foi pour les statuts ; la fonction
  `review_question` de la base reste utilisable en urgence (retrait), mais
  le prochain import réaligne la base sur les fichiers.
- **Migration** : la banque de l’examen blanc (68 questions) a été déplacée
  de `src/content/exam-questions.ts` vers `content/questions/examen-blanc.json`,
  à l’identique (vérifié champ par champ), et rattachée à des compétences.

## D-023 — Exemples de démonstration

- Deux leçons (priorité à droite, passage à niveau) et trois questions
  marquées `"demo": true`, au statut brouillon, affichées avec le badge
  « Démonstration · non validé ». Elles servent à montrer les blocs (texte,
  image originale, vidéo à produire, simulation à venir) et le moteur. Elles
  s’appuient sur les pages officielles déjà consultées, mais n’ont pas été
  relues : elles ne doivent pas servir de référence.
- Aucune question n’a été créée pour remplir la base.

## D-024 — Modes d’examen côté serveur

- **Contexte** : prompt du porteur « Implémente les examens de KODI »
  (24/10/2026) : 4 modes, questions validées, correction côté serveur,
  sessions sauvegardées, examen complet refusé si les questions manquent.
- **Décision** :
  - tirage, enregistrement et correction dans la base (migration
    `exam_modes`, fonctions `exam_availability`, `start_exam_mode`,
    `submit_exam`, `get_exam_correction`, `get_exam_competence_stats`) ;
    aucune bonne réponse n’est envoyée avant la remise ;
  - questions tirables : statut validé (`published`), prévues pour
    l’examen, jamais de démonstration ; d’abord celles que la personne n’a
    jamais vues (ni en pratique, ni en examen), puis les moins récemment
    vues ; ordre mélangé ;
  - officiel : 40 questions, 35 pour réussir (contraint en base). Express
    (10) et ciblé (20) : nombres demandés par le porteur. Revanche : 10
    questions, choix de l’agent faute de précision dans le prompt ;
    compétences « ratées » = au moins une erreur et pas encore maîtrisées
    (règle de D-021) ;
  - seul le mode officiel donne « réussi / échoué » ; les autres donnent un
    score, avec le repère 35/40 (87,5 %) ;
  - barème de KODI : tout ou rien par question ; question sans réponse =
    fausse (non vérifié sur un texte officiel, indiqué à l’écran) ;
  - recommandations : compétences sous 87,5 % de bonnes réponses, les plus
    faibles d’abord, avec un lien vers la leçon ou l’univers à réviser ;
  - un seul examen en cours à la fois ; il se reprend après rechargement.
- **Conséquence pour l’usage sans compte** (révise D-010 pour les
  examens) : sans compte ni serveur, aucun examen n’est proposé ; l’écran
  l’explique. L’ancien examen blanc local sur des questions « non relues »
  est retiré, car le prompt exige des questions validées et une correction
  serveur. Les 68 questions restent jouables dans Révisions.
- **État au 24/10/2026** : aucune question n’est encore validée et le
  serveur n’est pas en service : les examens sont donc bloqués, avec le
  message « Examen impossible pour le moment : 0 question validée… ».
- **Fidélité** : voir docs/SOURCES.md. Vérifié : 40 questions, 35 pour
  réussir, nombre de réponses attendues indiqué. Différences : questions
  originales (banque officielle de 1 037 questions non publique), pas de
  photos ni de vidéos, pas de chronomètre (durée non vérifiée : Légifrance
  et interieur.gouv.fr refusent l’accès automatisé). L’écran le dit et ne
  présente pas la simulation comme fidèle.
- **Limite connue** : pour l’entraînement, les bonnes réponses du catalogue
  sont présentes dans l’application ; une personne déterminée pourrait les
  consulter avant un examen. Les résultats, eux, ne peuvent pas être
  falsifiés (tests `supabase/tests/exam-modes.test.ts`).

## D-025 — Moteur de simulation 3D (première scène)

- **Contexte** : prompt du porteur « moteur de simulation 3D » (24/10/2026),
  première scène : intersection avec priorité à droite.
- **Décision** :
  - Three.js 0.186.1 et React Three Fiber 9.8.2 (MIT), sans bibliothèque
    d’aide supplémentaire : les contrôles de caméra libre viennent de
    Three.js (`OrbitControls`) ;
  - données de scène pures (`src/content/scenes/`), positions fonction du
    temps uniquement : 3D, 2D et tests voient exactement la même chose ;
  - formes géométriques simples et sons synthétisés, affichés comme
    provisoires ; aucun fichier 3D ou sonore tiers ;
  - aucun panneau de priorité représenté tant que sa forme et son code n’ont
    pas été vérifiés sur une source officielle ;
  - caméras du prompt (conducteur, aérienne, libre, explicative) ; elles
    remplacent, pour les scènes, les caméras proposées en D-010 (arrière,
    autre usager), qui pourront être ajoutées par scène ;
  - version 2D de secours en SVG, automatique ou au choix ;
  - adaptation automatique de la résolution, budget de rendu vérifié par
    les tests ; mesures publiées seulement quand elles ont été faites, avec
    leurs conditions (docs/SCENES.md).
- **Après validation de la scène** : préparer l’architecture réutilisable
  pour les 19 autres situations (registre, gabarits de décor, types
  d’usagers, signalisation vérifiée).

## D-026 — Architecture réutilisable des scènes

- **Contexte** : première scène validée par le porteur le 24/10/2026 ; le
  prompt demandait ensuite une architecture pour les 19 autres situations.
- **Décision** : une scène = des données (voirie, usagers, éléments fixes,
  caméras, sous-titres, règle de passage, liens pédagogiques). La voirie est
  convertie en géométrie pure partagée par la 3D et la 2D. L’ordre de
  passage attendu est vérifié par les tests à partir des trajectoires.
- **Programme des 20 scènes** : aucune liste n’existait ; l’agent en
  propose une (`src/content/scenes/plan.ts`), affichée comme proposition à
  valider. Elle ne contient aucune règle : chaque scène devra être sourcée
  et relue avant d’être produite.
- **Hors périmètre** : les 19 scènes elles-mêmes, et les briques
  spécifiques listées dans le programme (non demandées à ce stade).

## D-027 — Coach pédagogique déterministe

- **Contexte** : prompt du porteur « coach pédagogique » (24/10/2026) :
  tout doit fonctionner sans API d’IA payante, avec des règles testables.
  Tranche Q-03 pour cette phase : pas de modèle de langage.
- **Règles** (`src/lib/coach/coach.ts`) :
  - compétences faibles : évaluées et non maîtrisées, fragiles d’abord, puis
    par score ;
  - leçons : non terminées, celles des compétences les plus faibles d’abord
    puis l’ordre du programme ; une leçon terminée n’est reproposée que si
    sa compétence reste fragile ;
  - révisions : échéances du moteur (D-021), dues aujourd’hui et 7 jours ;
  - examens : 5 derniers, examens officiels simulés réussis sur 30 jours,
    tendance (dernier contre moyenne des trois précédents, seuil 5 points) ;
  - objectif quotidien : plus bas si moins de la moitié est réalisée en
    moyenne sur les 7 jours précédents ; plus haut si les révisions et
    erreurs en attente dépassent l’objectif ; sinon inchangé ;
  - erreurs répétées : questions du carnet manquées au moins deux fois ;
  - préparation : aucune estimation sous 50 réponses en 30 jours ; borne
    basse de Wilson (95 %) du taux de bonnes réponses ; « prêt » seulement
    si cette borne atteint 87,5 %, avec 90 % des compétences évaluées et 3
    examens officiels simulés réussis sur 30 jours (tous réussis) ; plafonné
    à « en progrès » tant que moins de 90 % des réponses portent sur des
    questions validées. Toujours présenté comme une estimation.

## D-028 — Gamification équilibrée

- **XP** (`src/lib/coach/rewards.ts`) : bonne réponse 5, révision réussie à
  échéance 10, erreur corrigée 20, compétence maîtrisée 100 (une fois),
  leçon terminée 30, examen officiel simulé réussi 50, défi relevé 25.
- **Garde-fous** : mauvaise réponse = 0 XP (aucune pénalité) ; une fois par
  question et par jour ; 150 XP de réponse au plus par jour ; XP de réponse
  suspendus si moins de 40 % des 10 dernières réponses sont justes. Un test
  vérifie que répondre au hasard rapporte moins du tiers des XP d’une série
  sérieuse.
- **Niveaux** : 0, 100, 300, 600, 1 000 XP… (50 × n × (n − 1)).
- **Badges** : critères pédagogiques (leçon terminée, erreur corrigée,
  compétence maîtrisée, univers maîtrisé, 7 jours de révisions, révisions à
  jour, examen réussi, réponse juste dans chaque univers).
- **Défis quotidiens** : trois, tirés de l’état en début de journée
  (révisions dues, erreurs du carnet ou leçon, compétence la plus faible).
- **Série de révisions** : jours consécutifs avec au moins une révision
  arrivée à échéance.
- Tout est recalculé depuis l’historique (rien n’est stocké à part) ; les
  niveaux et badges ne débloquent rien et n’entrent pas dans la maîtrise ni
  dans l’indicateur de préparation. Données locales à l’appareil : aucun
  classement.

## D-029 — Professeur IA : architecture prête, mode sans IA par défaut

- **Contexte** : prompt du porteur « professeur IA » (24/10/2026), à
  implémenter « si une API et un budget sont disponibles ». **Ni l’un ni
  l’autre ne l’est** : l’abonnement Claude Pro ne donne pas accès à l’API,
  facturée à l’usage, et aucune dépense n’est autorisée. KODI fonctionne
  donc en **mode sans IA générative**, affiché sur la page, et aucun appel
  à une IA n’a jamais été fait (ni en développement, ni dans les tests).
- **Mode sans IA** : le professeur affiche les explications prédéfinies du
  catalogue (correction de la question, leçon liée, contenus trouvés par
  mots-clés), mot pour mot, avec leur statut de relecture et leurs sources.
  Rien n’est généré ; aucune réponse n’est inventée quand rien ne
  correspond.
- **Interface interchangeable** (`src/lib/tutor/provider.ts`) : un
  fournisseur n’a qu’une méthode `generate` et renvoie un texte ou une
  catégorie d’erreur ; tous les garde-fous sont hors de l’adaptateur.
  Adaptateur fourni : Anthropic, avec le SDK officiel `@anthropic-ai/sdk`
  (licence Apache-2.0, gratuit), testé avec un client simulé.
- **Activation** (côté serveur uniquement, `src/lib/tutor/config.ts`) : il
  faut à la fois `KODI_TUTOR_PROVIDER=anthropic`, `ANTHROPIC_API_KEY`, un
  budget quotidien `KODI_TUTOR_DAILY_BUDGET_USD` strictement positif et des
  tarifs connus. Une clé seule ne déclenche aucune dépense. Variables jamais
  préfixées `NEXT_PUBLIC_`, lues par un module `server-only` (un test le
  vérifie).
- **Modèle par défaut** : `claude-opus-5-5` (4 $ / 20 $ par million de
  jetons d’entrée / de sortie, tarifs relevés le 24/10/2026), effort
  `low`, 1 500 jetons de sortie au plus. Modèles moins chers configurables
  (`KODI_TUTOR_MODEL=claude-haiku-5-5` : 0,10 $ / 0,50 $) ; le choix revient
  au porteur (Q-15). Repli côté fournisseur (`fallbacks: "default"`) activé
  par défaut sauf sur Haiku : si le modèle refuse, le fournisseur relance la
  demande sur un autre modèle, facturé à ses tarifs ; le budget compte alors
  le pire cas (double). Désactivable avec `KODI_TUTOR_SERVER_FALLBACK=non`.
- **Sources** : seuls les contenus au statut « valide », hors démonstration,
  citant une source du registre, sont transmis à l’IA (3 au plus). Sans
  passage fiable, **aucun appel** : repli « aucune source fiable ». Avec 0
  contenu validé aujourd’hui, l’IA ne serait jamais appelée même connectée.
- **Consignes et vérification** : répondre uniquement à partir des sources,
  citer [S1]…, répondre `HORS_SOURCES` sinon. La réponse n’est affichée que
  si elle cite au moins une source fournie, n’en cite pas d’autre, et ne
  contient aucun nombre ni numéro d’article absent des sources. Sinon,
  refus, réponse tronquée, erreur ou panne du fournisseur : repli vers les
  explications prédéfinies, avec la raison affichée.
- **Quotas et coûts** : 5 demandes par minute et par client, 20 réponses IA
  par jour et par client, budget quotidien réservé **avant** l’appel sur le
  pire cas (jetons estimés à 1 pour 2 caractères + limite de sortie), puis
  ajusté au coût réel. Compteurs en mémoire du serveur : sur un hébergement
  à plusieurs instances, chaque instance a ses compteurs ; un stockage
  partagé (par exemple une table Supabase) sera nécessaire avant toute mise
  en ligne avec IA. Les limites par client reposent sur l’adresse transmise
  par l’hébergeur : contournables par qui la falsifie si l’hébergeur ne la
  réécrit pas ; le budget quotidien global reste la vraie limite de coût.
- **Données personnelles** : e-mails, téléphones, IBAN, plaques, longues
  suites de chiffres et liens sont retirés du message avant tout traitement.
  Le texte n’est jamais enregistré. Le client est identifié par une
  empreinte SHA-256 salée (sel tiré au démarrage, jamais stocké) de
  l’adresse IP et du navigateur. Avec une IA connectée, le texte masqué est
  transmis au fournisseur : à signaler dans la politique de confidentialité
  avant activation.
- **Journal minimal** : une ligne par demande (résultat, fournisseur,
  catégorie d’erreur, jetons, coût, nombre de masquages et de passages) ;
  jamais de texte, d’adresse IP ni d’empreinte.
- **Route** : `POST /api/professeur` (JSON de 4 Kio au plus, champs
  vérifiés, 500 caractères de texte au plus) ; page `/professeur`, ouverte
  aussi depuis chaque correction (« Demander au professeur »).

## D-030 — Freemium et paiements Stripe (prêts, non activés)

- **Contexte** : prompt du porteur « freemium » (24/10/2026). Stripe n’est
  pas configuré et aucun compte n’existe : l’intégration est prête, **aucun
  vrai paiement n’est activé** et les pages l’indiquent. Détail, sources et
  actions manuelles : `docs/PAIEMENTS.md`.
- **Offres** (`src/lib/billing/plans.ts`) : gratuit = cours essentiels, quiz,
  corrections, 1 examen par jour, scènes de découverte, coach basique ;
  Premium = tous les cours, examens illimités, toutes les scènes,
  statistiques avancées, coach étendu, IA selon les quotas. Prix envisagé
  4,99 € TTC par mois, affiché comme « à confirmer ».
- **Interprétations de l’agent** (à confirmer par le porteur) : « un examen
  blanc par jour » compte tous les modes, jour civil de Paris, examen
  abandonné compris ; coach basique = compétences faibles, leçons, objectif,
  erreurs répétées, indicateur de préparation ; coach étendu = planning des
  révisions sur 7 jours et suivi des examens ; statistiques avancées =
  réussite par mode et détail des sessions ; scène de découverte = la scène
  1 ; toutes les leçons actuelles sont « gratuit ».
- **Droits côté serveur** : `private.has_premium` (statuts `active`,
  `trialing`, `past_due`, fin de période + 2 jours) décide pour les examens
  (`KODI_DAILY_EXAM_LIMIT`), les leçons Premium (RLS) et l’IA du professeur.
  Les statistiques, le coach et les scènes sont calculés sur l’appareil : leur
  verrou est un choix d’offre, pas une protection de données.
- **Stripe** : SDK officiel `stripe` 23.0.1 (MIT), Checkout en mode
  `subscription`, portail client pour le moyen de paiement et les factures.
  Webhook à signature vérifiée sur le corps brut ; l’abonnement est relu
  chez Stripe à chaque événement (ordre non garanti) ; idempotence par
  l’identifiant d’événement, enregistré dans la même transaction que le
  changement ; erreur temporaire → 500 et nouvel envoi par Stripe.
- **Exception aux clés** : la clé serveur Supabase (`SUPABASE_SECRET_KEY`)
  est lue par `src/lib/billing/server.ts` (`server-only`) pour deux
  fonctions SQL réservées à `service_role` ; l’application ne l’utilise pour
  rien d’autre.
- **Test d’abord** : clé `sk_live_…` refusée sauf autorisation explicite,
  prix confirmé et informations du vendeur complètes ; mode test annoncé.
- **Résiliation et rétractation** : parcours en 3 clics (« Résilier votre
  contrat », récapitulatif, « Notifier la résiliation »), fin à l’échéance ;
  rétractation en ligne pendant le délai (« Renoncer au contrat ici »,
  « Confirmer la rétractation ») avec remboursement intégral, choix plus
  favorable que le minimum légal.

## Questions ouvertes

- **Q-01 — Hébergement de prévisualisation** : options gratuites à comparer
  au moment de la Phase 1 (conditions à vérifier sur les sites officiels le
  jour du choix) : Vercel (plan Hobby, réservé à un usage non commercial),
  Cloudflare, Netlify. Nécessite que le porteur crée un compte et relie le
  dépôt GitHub.
- **Q-02 — Hébergement de production** : un projet avec offre Premium est un
  usage commercial ; l’offre retenue devra l’autoriser.
- **Q-03 — Coach IA** (tranché pour le coach actuel : règles sans IA,
  D-027 ; architecture du professeur IA prête, en mode sans IA, D-029 ;
  reste ouvert pour l’activation, voir Q-15) : toute API de modèle de langage est facturée à
  l’usage ; l’abonnement Claude Pro ne couvre pas l’API. À arbitrer avant la
  Phase 9 (budget, ou coach non génératif fondé sur les explications
  vérifiées).
- ~~**Q-04 — Périmètre gratuit / Premium et prestataire de paiement**~~ :
  tranché par le prompt « freemium » (24/10/2026) : offres de D-030, Stripe.
- **Q-05 — Sources officielles** : identifier les textes de référence et leur
  version avant toute rédaction de question (Phase 3).
- ~~**Q-07 — Relecture des questions**~~ : tranché le 22/10/2026, le porteur
  relit les questions (liste dans `docs/RELECTURE.md`). Une question ne passe
  en « relue » que sur sa validation explicite.
- **Q-08 — Chronomètre** : ajouter un temps limité par question une fois la
  durée confirmée par une source officielle ?
- **Q-09 — Envoi des e-mails** : le service intégré de Supabase suffit aux
  essais ; un SMTP sera nécessaire pour de vrais utilisateurs (coût à
  vérifier).
- **Q-01 devient bloquante pour les comptes** : sans hébergement, les liens
  de confirmation et la connexion ne peuvent pas être utilisés depuis un
  iPhone.
- ~~**Q-10 — Onzième thème de l’examen**~~ : tranché le 24/10/2026 par le
  porteur : 10 univers tant qu’aucune source officielle ne précise le
  onzième thème.
- ~~**Q-11 — Répartition des 72 leçons**~~ : validée par le porteur le
  24/10/2026 (6, 7, 4, 8, 10, 9, 5, 6, 8, 9).
- **Q-12 — Modèles 3D réalistes** : véhicules et décors définitifs à
  créer ou à acquérir sous licence compatible (coût éventuel à arbitrer).
- **Q-13 — Mesures sur iPhone** : à faire sur un appareil réel (Safari),
  depuis le panneau « Afficher les mesures de performance ».
- ~~**Q-14 — Programme des 20 scènes**~~ : validation déléguée par le
  porteur le 24/10/2026 (« si pour toi c’est bon ») ; la liste proposée est
  retenue. Chaque scène reste à sourcer et à relire avant production.
- **Q-15 — Activer le professeur IA ?** Dépense future : à décider par le
  porteur. Il faudrait un compte sur la console Anthropic (facturation à
  l’usage, carte bancaire), une clé, un budget quotidien, un modèle (prix
  ci-dessus, D-029), un hébergement (Q-01), des contenus validés, un
  stockage partagé des quotas et une mise à jour de la politique de
  confidentialité. Ordre de grandeur calculé à partir des tarifs relevés
  (pas d’une mesure), à vérifier le jour venu : une réponse coûte au plus
  environ 0,04 $ avec le modèle par défaut (0,08 $ si le repli du
  fournisseur sert), environ 0,001 $ avec Haiku. Un budget de 0,50 $ par
  jour couvrirait donc au moins une douzaine de réponses avec le modèle par
  défaut.
- **Q-16 — Vendeur** : structure juridique (entreprise individuelle,
  société…), immatriculation, TVA (franchise ou non), adresse, directeur de
  la publication : nécessaires aux CGV et mentions légales avant toute
  vente. Aucune n’est inventée (`src/content/legal.ts` est vide).
- **Q-17 — Médiateur de la consommation** : obligatoire pour vendre aux
  particuliers ; à choisir (coût éventuel à vérifier).
- **Q-18 — Leçons Premium et dépôt public** : un texte Premium écrit dans
  `content/` est lisible sur GitHub. Options : dépôt de contenu privé,
  contenu Premium uniquement en base, ou garder tous les cours visibles et
  ne réserver que les services.
- **Q-19 — Accusés de réception par e-mail** (résiliation, rétractation) et
  résiliation sans connexion : nécessitent un envoi d’e-mails (Q-09) ; à
  mettre en place avant la production.
- **Q-20 — Coûts Stripe** : environ 0,36 € par mois et par abonné à 4,99 €
  (calcul à partir des tarifs publics, D-030) ; à confirmer avec le prix.
- **Q-21 — Interprétations du freemium** (D-030) : examens comptés, contenu
  du coach basique et étendu, statistiques avancées, scènes de découverte.
- **Q-06 — Dépôt public ou privé** : un dépôt privé protège le code, mais
  GitHub Actions y est limité à un quota gratuit de minutes.
