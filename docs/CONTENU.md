# Contenus pédagogiques : écrire, importer, valider

Tous les contenus vivent dans le dossier `content/`, versionné avec le code.
Ils sont validés puis importés par une commande, sans intelligence
artificielle générative.

```
content/
  univers.json            les 10 univers (thèmes officiels de l’examen)
  competences.json        les compétences, rattachées à un univers
  lecons/*.json           une leçon par fichier
  questions/*.json        des lots de questions
  statuts.lock.json       généré : statuts et empreintes du dernier import
```

## Commandes

```bash
npm run content:check   # vérifie tout, n’écrit rien
npm run content:build   # vérifie, puis génère :
                        #   src/content/generated/catalog.json (lu par l’application)
                        #   supabase/seed/content.sql          (import en base, rejouable)
                        #   content/statuts.lock.json          (suivi des statuts)
npm run relecture       # régénère docs/RELECTURE.md (questions de l’examen blanc)
```

Un test échoue si le catalogue généré n’est plus identique aux fichiers de
`content/` : après toute modification, lancer `npm run content:build`.

## Statuts

| Statut | Signification | Visible ? |
| --- | --- | --- |
| `brouillon` | en cours d’écriture | dans l’application de développement, avec le badge « Brouillon · non validé » ; jamais en base publique |
| `a-verifier` | complet, en attente de relecture | badge « À vérifier » ; jamais en base publique |
| `valide` | relu et validé par une personne compétente | seul statut publié en base (`published`) |
| `retire` | n’est plus proposé (règle modifiée, erreur…) | jamais |

Transitions autorisées (contrôlées à chaque import, par rapport à
`statuts.lock.json`) :

- un nouveau contenu commence en `brouillon` ou `a-verifier` ;
- `brouillon` → `a-verifier`, `retire` ;
- `a-verifier` → `brouillon`, `valide`, `retire` ;
- `valide` → `a-verifier`, `retire` ;
- `retire` → `brouillon`.

Garde-fous :

- passer en `valide` exige `review: { "by": "…", "at": "AAAA-MM-JJ" }` ;
- un contenu `valide` modifié (texte, réponses, sources…) est refusé : il
  doit repasser `a-verifier` pour une nouvelle relecture ;
- un contenu `valide` ne se supprime pas : il passe `retire` ;
- un contenu de démonstration (`"demo": true`) ne peut jamais être validé ni
  entrer dans l’examen blanc (contrôlé aussi par la base) ;
- une question `a-verifier` ou `valide` cite au moins une source ; un contenu
  validé n’utilise que des compétences validées.

## Sources

Une source est une clé du registre `src/content/sources.ts`, qui ne contient
que des pages réellement consultées (date de consultation, articles cités par
la page). Une source inconnue est refusée à l’import. Pour en ajouter une :
lire la page, l’ajouter au registre et à `docs/SOURCES.md`.

## Leçon

```json
{
  "id": "l-u04-priorite-a-droite",
  "universeId": "u04",
  "slug": "priorite-a-droite",
  "title": "…",
  "summary": "…",
  "position": 1,
  "status": "brouillon",
  "demo": false,
  "competenceIds": ["c-priorite-intersection"],
  "sources": ["priorites"],
  "blocks": [
    { "type": "text", "title": "…", "paragraphs": ["…"] },
    { "type": "image", "src": "/contenus/…/schema.svg", "alt": "…", "caption": "…",
      "credit": "origine et licence (obligatoire)", "width": 400, "height": 300 },
    { "type": "video", "title": "…", "transcript": "obligatoire", "toProduce": true },
    { "type": "simulation", "sceneSlug": "…", "camera": "conducteur", "instructions": "…" }
  ]
}
```

- Images et vidéos : fichiers dans `public/contenus/`, originaux ou sous
  licence compatible ; l’import vérifie que le fichier existe.
- Vidéo pas encore tournée : `"toProduce": true` (affichée « à produire »,
  avec sa transcription). Une vidéo publiée a `src` et `credit`.
- Simulation : référence une scène 3D (phase ultérieure) ; affichée comme
  « pas encore disponible » en attendant.
- Chaque univers déclare son nombre de leçons prévues (`plannedLessons`,
  72 au total) ; l’import refuse d’en dépasser le nombre.

## Question

```json
{
  "id": "ex-001",
  "status": "a-verifier",
  "kind": "single",
  "topic": "Priorités",
  "prompt": "…",
  "choices": [{ "id": "a", "label": "…" }, { "id": "b", "label": "…" }],
  "correct": ["a"],
  "explanation": "…",
  "sources": ["priorites"],
  "competenceIds": ["c-priorite-intersection"],
  "lessonId": "l-u04-priorite-a-droite",
  "examEligible": true
}
```

- `single` : exactement une bonne réponse ; `multiple` : au moins deux, et
  jamais toutes les propositions. 2 à 4 propositions.
- Correction en tout ou rien : une réponse multiple n’est juste que si
  toutes les bonnes propositions, et elles seules, sont cochées.
- `examEligible` : la question peut être tirée dans l’examen blanc.
- Ne jamais copier de question de tiers ni présenter une question comme
  officielle. Ne pas remplir artificiellement la base : chaque question doit
  être relue.

## Relire et valider

1. Le porteur relit (par exemple dans `docs/RELECTURE.md`) et indique à
   l’agent ce qui est validé ou à corriger.
2. L’agent passe les contenus validés en `valide` avec
   `"review": { "by": "nom du relecteur", "at": "AAAA-MM-JJ" }`, puis lance
   `npm run content:build`, `npm run relecture` et les tests.
3. En base, l’import (`supabase/seed/content.sql`, appliqué par le workflow
   « Supabase — déploiement de la base ») publie uniquement les contenus
   validés. Les fichiers de `content/` font foi : un import réaligne les
   statuts de la base sur eux.
