/* eslint-disable no-console -- script en ligne de commande */
/**
 * Génère supabase/seed/questions.sql à partir de src/content/exam-questions.ts.
 * Usage : npm run seed:questions
 *
 * Les questions sont chargées au statut « in_review » : invisibles pour les
 * utilisateurs tant qu'elles n'ont pas été validées (review_question).
 * Le script est rejouable : une question déjà publiée n'est jamais modifiée.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { EXAM_QUESTIONS } from "../src/content/exam-questions";
import { SOURCES } from "../src/content/sources";

const literal = (value: string) => `'${value.replace(/'/g, "''")}'`;
const textArray = (values: readonly string[]) => `array[${values.map(literal).join(", ")}]::text[]`;

const header = `-- FICHIER GÉNÉRÉ par « npm run seed:questions » : ne pas modifier à la main.
-- Charge les questions de l'examen blanc au statut « in_review » (non publiques).
-- Rejouable : les questions déjà publiées ne sont pas modifiées.

create or replace function pg_temp.seed_question(
  p_ref text, p_topic text, p_prompt text, p_explanation text, p_sources jsonb,
  p_choices text[], p_correct int[]
) returns void language plpgsql as $$
declare
  qid uuid;
  current_status public.content_status;
  cid uuid;
begin
  select id, status into qid, current_status from public.questions where external_ref = p_ref;
  if current_status = 'published' then
    return;
  end if;
  if qid is null then
    insert into public.questions (external_ref, topic, prompt, explanation, sources, status)
    values (p_ref, p_topic, p_prompt, p_explanation, p_sources, 'in_review')
    returning id into qid;
  else
    update public.questions
    set topic = p_topic, prompt = p_prompt, explanation = p_explanation, sources = p_sources
    where id = qid;
    delete from public.question_choices where question_id = qid;
  end if;
  for i in 1 .. array_length(p_choices, 1) loop
    insert into public.question_choices (question_id, position, label)
    values (qid, i - 1, p_choices[i])
    returning id into cid;
    if (i - 1) = any (p_correct) then
      insert into public.question_answers (question_id, choice_id) values (qid, cid);
    end if;
  end loop;
end;
$$;

begin;
`;

const statements = EXAM_QUESTIONS.map((question) => {
  const sources = question.sources.map((id) => {
    const source = SOURCES[id];
    return {
      title: source.title,
      publisher: source.publisher,
      url: source.url,
      consulted_at: source.consultedAt,
      cited_articles: "citedArticles" in source ? source.citedArticles : [],
    };
  });
  const correctPositions = question.choices
    .map((choice, index) => (question.correct.includes(choice.id) ? index : -1))
    .filter((index) => index >= 0);
  return `select pg_temp.seed_question(
  ${literal(question.id)}, ${literal(question.topic)},
  ${literal(question.prompt)},
  ${literal(question.explanation)},
  ${literal(JSON.stringify(sources))}::jsonb,
  ${textArray(question.choices.map((c) => c.label))},
  array[${correctPositions.join(", ")}]::int[]
);`;
});

mkdirSync(new URL("../supabase/seed/", import.meta.url), { recursive: true });
writeFileSync(
  new URL("../supabase/seed/questions.sql", import.meta.url),
  `${header}\n${statements.join("\n\n")}\n\ncommit;\n`,
);
console.log(`supabase/seed/questions.sql : ${EXAM_QUESTIONS.length} questions (in_review)`);
