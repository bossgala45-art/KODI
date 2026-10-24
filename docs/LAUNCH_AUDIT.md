# Audit de lancement de KODI

Date : 24/10/2026. Auteur : agent Claude Code, à la demande du porteur
(prompt « audit complet avant publication »). Version auditée : branche
`phase-11-audit`, issue de `phase-10-premium` (commit 91af56a).

## Verdict

**KODI n’est pas prêt à être publié.** Plusieurs fonctions obligatoires
manquent et des contrôles critiques échouent :

1. **0 question validée sur 2 000 visées** (72 rédigées, toutes non
   relues) : aucun examen ne peut être composé, aucun contenu n’est fiable
   pour un public.
2. **2 leçons sur 72**, toutes deux de démonstration.
3. **1 scène 3D sur 20.**
4. **Aucune PWA** : ni manifeste, ni icônes, ni service worker, ni hors
   ligne.
5. **Aucun service en ligne** : pas d’hébergement, pas de projet Supabase,
   pas de Stripe, pas d’envoi d’e-mails. Comptes, paiements et
   récupération de mot de passe n’ont jamais fonctionné en conditions
   réelles.
6. **Conformité absente** : ni politique de confidentialité, ni CGU, ni CGV,
   ni mentions légales ; pas de suppression du compte ni d’export des
   données depuis l’application ; aucune information sur le vendeur.
7. **Aucune mesure sur un iPhone réel.**

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

## Contrôles exécutés le 24/10/2026

Tous lancés dans la session cloud, après `npm ci` sur une copie propre.

| Contrôle | Commande | Résultat |
| --- | --- | --- |
| Installation | `npm ci` | ✅ réussie |
| Lint (zéro avertissement) | `npm run lint` | ✅ 0 erreur, 0 avertissement |
| Types | `npm run typecheck` | ✅ 0 erreur |
| Tests unitaires et composants | `npm test` | ✅ 451 / 451 (43 fichiers) |
| Compilation de production | `npm run build` | ✅ réussie |
| Sécurité de la base (PostgreSQL réel, toutes les migrations) | `npm run test:db` | ✅ 108 / 108 (8 fichiers) |
| Tests de bout en bout (Chromium, mobile Pixel 7 + ordinateur) | `npm run test:e2e` | ✅ 211 réussis, 1 ignoré (gestes tactiles, non automatisables) |
| Accessibilité (axe-core, WCAG 2.2 AA) | inclus dans les E2E | ✅ 0 violation sur les 27 écrans, thèmes clair et sombre ; aucun débordement à 320 px |
| Vulnérabilités des dépendances | `npm audit` | ✅ 0 (aucune critique, haute, moyenne ni basse) |
| Validation des contenus | `npm run content:check` | ✅ valide ; 0 contenu validé |
| CI GitHub | workflow `CI` | ✅ verte sur le dernier commit poussé (91af56a, phase 10) |

## Synthèse par domaine

