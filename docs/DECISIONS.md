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

## Questions ouvertes

- **Q-01 — Hébergement de prévisualisation** : options gratuites à comparer
  au moment de la Phase 1 (conditions à vérifier sur les sites officiels le
  jour du choix) : Vercel (plan Hobby, réservé à un usage non commercial),
  Cloudflare, Netlify. Nécessite que le porteur crée un compte et relie le
  dépôt GitHub.
- **Q-02 — Hébergement de production** : un projet avec offre Premium est un
  usage commercial ; l’offre retenue devra l’autoriser.
- **Q-03 — Coach IA** : toute API de modèle de langage est facturée à
  l’usage ; l’abonnement Claude Pro ne couvre pas l’API. À arbitrer avant la
  Phase 9 (budget, ou coach non génératif fondé sur les explications
  vérifiées).
- **Q-04 — Périmètre gratuit / Premium et prestataire de paiement.**
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
- **Q-06 — Dépôt public ou privé** : un dépôt privé protège le code, mais
  GitHub Actions y est limité à un quota gratuit de minutes.
