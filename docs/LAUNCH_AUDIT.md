# Audit de lancement de KODI

Audit : 24/10/2026. Mise à jour après corrections : 25/10/2026.
Auteur : agent Claude Code, à la demande du porteur (prompt « audit
complet avant publication », puis « fais toutes les corrections »).
Branche `phase-11-audit`, issue de `phase-10-premium`.

## Verdict

**KODI n’est toujours pas prêt à être publié**, même après les corrections
du 25/10/2026 (voir « Corrections effectuées »). Restent bloquants :

1. **0 question validée sur 2 000 visées** (72 rédigées, toutes non
   relues) : aucun examen ne peut être composé, aucun contenu n’est fiable
   pour un public.
2. **2 leçons sur 72**, toutes deux de démonstration.
3. **1 scène 3D sur 20.**
4. **Aucun service en ligne** : pas d’hébergement, pas de projet Supabase,
   pas de Stripe, pas d’envoi d’e-mails. Comptes, synchronisation,
   paiements et récupération de mot de passe n’ont jamais fonctionné en
   conditions réelles.
5. **Identité de l’éditeur inconnue** : mentions légales, CGV et médiateur
   impossibles à compléter ; politique de confidentialité et CGU restent
   des projets non validés juridiquement.
6. **Aucune mesure sur un iPhone réel** (performances, VoiceOver, PWA
   installée).

Les points 1 à 3 demandent un long travail de rédaction **et ta relecture
question par question** ; les points 4 à 6 dépendent de comptes, de
dépenses ou d’informations que toi seul peux fournir.

Ce qui est solide : le code se compile sans erreur ni avertissement, toutes
les suites de tests passent (détail ci-dessous), la sécurité de la base est
vérifiée sur un vrai PostgreSQL, et les fonctions non connectées le disent à
l’écran au lieu de simuler.

## Légende

| Classe | Sens |
| --- | --- |
| ✅ Opérationnelle et testée | Fonctionne et des tests automatisés le prouvent dans les conditions de l’app actuelle |
| 🧪 Implémentée mais non testée | Code présent, sans test qui prouve le fonctionnement réel |
| 🟡 Partiellement implémentée | Une partie du périmètre existe |
| ⛔ Non implémentée | Absente |
| 🔌 Bloquée par une dépendance externe | Code prêt et testé hors réseau, mais le service requis n’existe pas (compte, clé, hébergement, relecture) |

## Contrôles exécutés le 25/10/2026 (après corrections)

Tous lancés dans la session cloud, après `npm ci` sur une copie propre.
Résultats du 24/10 (avant corrections) : 451 tests unitaires, 108 tests de
base, 211 tests de bout en bout, tous réussis.

| Contrôle | Commande | Résultat |
| --- | --- | --- |
| Installation | `npm ci` | ✅ réussie |
| Lint (zéro avertissement) | `npm run lint` | ✅ 0 erreur, 0 avertissement (après correction d’un avertissement dans `scripts/icons.mjs`) |
| Types | `npm run typecheck` | ✅ 0 erreur |
| Tests unitaires et composants | `npm test` | ✅ 481 / 481 (50 fichiers) |
| Compilation de production | `npm run build` | ✅ réussie |
| Sécurité de la base (PostgreSQL réel, toutes les migrations) | `npm run test:db` | ✅ 119 / 119 (10 fichiers) |
| Tests de bout en bout (Chromium, mobile Pixel 7 + ordinateur) | `npm run test:e2e` | ✅ 235 réussis, 1 ignoré (gestes tactiles, non automatisables) |
| Accessibilité (axe-core, WCAG 2.2 AA) | inclus dans les E2E | ✅ 0 violation sur les 30 écrans, thèmes clair et sombre ; aucun débordement à 320 px |
| Vulnérabilités des dépendances | `npm audit` | ✅ 0 (aucune critique, haute, moyenne ni basse) |
| Validation des contenus | `npm run content:check` | ✅ valide ; 0 contenu validé |
| CI GitHub | workflow `CI` | ✅ verte sur l’audit (d579d66) ; à revérifier sur le commit des corrections |

## Synthèse par domaine

