/**
 * Scène 1 — intersection sans signalisation : priorité à droite.
 *
 * Règle (Sécurité routière, « Intersections et priorités », article R415-5
 * cité par la page) : « le conducteur venant par la gauche est tenu de céder
 * le passage à l'autre conducteur ». Ordre de passage attendu ici : la voiture
 * verte (à droite de l'apprenant), puis l'apprenant, puis la voiture rouge
 * (à sa gauche). Un test vérifie cet ordre à partir des trajectoires.
 *
 * Statut : à vérifier (non relue par une personne compétente).
 */
import type { SceneDefinition } from "@/lib/simulation/scene";

export const INTERSECTION_SANS_SIGNALISATION: SceneDefinition = {
  slug: "intersection-sans-signalisation",
  title: "Intersection sans signalisation",
  summary:
    "Trois voitures arrivent à un carrefour de quartier sans panneau, sans feu et sans agent. Qui passe en premier ?",
  status: "a-verifier",
  universeId: "u04",
  duration: 16,
  layout: { kind: "carrefour", roadWidth: 7, armLength: 50 },
  actors: [
    {
      id: "vous",
      kind: "voiture",
      label: "Votre voiture (bleue)",
      color: "#287cff",
      isLearner: true,
      description:
        "Vous allez tout droit vers le nord. La voiture verte arrive de votre droite : vous lui cédez le passage. La voiture rouge arrive de votre gauche : elle doit vous céder le passage.",
      trajectory: [
        { t: 0, x: 1.75, z: 40, easing: "ease-out" },
        { t: 4.5, x: 1.75, z: 7 },
        { t: 7.5, x: 1.75, z: 7, easing: "ease-in" },
        { t: 10, x: 1.75, z: -6 },
        { t: 13, x: 1.75, z: -40 },
      ],
    },
    {
      id: "verte",
      kind: "voiture",
      label: "Voiture verte",
      color: "#1b7a5c",
      description:
        "Elle arrive par votre droite et va tout droit. Personne n’arrive à sa droite : elle passe en premier.",
      trajectory: [
        { t: 0, x: 50, z: -1.75 },
        { t: 10.5, x: -45, z: -1.75 },
      ],
    },
    {
      id: "rouge",
      kind: "voiture",
      label: "Voiture rouge",
      color: "#c8323c",
      description:
        "Elle arrive par votre gauche : vous êtes à sa droite, elle doit donc vous céder le passage. Elle passe en dernier.",
      trajectory: [
        { t: 0, x: -45, z: 1.75, easing: "ease-out" },
        { t: 5, x: -7, z: 1.75 },
        { t: 10.5, x: -7, z: 1.75, easing: "ease-in" },
        { t: 12, x: 0, z: 1.75 },
        { t: 16, x: 45, z: 1.75 },
      ],
    },
  ],
  props: [
    {
      id: "plaque",
      kind: "plaque-rue",
      label: "Plaque de rue",
      description:
        "Plaque de nom de rue (nom fictif). Elle n’indique aucune règle de priorité : ici, aucun panneau, aucun feu et aucun agent ne règle le passage, donc la priorité à droite s’applique.",
      x: 5.6,
      z: 5.6,
      rotation: 0,
      text: "Rue des Tilleuls",
    },
  ],
  cameras: {
    aerial: { position: [0, 46, 16], target: [0, 0, 0] },
    free: [0, 30, 34],
    explain: [
      { t: 0, position: [1.75, 9, 52], target: [1.75, 0, 20] },
      { t: 4.5, position: [14, 26, 22], target: [0, 0, 0] },
      { t: 6, position: [8, 12, 15], target: [1, 0, -1.75] },
      { t: 8.5, position: [-12, 15, 14], target: [1.75, 0, 0] },
      { t: 11, position: [-20, 10, 10], target: [-2, 0, 1.75] },
      { t: 16, position: [0, 38, 18], target: [0, 0, 0] },
    ],
  },
  rules: {
    // Priorité à droite : la verte (à droite de l'apprenant), l'apprenant, puis la rouge (à sa gauche).
    expectedOrder: ["verte", "vous", "rouge"],
  },
  cues: [
    { from: 0, to: 4.5, text: "Vous approchez d’une intersection sans panneau, sans feu et sans agent." },
    {
      from: 4.5,
      to: 7.5,
      text: "Règle de base : on cède le passage au véhicule qui vient de droite. La voiture verte arrive de votre droite : elle passe en premier.",
    },
    {
      from: 7.5,
      to: 10.2,
      text: "La voie est libre : vous passez. Vous êtes à droite de la voiture rouge, qui doit vous céder le passage.",
    },
    {
      from: 10.2,
      to: 16,
      text: "La voiture rouge, venue de gauche, passe en dernier. Même prioritaire, on ralentit et on vérifie que les autres nous laissent passer.",
    },
  ],
  questionId: "q-sim-001",
  lessonId: "l-u04-priorite-a-droite",
  sources: ["priorites"],
  provisional: [
    "Véhicules, bâtiments et arbres : formes géométriques simples dessinées par le code de KODI, en attendant de vrais modèles 3D.",
    "Sons : bruit de fond et moteur synthétisés par le navigateur, provisoires.",
    "Marquages au sol et plaque de rue schématiques ; le nom de rue est fictif.",
    "Scène et question pas encore relues par une personne compétente.",
  ],
};