| # | Domaine | Classe | Points bloquants |
| --- | --- | --- | --- |
| 1 | Architecture et qualité du code | ✅ | README périmé, pas de `global-error`, pas d’en-têtes de sécurité |
| 2 | Compilation et tests | ✅ | Gestes tactiles non testés automatiquement |
| 3 | Comptes et mot de passe | 🔌 | Pas de projet Supabase ni d’envoi d’e-mails (SMTP) ; pas de suppression de compte |
| 4 | Sécurité des données, RLS | ✅ (base) / 🔌 (en ligne) | Jamais déployée ; pas de `proxy` de session ; en-têtes HTTP absents |
| 5 | Correction des questions et examens | ✅ (moteur) / 🔌 (contenu) | 0 question validée : examens impossibles |
| 6 | Révisions adaptatives | 🟡 | Fonctionnent sur l’appareil ; non synchronisées avec le compte |
| 7 | Les 20 scènes 3D | 🟡 | 1 / 20 produite, éléments provisoires |
| 8 | Performances mobiles | 🟡 | Mesurées en émulation seulement, jamais sur iPhone |
| 9 | Accessibilité | ✅ (automatique) / 🧪 (manuel) | Aucun test avec VoiceOver ni sur appareil |
| 10 | PWA | ⛔ | Ni manifeste, ni icônes, ni service worker, ni hors ligne |
| 11 | Quotas et sécurité IA | ✅ (hors réseau) / 🔌 | Aucun fournisseur ni budget ; compteurs en mémoire |
| 12 | Paiements et abonnements | 🔌 | Stripe non configuré ; e-mails d’accusé absents |
| 13 | Conformité et confidentialité | ⛔ | Documents légaux, vendeur, RGPD (export, suppression) absents |
| 14 | Validité des contenus | 🔌 | Rien n’est relu ; Légifrance non consulté directement |
| 15 | Validation des 2 000 questions | ⛔ | 72 rédigées, 0 validée |
| 16 | Erreurs et restauration | 🟡 | Écrans d’erreur partiels ; pas de sauvegarde ni d’export des données locales |

## Détail par domaine

### 1. Architecture et qualité du code — ✅

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
| Suppression du compte par la personne | ⛔ | La base efface les données et anonymise le journal (testé), mais aucun bouton ni fonction ne permet de demander la suppression |
| Envoi d’e-mails pour de vrais utilisateurs | ⛔ | Le service intégré de Supabase est limité aux essais : un SMTP est nécessaire (Q-09, coût) |
| Rafraîchissement de session côté serveur | 🧪 | Pas de `proxy` Next.js pour rafraîchir la session à chaque requête ; les routes serveur peuvent voir une session expirée jusqu’au rafraîchissement par le navigateur. À vérifier avec un vrai projet |

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

### 6. Révisions adaptatives — 🟡

- Maîtrise (a priori bêta, demi-vie de 30 jours), répétition espacée de
  type SM-2, carnet d’erreurs, programme du jour, coach : ✅ testés, avec
  test de parité TypeScript / SQL.
- **Limite** : l’historique des réponses, les révisions et la progression
  des leçons restent **sur l’appareil**. Les fonctions SQL existent
  (`submit_practice_answer`, révisions), mais l’application ne les appelle
  pas : changer d’appareil ou effacer le navigateur fait perdre la
  progression.

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

### 10. Fonctionnement de la PWA — ⛔

Aucun manifeste, aucune icône d’application (seulement `favicon.ico`),
aucun service worker, aucun fonctionnement hors ligne. La spécification
(§ 4.9) les exige. La couleur de thème et `viewport-fit=cover` sont déjà
définis.

### 11. Quotas et sécurité IA — ✅ hors réseau, 🔌 service

- Mode sans IA générative actif et annoncé ; explications prédéfinies.
- Prêt et testé avec un client simulé : appels serveur uniquement, clé
  jamais exposée, sources limitées aux contenus validés, vérification des
  réponses (références, nombres, articles), repli sur erreur ou refus,
  limite de fréquence, quota quotidien, budget réservé au pire cas,
  masquage des données personnelles, journal minimal, réservé à Premium.
- **Bloqué** : aucun fournisseur ni budget (Q-15) ; 0 contenu validé (l’IA
  ne serait jamais appelée).
- **À corriger avant activation** : les compteurs (fréquence, quota,
  budget) sont en mémoire du serveur. Sur un hébergement à plusieurs
  instances, il faut un stockage partagé.

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

### 13. Conformité et confidentialité — ⛔