| # | Domaine | Classe | Points bloquants |
| --- | --- | --- | --- |
| # | Domaine | Avant (24/10) | Après corrections (25/10) | Reste bloquant |
| --- | --- | --- | --- | --- |
| 1 | Architecture et qualité du code | ✅ (défauts) | ✅ | — |
| 2 | Compilation et tests | ✅ | ✅ | Gestes tactiles non testés automatiquement |
| 3 | Comptes et mot de passe | 🔌 | 🔌 (suppression du compte ✅ en base et en interface) | Pas de projet Supabase ni de SMTP |
| 4 | Sécurité des données, RLS | ✅ / 🔌 | ✅ en base, en-têtes et proxy ✅ / 🔌 en ligne | Base jamais déployée |
| 5 | Correction des questions et examens | ✅ / 🔌 | ✅ moteur / 🔌 contenu | 0 question validée |
| 6 | Révisions adaptatives | 🟡 | ✅ sur l’appareil, synchronisation ✅ hors réseau / 🔌 en ligne | Supabase non configuré |
| 7 | Les 20 scènes 3D | 🟡 | 🟡 | 19 scènes à produire |
| 8 | Performances mobiles | 🟡 | 🟡 | Aucune mesure sur iPhone |
| 9 | Accessibilité | ✅ / 🧪 | ✅ automatique / 🧪 manuelle | VoiceOver non testé |
| 10 | PWA | ⛔ | ✅ (manifeste, icônes, service worker, hors ligne testés) | Installation sur iPhone non vérifiée |
| 11 | Quotas et sécurité IA | ✅ / 🔌 | ✅ (quotas partagés en base) / 🔌 | Aucun fournisseur ni budget (Q-15) |
| 12 | Paiements et abonnements | 🔌 | 🔌 | Stripe non configuré ; e-mails d’accusé |
| 13 | Conformité et confidentialité | ⛔ | 🟡 (export, suppression, projets de politique et de CGU) | Éditeur inconnu, documents non validés |
| 14 | Validité des contenus | 🔌 | 🔌 | Relecture du porteur |
| 15 | Validation des 2 000 questions | ⛔ | ⛔ | 72 rédigées, 0 validée |
| 16 | Erreurs et restauration | 🟡 | ✅ (écrans d’erreur, sauvegarde et restauration locales) / 🔌 (sauvegarde de la base) / ⛔ (suivi des erreurs) | Service de suivi à choisir |

## Corrections effectuées le 25/10/2026

| # | Correction | Preuve |
| --- | --- | --- |
| I1 | En-têtes de sécurité : CSP (sources limitées au site et au projet Supabase, `frame-ancestors 'none'`, `object-src 'none'`), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS | `src/lib/security-headers.ts` ; tests unitaires et E2E ; aucun écran cassé (235 E2E) |
| I2 | `src/proxy.ts` : rafraîchit la session Supabase à chaque requête (modèle @supabase/ssr), sauf fichiers statiques, service worker et webhook | Tests unitaires (mode local, chemins exclus) ; **à valider avec un vrai projet** |
| I3 | `global-error.tsx` et écran d’erreur du groupe `(focus)` | Compilation ; même composant que les onglets |
| B4 | PWA : manifeste, icônes 192/512/maskable et Apple (dessinées par `scripts/icons.mjs`, sans ressource tierce), service worker (fichiers en cache, pages en réseau d’abord, page « Hors ligne »), jamais de cache pour `/api/`, `/auth/` et les réponses `no-store` | `src/lib/sw.test.ts` (hors ligne simulé), E2E (manifeste, icônes, cache réel du navigateur) |
| B5 | Progression synchronisée : réponses, leçons, séries ; fusion par union (rien n’est perdu), écriture conditionnée à la version (conflit entre appareils → relecture et refusion), file d’attente hors ligne ; jamais d’envoi des données d’un autre compte ; à la déconnexion, retrait de la progression déjà enregistrée | `learning_states` + `save_learning_state` (tests PostgreSQL), `src/lib/sync/learning.ts` et moteur (tests) |
| B6 | Suppression du compte (confirmation « SUPPRIMER », refus si abonnement payant non résilié, journal anonymisé) ; export de toutes les données du compte | `delete_my_account`, `export_my_data` (tests PostgreSQL), écran Profil (tests de composant) |
| B7 | Politique de confidentialité et conditions d’utilisation **en projet**, fidèles au code, sans identité inventée ; case d’inscription reliée aux deux pages | Pages `/confidentialite`, `/conditions-utilisation` (accessibilité E2E) |
| I5 | Quotas et budget de l’IA partagés en base entre les instances (fréquence par minute, quota par jour, budget réservé au pire cas), avec repli prudent en cas de panne (aucune dépense) | Migration `20261026130000_tutor_quotas.sql` (tests PostgreSQL), `shared-limits.ts` (tests) |
| R16 | Sauvegarde et restauration des données de l’appareil (fichier JSON, fusion sans effacement, fichier vérifié) | `src/lib/backup.ts` (tests), écran Profil (tests) |
| I7 | `README.md` à jour | — |

