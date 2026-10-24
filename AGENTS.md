# Règles pour les agents IA — KODI

Ce fichier s’applique à tout agent (Claude Code, Codex, etc.) qui modifie ce
dépôt. Lire aussi `docs/SPECIFICATION.md`, `docs/ROADMAP.md` et
`docs/DECISIONS.md` avant de commencer.

## Contexte

- Le porteur de projet développe **uniquement depuis un iPhone**, via des
  sessions cloud. Il ne peut pas lancer de commande localement : tout ce qui
  doit être vérifié l’est par l’agent, dans sa session, ou par la CI.
- **Aucune dépense** pendant le développement : ne pas introduire de service
  payant ; signaler toute dépense future comme question ouverte.
- On travaille **phase par phase** (voir ROADMAP). Ne jamais enchaîner sur la
  phase suivante sans validation explicite du porteur.

## Honnêteté (non négociable)

- Ne jamais supposer qu’une API, un service, un compte, une clé ou un fichier
  existe : le vérifier, ou demander.
- Ne jamais présenter une fonctionnalité simulée, un mock ou des données
  fictives comme fonctionnels. Un statut « Disponible » dans
  `src/content/project.ts` exige une fonctionnalité réelle et testée.
- Ne jamais fabriquer de question présentée comme officielle, ni copier des
  questions de tiers.
- Ne jamais inventer de source réglementaire, de numéro d’article ou de date.
  Une information non vérifiée est marquée **[À VÉRIFIER]** et n’est pas
  affichée aux utilisateurs.
- Ne donner une URL de prévisualisation que si elle existe et répond.
- Rapporter fidèlement les résultats des tests, y compris les échecs.

## Commandes

```bash
npm ci
npm run lint        # zéro avertissement
npm run typecheck
npm test
npm run build
PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e  # cloud Claude Code
npm run check       # lint + typecheck + test + build
npm run test:db     # sécurité de la base (PostgreSQL réel + migrations)
```

## Définition de « terminé »

1. `npm run check` passe ; les tests E2E passent si l’interface a changé.
2. Nouvelle logique couverte par des tests ; interactions testées.
3. Documentation mise à jour (ROADMAP, DECISIONS si choix technique,
   `src/content/project.ts` si l’avancement change).
4. Interface en français, mobile-first, utilisable au clavier, contrastes AA,
   thèmes clair et sombre vérifiés.

## Conventions

- TypeScript strict, aucun `any`, imports de type avec `import type`.
- Logique pure dans `src/lib/` (testée), composants dans `src/components/`,
  données éditoriales dans `src/content/`.
- Couleurs uniquement via les jetons définis dans `src/app/globals.css`
  (`bg`, `surface`, `surface-2`, `fg`, `muted`, `line`, `brand`,
  `brand-strong`, `brand-text`, `success`, `danger`…). Texte coloré :
  toujours les variantes `-text` (voir DECISIONS.md D-011).
- Réutiliser les composants de `src/components/ui/` avant d’en créer.
- Toute donnée d’exemple vit dans `src/content/demo.ts` et s’affiche avec
  `<DemoBadge />`.
- Tout contenu pédagogique (univers, compétences, leçons, questions) vit
  dans `content/` (voir `docs/CONTENU.md`), cite des sources de
  `src/content/sources.ts` réellement consultées et n’est jamais présenté
  comme officiel. Après modification : `npm run content:build` puis
  `npm run relecture` (des tests vérifient que les fichiers générés sont à
  jour).
- Statuts : `brouillon`, `a-verifier`, `valide`, `retire`. Ne passer un
  contenu en `valide` que sur validation explicite du porteur, élément par
  élément, avec `review.by` et `review.at`. Un contenu de démonstration
  (`demo: true`) n’est jamais validé.
- La relecture est faite par le porteur à partir de `docs/RELECTURE.md`.
- Moteur pédagogique : logique pure dans `src/lib/pedagogy/`, sans IA
  générative ; tout changement d’algorithme doit être reporté dans la
  migration SQL correspondante (test de parité dans `supabase/tests/`).
- Coach et gamification (`src/lib/coach/`) : règles déterministes sans IA,
  chaque conseil avec sa raison ; aucune récompense pour une mauvaise
  réponse ou une répétition ; niveaux et badges distincts de la maîtrise.
- Scènes 3D (`docs/SCENES.md`) : positions fonction pure du temps, tout
  élément provisoire signalé à l’écran, aucun modèle ou son tiers sans
  licence vérifiée, aucune mesure de performance annoncée sans avoir été
  faite (avec ses conditions). Budget dans `src/lib/simulation/performance.ts`.
- Animations : classes `animate-enter` / `animate-pop` / transitions courtes ;
  elles sont neutralisées automatiquement quand l’utilisateur les réduit.
- Composants client (`"use client"`) seulement quand c’est nécessaire.
- Base de données : toute évolution passe par une **nouvelle** migration
  dans `supabase/migrations/` (jamais de modification d’une migration
  déployée), avec RLS, privilèges minimaux et tests dans `supabase/tests/`
  (`npm run test:db` doit passer). Écritures sensibles uniquement par
  fonctions `SECURITY DEFINER` avec `set search_path = ''`.
- Supabase : seules `NEXT_PUBLIC_SUPABASE_URL` et
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` sont lues par l’application. Jamais
  de clé secrète côté client (un test le vérifie).
- Professeur IA (`src/lib/tutor/`, D-029) : seule exception, les variables
  serveur `KODI_TUTOR_*` et `ANTHROPIC_API_KEY`, lues uniquement par
  `src/lib/tutor/server.ts` (`import "server-only"`), jamais préfixées
  `NEXT_PUBLIC_`. Aucun appel réel à une IA dans les tests (client simulé).
  Ne jamais annoncer qu’une IA répond si aucun service n’est connecté ; ne
  transmettre à l’IA que des contenus validés ; toute réponse passe par
  `checkAnswer`, sinon repli vers les explications prédéfinies.
- Aucun secret dans le dépôt (il est public). Variables dans `.env.local`
  (ignoré par Git) et dans les réglages des services.
- Commits en français ou en anglais, messages explicites ; branches par phase.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
