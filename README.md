# KODI

Application web progressive (PWA) française de préparation au code de la route,
mobile-first, destinée à être installable sur iPhone, Android et ordinateur.

> **Statut (24/10/2026) : en développement, pas prêt à être publié.**
> Voir l’audit de lancement : [docs/LAUNCH_AUDIT.md](docs/LAUNCH_AUDIT.md).
> 72 questions rédigées, aucune validée ; 2 leçons de démonstration ; 1 scène
> 3D sur 20 ; aucun service en ligne configuré (hébergement, Supabase,
> Stripe, IA). Sans compte, les données restent dans le navigateur.

## Documentation

| Document | Contenu |
| --- | --- |
| [docs/SPECIFICATION.md](docs/SPECIFICATION.md) | Ce que KODI doit faire, contraintes de contenu et de qualité |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phases, livrables et critères de validation |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Journal des décisions techniques et questions ouvertes |
| [docs/CONTENU.md](docs/CONTENU.md) | Écrire, importer et valider les contenus pédagogiques |
| [docs/SCENES.md](docs/SCENES.md) | Scènes de simulation 3D : fonctionnement, éléments provisoires, performances |
| [docs/PAIEMENTS.md](docs/PAIEMENTS.md) | Freemium, Stripe, obligations commerciales, actions manuelles |
| [docs/LAUNCH_AUDIT.md](docs/LAUNCH_AUDIT.md) | Audit de lancement : état réel, corrections, mise en production |
| [AGENTS.md](AGENTS.md) | Règles pour les agents IA qui travaillent sur le dépôt |

## Pile technique

- [Next.js](https://nextjs.org) 16.4 (App Router, Cache Components) · React 19
- TypeScript 5 en mode strict renforcé
- Tailwind CSS 4
- ESLint 9 (`eslint-config-next`)
- Vitest + Testing Library (tests unitaires et composants)
- Playwright (tests de bout en bout, Chromium) + axe-core (audit WCAG)

- Supabase (Auth, PostgreSQL, RLS, Realtime) — migrations dans `supabase/`

- Three.js 0.186 et React Three Fiber 9.8 (scènes 3D)
- SDK officiels Stripe et Anthropic (prêts, non activés : docs/PAIEMENTS.md, D-029)

PWA : manifeste, icônes, service worker et hors ligne des pages déjà
consultées (D-031), à vérifier sur iPhone.

## Commandes

Prérequis : Node.js 22 ou plus récent.

```bash
npm ci                 # installe les dépendances (versions verrouillées)
npm run dev            # serveur de développement sur http://localhost:3000
npm run lint           # ESLint, zéro avertissement toléré
npm run typecheck      # génère les types de routes puis tsc --noEmit
npm test               # tests unitaires et composants (Vitest)
npm run build          # build de production
npm run test:e2e       # tests navigateur (nécessite un build préalable)
npm run test:db        # tests de sécurité de la base (PostgreSQL requis)
npm run content:build  # valide content/ et régénère catalogue + supabase/seed/content.sql
npm run relecture      # régénère docs/RELECTURE.md
npm run check          # lint + typecheck + tests + build
```

Pour les tests de bout en bout hors environnement cloud Claude Code, installer
d’abord le navigateur : `npx playwright install chromium`. Dans l’environnement
cloud, Chromium est déjà présent :

```bash
PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e
```

## Intégration continue

Le workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) exécute
lint, typecheck, tests, build et tests de bout en bout à chaque push et pull
request. Le dépôt étant public, GitHub Actions est gratuit sur les runners
standards. Les résultats sont consultables depuis l’onglet **Actions** du dépôt,
y compris depuis un iPhone.

## Structure

```
src/
  app/
    (tabs)/      écrans avec navigation à onglets : / (Accueil), apprendre,
                 simuler, entrainement, progression, profil, premium
    (focus)/     parcours sans onglets : connexion, inscription, bienvenue
  components/
    ui/          design system (boutons, cartes, champs, alertes…)
  content/       catalogue généré, sources, phases du projet, démonstration
  lib/           logique pure et testée (moteur pédagogique, contenus, quiz,
                 statistiques, validation, stockage local, thème)
content/         univers, compétences, leçons et questions (JSON, statuts)
e2e/             tests Playwright (écrans, parcours, accessibilité)
docs/            spécification, feuille de route, décisions
```