**Non corrigé, et pourquoi** :
- **B1, B2, B3 (contenus)** : rédiger 1 928 questions, 70 leçons et 19
  scènes exige pour chacune une source officielle lue et ta validation un
  par un. Produire ce volume d’un coup, sans relecture, irait contre les
  règles du projet (aucun contenu non vérifié présenté comme fiable). C’est
  un travail à mener par lots, au fil de tes validations.
- **B8, B9, B10, I4, I6** : dépendent de toi (identité de l’éditeur,
  comptes, dépenses, iPhone, choix d’un service de suivi des erreurs et
  d’un SMTP).

## Détail par domaine

### 1. Architecture et qualité du code — ✅ (défauts corrigés le 25/10 : I1, I3, I7)

- Next.js 16.4.2 (App Router, Cache Components), React 19.3, TypeScript
  strict (`noUncheckedIndexedAccess`), Tailwind 4, ESLint sans
  avertissement. Environ 15 000 lignes hors tests, 43 fichiers de tests.
- Logique pure séparée et testée (`src/lib/` : pédagogie, examens, coach,
  simulation, professeur, paiements) ; composants dans `src/components/` ;
  contenus versionnés dans `content/` avec un verrou des statuts.
- Secrets : un test interdit toute lecture de variable secrète hors des deux
  modules `server-only` prévus, et toute clé dans le code.
- **À corriger** :
  - `README.md` est périmé (annonce la phase 2 et dit Three.js non
    installé) ;
  - pas de `src/app/global-error.tsx` et pas d’écran d’erreur pour le groupe
    `(focus)` (connexion, inscription…) ;
  - aucun en-tête de sécurité HTTP (Content-Security-Policy,
    `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`) dans
    `next.config.ts`.

### 2. Compilation et tests automatisés — ✅

Voir le tableau des contrôles. Limites : les gestes tactiles de la scène 3D
(pincer, tourner) ne sont pas testables automatiquement (1 test ignoré).
Les tests E2E tournent sans Supabase ni Stripe : ils vérifient le mode
local et les refus honnêtes, pas les parcours en ligne.

### 3. Comptes et récupération de mot de passe — 🔌

| Fonction | Classe | Preuve / limite |
| --- | --- | --- |
| Inscription, connexion, déconnexion, validation des saisies | 🔌 | Tests de composants avec client simulé ; jamais exécutées contre un vrai projet Supabase |
| Mot de passe oublié (même réponse que le compte existe ou non), réinitialisation | 🔌 | Testées en composant ; l’e-mail n’a jamais été envoyé |
| Liens e-mail (`/auth/confirm`, `token_hash`, redirection limitée) | 🔌 | Modèles d’e-mail prêts (`supabase/templates/`) ; non déployés |
| Mode local sans compte | ✅ | E2E |
| Création automatique du profil, de l’offre gratuite, journal d’audit | ✅ | Tests PostgreSQL |
| Suppression du compte par la personne | ✅ (corrigé le 25/10) | `delete_my_account` testé sur PostgreSQL, bouton dans Profil testé ; jamais exécuté sur un vrai projet |
| Envoi d’e-mails pour de vrais utilisateurs | ⛔ | Le service intégré de Supabase est limité aux essais : un SMTP est nécessaire (Q-09, coût) |
| Rafraîchissement de session côté serveur | 🧪 (corrigé le 25/10) | `src/proxy.ts` ajouté ; non vérifiable sans vrai projet Supabase |

