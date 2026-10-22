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
  (`bg`, `surface`, `fg`, `muted`, `line`, `brand`, `accent`…).
- Composants client (`"use client"`) seulement quand c’est nécessaire.
- Aucun secret dans le dépôt (il est public). Variables dans `.env.local`
  (ignoré par Git) et dans les réglages des services.
- Commits en français ou en anglais, messages explicites ; branches par phase.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
