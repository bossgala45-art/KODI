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
- **Q-06 — Dépôt public ou privé** : un dépôt privé protège le code, mais
  GitHub Actions y est limité à un quota gratuit de minutes.