### 4. Sécurité des données et politiques RLS — ✅ en base, 🔌 en ligne

Vérifié par `npm run test:db` sur PostgreSQL réel, avec toutes les
migrations :

- RLS activée sur toutes les tables ; droits de table et de colonne
  minimaux ; aucune lecture directe des bonnes réponses ;
- `search_path` fixé pour toutes les fonctions `SECURITY DEFINER` ; aucune
  fonction de l’application appelable par un visiteur anonyme ; seules deux
  fonctions internes, sans argument, exposées aux politiques ;
- impossible de s’attribuer Premium, de modifier un score, un examen ou le
  journal d’audit ;
- écriture des abonnements réservée à `service_role`.

Non vérifié : la base n’a jamais été déployée sur Supabase (aucun projet),
donc ni sa configuration réelle (authentification, région, sauvegardes), ni
la protection contre les abus (limites de fréquence de Supabase Auth).

### 5. Correction des questions et examens — ✅ moteur, 🔌 contenu

- Correction tout ou rien avec détail (oublis, réponses cochées à tort),
  testée en TypeScript et en SQL.
- Quatre modes (officiel 40 questions, réussite à 35 ; express 10 ; ciblé
  20 ; revanche), correction côté serveur, résistance aux manipulations,
  1 examen par jour en gratuit : tous testés sur PostgreSQL.
- **Bloquant** : un examen ne tire que des questions validées. Il y en a
  0 : aucun examen ne peut être lancé. Le message l’explique à l’écran.
- La simulation n’est pas une reproduction fidèle de l’épreuve (questions
  originales, sans photos ni vidéos, sans limite de temps) ; c’est affiché.

### 6. Révisions adaptatives — ✅ sur l’appareil, synchronisation 🔌 (corrigée le 25/10)

- Maîtrise (a priori bêta, demi-vie de 30 jours), répétition espacée de
  type SM-2, carnet d’erreurs, programme du jour, coach : ✅ testés, avec
  test de parité TypeScript / SQL.
- **Corrigé le 25/10** : l’historique des réponses, les leçons terminées et
  les séries sont synchronisés avec le compte (`learning_states`), par
  union sans perte, avec contrôle de version et file d’attente hors ligne.
  Sans compte, la sauvegarde dans un fichier permet de changer d’appareil.
- Les révisions sont recalculées à partir de l’historique : elles suivent
  donc automatiquement.

### 7. Les 20 scènes 3D — 🟡

| Élément | Classe |
| --- | --- |
| Scène 1 « Intersection sans signalisation » (4 caméras, sélection, sons, sous-titres, version 2D, question, ordre de passage vérifié par test) | ✅ (rendu logiciel) |
| Architecture réutilisable (voiries, usagers, règles de passage, contrôles automatiques) | ✅ |
| Scènes 2 à 20 | ⛔ (prévues dans `plan.ts`, ni rédigées ni sourcées) |
| Modèles 3D réalistes | ⛔ (formes géométriques provisoires, signalées à l’écran ; Q-12) |
| Gestes tactiles | 🧪 (non testables automatiquement) |

### 8. Performances sur mobile — 🟡

Mesures **réellement effectuées le 24/10/2026** dans la session cloud :
Chromium sans interface, émulation Pixel 7, serveur de production local
(`next start`), cache vide. **Ce ne sont pas des mesures sur iPhone.**

| Page | JavaScript transféré | Total transféré | FCP sans ralentissement | FCP avec 4G lente (1,6 Mbit/s, 150 ms) et processeur ×4 | Chargement complet (mêmes conditions) |
| --- | --- | --- | --- | --- | --- |
| Accueil | 308 Kio | 427 Kio | 116 ms | 672 ms | 2 130 ms |
| Entraînement | 280 Kio | 383 Kio | 112 ms | 692 ms | 1 965 ms |
| Scène 3D | 547 Kio | 662 Kio | 96 ms | 696 ms | 2 059 ms |
| Leçon | 287 Kio | 400 Kio | 92 ms | — | — |
| Professeur | 289 Kio | 400 Kio | 248 ms | — | — |

