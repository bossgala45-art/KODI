/* eslint-disable no-console -- script en ligne de commande */
/**
 * Génère docs/RELECTURE.md, la liste des questions de l'examen blanc à
 * relire par le porteur du projet. Usage : npm run relecture
 */
import { writeFileSync } from "node:fs";
import { EXAM_QUESTIONS, type ExamQuestion } from "../src/content/exam-questions";
import { SOURCES, formatConsultedAt } from "../src/content/sources";

const lines: string[] = [
  "# Relecture des questions de l’examen blanc",
  "",
  "Fichier généré à partir de `content/questions/` (npm run relecture) : ne pas le modifier à la main.",
  "",
  "**Comment relire** : pour chaque question, vérifiez l’énoncé, les bonnes réponses (✅) et l’explication en ouvrant la source. Puis indiquez à l’agent, par exemple : « ex-001 à ex-020 validées, ex-037 : la bonne réponse est B ». Seules les questions validées par vous passeront au statut « validé » (voir docs/CONTENU.md).",
  "",
  `Total : **${EXAM_QUESTIONS.length} questions** (${EXAM_QUESTIONS.filter((q) => q.review === "relue").length} relue(s)).`,
  "",
];
const byTopic = new Map<string, ExamQuestion[]>();
for (const q of EXAM_QUESTIONS) byTopic.set(q.topic, [...(byTopic.get(q.topic) ?? []), q]);

for (const [topic, questions] of byTopic) {
  lines.push(`## ${topic}`, "");
  for (const q of questions) {
  lines.push(`### ${q.id} — ${q.review === "relue" ? "relue" : "à relire"}`, "", q.prompt, "");
  q.choices.forEach((c, i) => {
    lines.push(`- ${q.correct.includes(c.id) ? "✅" : "▫️"} **${String.fromCharCode(65 + i)}.** ${c.label}`);
  });
  lines.push("", `**Explication** : ${q.explanation}`, "");
  for (const id of q.sources) {
    const s = SOURCES[id];
    lines.push(`- Source : [${s.title}](${s.url}) — ${s.publisher.split(" (")[0]}, consulté le ${formatConsultedAt(s.consultedAt)}`);
  }
  lines.push("");
  }
}
writeFileSync(new URL("../docs/RELECTURE.md", import.meta.url), lines.join("\n"));
console.log(`docs/RELECTURE.md : ${EXAM_QUESTIONS.length} questions`);
