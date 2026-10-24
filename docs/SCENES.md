# Scènes de simulation

État au 24/10/2026 : **une scène** (intersection sans signalisation,
priorité à droite), au statut « à vérifier ». L’architecture réutilisable
pour les 19 autres situations sera préparée **après validation de cette
première scène** par le porteur.

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
| Appels de dessin (vue d’ouverture, caméra conducteur) | 10 |
| Triangles | 1 134 |
| Appels de dessin observés pendant la lecture (capture manuelle) | 29 |
| Images par seconde (rendu logiciel), sur 8 relevés | de 19,6 à 57,9 selon la taille d’écran et la densité |
| JavaScript de la page (décodé / transféré) | 1 885 Kio / 526 Kio |
| dont moteur 3D (décodé) | 921 Kio |

**Aucune mesure n’a été faite sur iPhone ni dans Safari** : à faire sur un
appareil réel (le panneau « Afficher les mesures de performance » de la
page donne les valeurs en direct). Les gestes tactiles (pincer, tourner)
n’ont pas pu être testés automatiquement.

## Code

```
src/lib/simulation/timeline.ts     trajectoires, horloge, caméra explicative, sous-titres
src/lib/simulation/scene.ts        modèle d’une scène, contrôles, fenêtre de passage au carrefour
src/lib/simulation/performance.ts  budget, mesure des images, décisions d’adaptation
src/lib/simulation/audio.ts        sons synthétisés
src/content/scenes/                données des scènes (une pour l’instant)
src/components/simulation/         vue 3D, vue 2D, lecteur
```