Budget de la scène 3D (`performance.ts`) respecté et vérifié par les tests.
Images par seconde mesurées seulement en rendu logiciel (19,6 à 60,1 i/s,
docs/SCENES.md). **À faire** : mesures sur un iPhone réel dans Safari (Q-13)
et sur un réseau mobile réel, après mise en ligne.

### 9. Accessibilité — ✅ automatique, 🧪 manuelle

- axe-core (WCAG 2.0 à 2.2, niveaux A et AA) : 0 violation sur 27 écrans,
  en thème clair et sombre, sur mobile et ordinateur.
- Aucun débordement horizontal à 320 px, même avec une police de repli plus
  large.
- Navigation au clavier testée sur plusieurs parcours (thème, formulaires,
  quiz).
- Animations neutralisées quand l’appareil demande à les réduire (testé).
- **Non fait** : test avec VoiceOver (iPhone) ou TalkBack, zoom à 200 %,
  test par des personnes concernées.

### 10. Fonctionnement de la PWA — ✅ (corrigée le 25/10), 🧪 sur iPhone

- Manifeste (`/manifest.webmanifest`), icônes 192, 512, maskable et Apple,
  mode plein écran, couleur de thème.
- Service worker (`public/sw.js`, enregistré en production) : fichiers de
  l’application en cache, pages en réseau d’abord puis dernière version
  consultée, page « Hors ligne » pour une page jamais ouverte. Jamais de
  cache pour l’API, l’authentification et les réponses `no-store`.
- Tests : comportement hors ligne simulé (`src/lib/sw.test.ts`), contenu
  réel du cache dans Chromium, manifeste et icônes (E2E).
- **Limite** : la simulation « hors ligne » de Playwright ne s’applique pas
  aux requêtes du service worker ; l’installation et le hors ligne doivent
  être vérifiés sur un iPhone réel.

### 11. Quotas et sécurité IA — ✅ hors réseau, 🔌 service

- Mode sans IA générative actif et annoncé ; explications prédéfinies.
- Prêt et testé avec un client simulé : appels serveur uniquement, clé
  jamais exposée, sources limitées aux contenus validés, vérification des
  réponses (références, nombres, articles), repli sur erreur ou refus,
  limite de fréquence, quota quotidien, budget réservé au pire cas,
  masquage des données personnelles, journal minimal, réservé à Premium.
- **Bloqué** : aucun fournisseur ni budget (Q-15) ; 0 contenu validé (l’IA
  ne serait jamais appelée).
- **Corrigé le 25/10** : avec la clé serveur Supabase, les compteurs
  (fréquence, quota, budget) sont partagés en base entre toutes les
  instances ; en cas de panne de la base, aucune dépense n’est engagée.
  Sans cette clé, ils restent en mémoire (un seul serveur).

### 12. Paiements et abonnements — 🔌

- Prêt et testé sans réseau : Checkout et Billing, webhook à signature
  vérifiée (vraie vérification du SDK Stripe, rejeu refusé), idempotence
  (PostgreSQL), statuts et échecs de paiement, portail client, résiliation
  en 3 clics, rétractation avec remboursement, mode test d’abord,
  production bloquée par le code.
- **Bloqué** : aucun compte Stripe, aucun hébergement commercial (le plan
  Hobby de Vercel l’interdit), prix non confirmé.
- **Manquant** : accusés de réception par e-mail ; résiliation sans
  connexion (Q-19) ; libellé du bouton de Stripe Checkout à vérifier.

### 13. Conformité et confidentialité — 🟡 (en partie corrigée le 25/10)

