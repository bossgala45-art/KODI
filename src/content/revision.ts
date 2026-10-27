/**
 * Questions réelles proposées à l'entraînement et aux examens blancs de cet
 * appareil (édition personnelle, D-032). Elles sont ORIGINALES, rédigées
 * pour KODI à partir des sources officielles listées, et NON RELUES tant que
 * leur statut n'est pas « valide » : l'interface l'indique toujours.
 */
import { COMPETENCES, QUESTIONS, UNIVERSES, toQuizQuestion } from "@/content/catalog";
import { EXAM_QUIZ_BANK } from "@/content/exam-questions";
import { groupByUniverse } from "@/lib/revision/themes";

export const REVISION_BANK = QUESTIONS.filter((question) => !question.demo).map(toQuizQuestion);

const universeOfCompetence = new Map(COMPETENCES.map((c) => [c.id, c.universeId]));

export const REVISION_THEMES = groupByUniverse(REVISION_BANK, (id) => universeOfCompetence.get(id), UNIVERSES);

/** Longueur d'une série d'entraînement. */
export const REVISION_SERIES_LENGTH = 10;

/** Examens blancs locaux : tirés parmi les questions prévues pour l'examen. */
export const LOCAL_EXAM_BANK = EXAM_QUIZ_BANK;
