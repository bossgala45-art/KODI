# Scènes de simulation

État au 24/10/2026 : **une scène** (intersection sans signalisation,
priorité à droite), au statut « à vérifier », validée par le porteur comme
première scène. L’architecture réutilisable pour les 19 autres situations
est en place (voir « Architecture » ci-dessous) ; ces 19 scènes ne sont pas
encore produites.

## Ce qui existe

- Page : `/simulations/intersection-sans-signalisation`, ouverte depuis la
  leçon « Priorité à droite et intersections ».
- Vue 3D (Three.js 0.186.1, React Three Fiber 9.8.2), chargée uniquement sur
  cette page.
- Quatre caméras : conducteur (place du conducteur, voiture bleue),
  aérienne, libre (un doigt : tourner ; pincer : zoomer ; deux doigts :
  déplacer, via les `OrbitControls` de Three.js), explicative (animée,
  synchronisée avec les sous-titres).
- Sélection des véhicules et de la plaque de rue : en touchant la vue ou
  avec la liste de boutons (clavier, lecteurs d’écran) ; l’élément choisi
  est entouré en jaune et expliqué.
- Animations déterministes : chaque position est une fonction pure du temps
  (`src/lib/simulation/timeline.ts`) ; lecture, pause, retour au début,
  curseur de position.
- Question associée (`q-sim-001`, à vérifier), corrigée par le moteur
  pédagogique avec le détail des oublis, puis bouton « Revoir l’explication
  animée ».
- Sons désactivés par défaut, synthétisés par le navigateur (Web Audio) :
  bruit de rue à graine fixe, moteur de la voiture de l’apprenant, autres
  véhicules selon leur distance.
- Sous-titres activés par défaut, désactivables, aussi annoncés aux
  lecteurs d’écran.
- Version 2D de secours (SVG, mêmes trajectoires) : automatique sans WebGL
  ou si le contexte 3D est perdu, proposée si la 3D est trop lente, ou au
  choix de la personne.

## Éléments provisoires (affichés sur la page)

- Véhicules, bâtiments et arbres : formes géométriques simples créées par
  le code de KODI. **Aucun modèle 3D réaliste n’est utilisé ni prétendu.**
- Sons : synthétisés, sans fichier externe.
- Marquages au sol et plaque de rue schématiques ; nom de rue fictif.
- Aucun panneau de priorité n’est représenté : la scène est volontairement
  « sans signalisation ». Le panneau annonçant une intersection à priorité à
  droite n’a pas pu être vérifié sur une source officielle (son code et sa
  forme exacte) : **[À VÉRIFIER]**, non affiché.

Ressources : uniquement du code. Bibliothèques sous licence MIT (three,
@react-three/fiber et ses dépendances : its-fine, suspend-react,
react-use-measure, zustand, scheduler). Aucune image, texture, police ni
son tiers : la seule texture (plaque de rue, 256 × 64 pixels) est dessinée
par le navigateur.

## Règle enseignée et vérification

Source : Sécurité routière, « Intersections et priorités » (relue le
24/10/2026) : « Lorsque deux conducteurs abordent une intersection par des
routes différentes, le conducteur venant par la gauche est tenu de céder le
passage à l’autre conducteur » (article R415-5 cité par la page) ; « En
l’absence de panneaux, de feux ou d’agent, les automobilistes doivent céder
le passage aux véhicules venant de leur droite. »

Un test (`src/lib/simulation/simulation.test.ts`) calcule, à partir des
trajectoires, l’ordre d’entrée dans le carrefour : voiture verte (à droite
de l’apprenant), puis l’apprenant, puis voiture rouge (à sa gauche), sans
chevauchement ; il vérifie aussi la circulation à droite et les arrêts.

## Optimisations pour Safari sur iPhone

- Densité de pixels plafonnée à 2 (l’iPhone en a 3), abaissée à 1 si la
  moyenne passe sous 30 images/s ; sous 20 images/s, la version 2D est
  proposée.
- Pas d’ombres portées, pas de post-traitement, matériaux simples (Lambert).
- Éléments répétés (trottoirs, immeubles, marquages, arbres) dessinés en
  instances : un appel de dessin par type.
- Rendu à la demande quand la scène est en pause (pas de calcul inutile).
- Moteur 3D chargé seulement sur la page de la scène.
- Son démarré seulement après un geste (règle de Safari), contexte audio
  suspendu en pause.
- Perte du contexte WebGL gérée (passage en 2D).

## Contrôles de performance

Budget vérifié automatiquement (`src/lib/simulation/performance.ts`) :
80 appels de dessin et 40 000 triangles au plus par image ; texture de
512 pixels au plus ; moteur 3D sous 1 100 Kio de JavaScript décodé.