| Exigence | État |
| --- | --- |
| Mentions légales (éditeur, hébergeur, immatriculation…) | ⛔ page « pas encore publiée » ; informations du vendeur inconnues (Q-16) |
| CGV, médiateur de la consommation | ⛔ (Q-16, Q-17) |
| Conditions d’utilisation (CGU) | 🟡 projet publié (`/conditions-utilisation`), non validé juridiquement ; case d’inscription reliée |
| Politique de confidentialité | 🟡 projet publié (`/confidentialite`), fidèle au code ; responsable du traitement à désigner ; non validée juridiquement |
| Exercice des droits : export et suppression des données depuis l’application | ✅ (corrigé le 25/10, testé hors réseau) |
| Cookies et traceurs | 🧪 seulement le stockage local de l’application et les cookies de session Supabase, sans mesure d’audience ; l’absence de consentement requis pour ces usages est **[À VÉRIFIER]** auprès de la CNIL |
| Registre des traitements, contrats de sous-traitance, région des données | ⛔ (à faire par le porteur) |
| Indexation par les moteurs de recherche | ✅ bloquée (`noindex`), à lever seulement au lancement |

Les obligations commerciales vérifiées le 24/10/2026 sont listées dans
`docs/PAIEMENTS.md`, avec leurs sources.

### 14. Validité des contenus pédagogiques — 🔌

- 10 univers et 20 compétences « à vérifier », 2 leçons de démonstration,
  72 questions (69 « à vérifier », 3 de démonstration) : **aucun contenu
  validé**.
- Les sources citées sont des pages officielles réellement lues
  (Sécurité routière, Service-Public). Les articles du code de la route sont
  ceux que ces pages citent : **Légifrance n’a pas pu être consulté**
  depuis l’environnement de développement.
- La validation se fait question par question par le porteur
  (`docs/RELECTURE.md`). Une relecture par une personne qualifiée
  (enseignant de la conduite) reste à organiser **[À VÉRIFIER]**.

### 15. État de validation des 2 000 questions — ⛔

| | Nombre |
| --- | --- |
| Objectif (spécification § 4.2) | 2 000 questions vérifiées |
| Rédigées | 72 |
| Validées | **0** |
| À vérifier | 69 |
| Démonstration (jamais validables) | 3 |
| Restant à rédiger | 1 928 |

### 16. Gestion des erreurs et restauration — 🟡

| Élément | Classe |
| --- | --- |
| Écran d’erreur des onglets avec « Réessayer » | ✅ |
| Page introuvable (404) | ✅ (E2E) |
| Erreurs serveur traduites en messages clairs (codes `KODI_…`) | ✅ |
| Coupure réseau pendant la connexion, file d’attente hors ligne de la synchronisation du profil | ✅ (tests) |
| Données locales illisibles ou stockage bloqué : repli sans plantage | ✅ (tests) |
| Contexte 3D perdu : passage automatique en 2D | ✅ |
| Erreur de paiement ou d’IA : jamais présentée comme un succès | ✅ |
| Écran d’erreur racine (`global-error`) et du groupe `(focus)` | ✅ (corrigé le 25/10) |
| Sauvegarde et restauration des données de l’appareil | ✅ (corrigé le 25/10, tests) |
| Sauvegardes de la base et procédure de restauration | 🔌 (projet Supabase inexistant ; offre de sauvegarde du plan gratuit **[À VÉRIFIER]**) |
| Suivi des erreurs en production (journalisation, alertes) | ⛔ |

## Corrections nécessaires

### Bloquantes avant toute publication

| # | Correction | Qui | État au 25/10 |
| --- | --- | --- | --- |
| B1 | Rédiger et faire valider des questions jusqu’à un volume suffisant (objectif 2 000 ; au minimum de quoi composer des examens officiels de 40 questions variés) | Agent (rédaction) + porteur (validation) | ⛔ à faire par lots, avec ta validation |
| B2 | Rédiger les 70 leçons manquantes et faire valider les leçons | Agent + porteur | ⛔ à faire par lots |
| B3 | Produire les scènes 3D 2 à 20, ou réduire le périmètre annoncé | Agent + décision du porteur | ⛔ à faire, ou périmètre à réduire |
| B4 | Implémenter la PWA : manifeste, icônes, écran de démarrage, service worker, hors ligne du contenu déjà chargé | Agent | ✅ fait |
| B5 | Synchroniser la progression pédagogique (réponses, révisions, leçons) avec le compte | Agent | ✅ fait (à vérifier en ligne) |
| B6 | Ajouter la suppression du compte et l’export des données depuis le profil | Agent | ✅ fait (à vérifier en ligne) |
| B7 | Rédiger la politique de confidentialité et les CGU ; corriger la case d’inscription | Agent (projet) + porteur (validation, idéalement juriste) | 🟡 projets faits, validation juridique à faire |
| B8 | Informations du vendeur, mentions légales, CGV, médiateur (Q-16, Q-17) — seulement si Premium est vendu au lancement | Porteur | 🔌 en attente de tes informations |
| B9 | Hébergement compatible avec l’usage prévu, projet Supabase, SMTP (Q-01, Q-02, Q-09) | Porteur | 🔌 en attente de tes décisions |
| B10 | Mesures de performance et d’accessibilité sur iPhone réel (Safari, VoiceOver) | Porteur, guidé par l’agent | 🔌 après mise en ligne |