| Exigence | État |
| --- | --- |
| Mentions légales (éditeur, hébergeur, immatriculation…) | ⛔ page « pas encore publiée » ; informations du vendeur inconnues (Q-16) |
| CGV, médiateur de la consommation | ⛔ (Q-16, Q-17) |
| Conditions d’utilisation (CGU) | ⛔ ; la case d’inscription renvoie à des « documents en cours de rédaction » |
| Politique de confidentialité (finalités, durées, sous-traitants Supabase, Stripe, hébergeur, éventuel fournisseur d’IA) | ⛔ |
| Exercice des droits : export et suppression des données depuis l’application | ⛔ |
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
| Écran d’erreur racine (`global-error`) et du groupe `(focus)` | ⛔ |
| Sauvegarde ou export des données locales (progression) | ⛔ |
| Sauvegardes de la base et procédure de restauration | 🔌 (projet Supabase inexistant ; offre de sauvegarde du plan gratuit **[À VÉRIFIER]**) |
| Suivi des erreurs en production (journalisation, alertes) | ⛔ |

## Corrections nécessaires

### Bloquantes avant toute publication

| # | Correction | Qui |
| --- | --- | --- |
| B1 | Rédiger et faire valider des questions jusqu’à un volume suffisant (objectif 2 000 ; au minimum de quoi composer des examens officiels de 40 questions variés) | Agent (rédaction) + porteur (validation) |
| B2 | Rédiger les 70 leçons manquantes et faire valider les leçons | Agent + porteur |
| B3 | Produire les scènes 3D 2 à 20, ou réduire le périmètre annoncé | Agent + décision du porteur |
| B4 | Implémenter la PWA : manifeste, icônes, écran de démarrage, service worker, hors ligne du contenu déjà chargé | Agent |
| B5 | Synchroniser la progression pédagogique (réponses, révisions, leçons) avec le compte | Agent |
| B6 | Ajouter la suppression du compte et l’export des données depuis le profil | Agent |
| B7 | Rédiger la politique de confidentialité et les CGU ; corriger la case d’inscription | Agent (projet) + porteur (validation, idéalement juriste) |
| B8 | Informations du vendeur, mentions légales, CGV, médiateur (Q-16, Q-17) — seulement si Premium est vendu au lancement | Porteur |
| B9 | Hébergement compatible avec l’usage prévu, projet Supabase, SMTP (Q-01, Q-02, Q-09) | Porteur |
| B10 | Mesures de performance et d’accessibilité sur iPhone réel (Safari, VoiceOver) | Porteur, guidé par l’agent |

### Importantes (sécurité et robustesse)

| # | Correction | Qui |
| --- | --- | --- |
| I1 | En-têtes de sécurité HTTP (CSP, `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`) | Agent |
| I2 | `proxy` Next.js pour rafraîchir la session Supabase côté serveur, à valider sur un vrai projet | Agent |
| I3 | `global-error.tsx` et écran d’erreur du groupe `(focus)` | Agent |
| I4 | Accusés de réception par e-mail (résiliation, rétractation), résiliation sans connexion (Q-19) | Agent, après le SMTP |
| I5 | Stockage partagé des quotas et du budget IA avant toute activation de l’IA | Agent |
| I6 | Suivi des erreurs en production (sans données personnelles) | Agent + choix du porteur (service gratuit à vérifier) |
| I7 | Mettre à jour `README.md` | Agent (fait dans ce commit) |

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
   connexion sur deux appareils, mot de passe oublié, synchronisation,
   examen (avec questions validées), suppression du compte.
6. **Paiements**, si Premium est vendu : suivre `docs/PAIEMENTS.md` (Stripe
   en mode test, essais complets, puis production seulement après les
   documents légaux et ta validation).
7. **IA**, si activée : décision Q-15, budget, stockage partagé des quotas.
8. **iPhone** : installer la PWA, mesurer (panneau de performances de la
   scène), tester VoiceOver, le mode hors ligne, le thème sombre.
9. **Juridique** : mentions légales, CGU, politique de confidentialité, et
   si vente CGV et médiateur, publiés et liés depuis chaque page.
10. **Lancement** : lever le `noindex` (`src/app/layout.tsx`), fusionner
    les branches sur la branche principale, déployer. **Uniquement sur ton
    accord explicite.**