Mesures **réellement effectuées**, le 24/10/2026, par les tests de bout en
bout (`e2e/scene.spec.ts`) dans Chromium sans interface et **sans
processeur graphique** (rendu logiciel SwiftShader), donc **non
représentatives d’un iPhone** :

| Mesure | Valeur |
| --- | --- |
| Appels de dessin (vue d’ouverture, caméra conducteur) | 10 (9 après le passage au décor générique) |
| Triangles | 1 134 (1 478 après le passage au décor générique) |
| Appels de dessin observés pendant la lecture (capture manuelle) | 29 |
| Images par seconde (rendu logiciel), sur 10 relevés | de 19,6 à 60,1 selon la taille d’écran et la densité |
| JavaScript de la page (décodé / transféré) | 1 888 Kio / 527 Kio |
| dont moteur 3D (décodé) | 922 Kio |

**Aucune mesure n’a été faite sur iPhone ni dans Safari** : à faire sur un
appareil réel (le panneau « Afficher les mesures de performance » de la
page donne les valeurs en direct). Les gestes tactiles (pincer, tourner)
n’ont pas pu être testés automatiquement.

## Architecture réutilisable

Une scène se décrit **uniquement par des données** (un fichier dans
`src/content/scenes/`), sans code de rendu :

| Brique | Rôle | Disponible |
| --- | --- | --- |
| Type de voirie (`layout`) | transformé en géométrie pure (chaussées, trottoirs, marquages, immeubles, arbres), dessinée à l’identique en 3D et en 2D | carrefour, carrefour en T (branche nord ou sud), ligne droite (nord-sud ou est-ouest) |
| Usagers (`actors`) | forme provisoire, taille, couleur, explication, trajectoire | voiture, utilitaire, vélo, piéton |
| Éléments fixes (`props`) | sélectionnables et expliqués | plaque de rue ; **aucun panneau réglementaire** tant qu’il n’est pas vérifié |
| Caméras (`cameras`) | vue aérienne, départ de la caméra libre, clés de la caméra explicative ; la vue conducteur suit l’usager de l’apprenant (hauteur des yeux selon le type) | — |
| Sous-titres (`cues`) | synchronisés avec le temps | — |
| Règle de passage (`rules`) | ordre attendu dans la zone de conflit, **vérifié par les tests** à partir des trajectoires | — |
| Liens | univers, leçon, question du catalogue, sources, éléments provisoires | — |

Contrôles automatiques pour toute scène (`src/lib/simulation/architecture.test.ts`) :
scène bien formée, ordre de passage respecté, liens vers le catalogue
cohérents (question, leçon contenant un bloc simulation vers la scène,
compétences du même univers, sources du registre), décor sans élément posé
sur la chaussée, trottoirs le long de chaque bord de chaussée.

### Ajouter une scène

1. Lire et citer la source officielle de la règle (registre
   `src/content/sources.ts`).
2. Créer `src/content/scenes/<slug>.ts` en suivant la première scène :
   voirie, usagers et trajectoires (clés `t`, `x`, `z`), caméras,
   sous-titres, ordre de passage, éléments provisoires, statut
   `a-verifier`.
3. Ajouter la question associée dans `content/questions/` (statut
   `a-verifier`), et un bloc `simulation` vers la scène dans la leçon.
4. L’inscrire dans `SCENES` (`src/content/scenes/index.ts`) et passer
   `available: true` dans le programme (`plan.ts`).
5. `npm run content:build`, puis tous les tests : ils refusent une scène
   dont l’ordre de passage ou les liens ne sont pas cohérents.

Briques encore à créer pour certaines scènes prévues (indiquées dans
`plan.ts`) : trajectoires courbes, panneaux et marquages vérifiés, voie
ferrée et train, tunnel, voie d’accélération, places de stationnement,
éclairage de nuit, pluie et brouillard, gyrophare et sirène.

### Programme des 20 scènes (proposition à valider)

Aucune liste n’existait : la liste de `src/content/scenes/plan.ts` est une
**proposition de l’agent**, une ou plusieurs scènes par univers, affichée
sur la page `/simulations` avec la mention « Programme proposé, à
valider ». Seule la scène 1 est produite.

## Code

```
src/lib/simulation/timeline.ts     trajectoires, horloge, caméra explicative, sous-titres
src/lib/simulation/layout.ts       types de voirie → géométrie pure (3D et 2D)
src/lib/simulation/scene.ts        modèle d’une scène, usagers, contrôles, ordre de passage
src/lib/simulation/performance.ts  budget, mesure des images, décisions d’adaptation
src/lib/simulation/audio.ts        sons synthétisés
src/content/scenes/                données des scènes (une pour l’instant) et programme des 20
src/components/simulation/         vue 3D, vue 2D, lecteur
```