### Importantes (sécurité et robustesse)

| # | Correction | Qui | État au 25/10 |
| --- | --- | --- | --- |
| I1 | En-têtes de sécurité HTTP (CSP, `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`) | Agent | ✅ fait |
| I2 | `proxy` Next.js pour rafraîchir la session Supabase côté serveur, à valider sur un vrai projet | Agent | ✅ fait (à vérifier en ligne) |
| I3 | `global-error.tsx` et écran d’erreur du groupe `(focus)` | Agent | ✅ fait |
| I4 | Accusés de réception par e-mail (résiliation, rétractation), résiliation sans connexion (Q-19) | Agent, après le SMTP | 🔌 après le SMTP |
| I5 | Stockage partagé des quotas et du budget IA avant toute activation de l’IA | Agent | ✅ fait |
| I6 | Suivi des erreurs en production (sans données personnelles) | Agent + choix du porteur (service gratuit à vérifier) | 🔌 choix du service |
| I7 | Mettre à jour `README.md` | Agent | ✅ fait |

### Souhaitables

- Modèles 3D réalistes sous licence vérifiée (Q-12).
- Test des gestes tactiles sur appareil.
- Relecture des contenus par un enseignant de la conduite.

## Étapes manuelles de mise en production

**Rien n’a été publié.** Aucune de ces étapes ne doit être faite sans ton
accord explicite, et seulement après les corrections bloquantes.

1. **Décisions** : périmètre du lancement (gratuit seul, ou avec Premium),
   budget mensuel (hébergement, e-mails, IA éventuelle).
2. **Hébergement** : choisir un hébergeur (conditions commerciales à
   vérifier le jour même), relier le dépôt GitHub, obtenir l’adresse
   `https://…`.
3. **Supabase** : créer le projet (région UE), suivre `docs/SUPABASE.md`
   (authentification, modèles d’e-mail, URL de redirection, déploiement des
   migrations par GitHub Actions), configurer un SMTP.
4. **Variables chez l’hébergeur** : `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, et seulement si utilisées les
   variables serveur de `.env.example` (paiements, IA). Jamais dans le
   dépôt.
5. **Essais en préproduction** : inscription, confirmation d’e-mail,
   connexion sur deux appareils, mot de passe oublié, synchronisation du
   profil et de la progression (réponses sur un appareil, visibles sur
   l’autre), examen (avec questions validées), export des données,
   suppression du compte.
6. **Paiements**, si Premium est vendu : suivre `docs/PAIEMENTS.md` (Stripe
   en mode test, essais complets, puis production seulement après les
   documents légaux et ta validation).
7. **IA**, si activée : décision Q-15, budget, et `SUPABASE_SECRET_KEY`
   chez l’hébergeur pour les quotas partagés.
8. **iPhone** : installer la PWA, mesurer (panneau de performances de la
   scène), tester VoiceOver, le mode hors ligne, le thème sombre.
9. **Juridique** : mentions légales, CGU, politique de confidentialité, et
   si vente CGV et médiateur, publiés et liés depuis chaque page.
10. **Lancement** : lever le `noindex` (`src/app/layout.tsx`), fusionner
    les branches sur la branche principale, déployer. **Uniquement sur ton
    accord explicite.**
