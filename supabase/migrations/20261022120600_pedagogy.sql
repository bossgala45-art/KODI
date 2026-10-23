-- KODI — moteur pédagogique (phase 3).
--
--  - 10 univers (table courses) et 72 leçons prévues ;
--  - leçons composées de blocs (texte, image, vidéo, simulation) ;
--  - compétences associées aux leçons et aux questions ;
--  - révisions espacées adaptatives (variante de SM-2), identiques au calcul
--    TypeScript de src/lib/pedagogy/scheduler.ts ;
--  - maîtrise estimée par compétence, identique à src/lib/pedagogy/mastery.ts.
--
-- Le contenu est importé depuis le dossier content/ (npm run content:build) :
-- les fichiers versionnés font foi pour les statuts.

-- ---------------------------------------------------------------------------
-- Univers, compétences, questions : colonnes complémentaires
-- ---------------------------------------------------------------------------
alter table public.courses
  add column external_ref text unique,
  add column planned_lessons smallint not null default 0 check (planned_lessons >= 0);

alter table public.competences
  add column external_ref text unique;

-- ---------------------------------------------------------------------------
-- Leçons
-- ---------------------------------------------------------------------------
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  external_ref text unique,
  course_id uuid not null references public.courses (id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  summary text not null default '',
  position smallint not null check (position >= 1),
  status public.content_status not null default 'draft',
  is_demo boolean not null default false,
  blocks jsonb not null default '[]'::jsonb check (jsonb_typeof(blocks) = 'array'),
  sources jsonb not null default '[]'::jsonb check (jsonb_typeof(sources) = 'array'),
  reviewer_name text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug),
  -- Une leçon publiée a été relue, cite une source et n'est pas une démonstration.
  constraint lessons_published_reviewed check (
    status <> 'published'
    or (reviewed_at is not null and jsonb_array_length(sources) > 0 and not is_demo)
  )
);

create table public.lesson_competences (
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  competence_id uuid not null references public.competences (id) on delete cascade,
  primary key (lesson_id, competence_id)
);

create trigger lessons_touch before update on public.lessons
  for each row execute function private.touch_updated_at();

alter table public.questions
  add column lesson_id uuid references public.lessons (id) on delete set null,
  add column is_demo boolean not null default false,
  add column exam_eligible boolean not null default false,
  add column reviewer_name text,
  add constraint questions_demo_never_published check (
    not is_demo or (status <> 'published' and not exam_eligible)
  );

create table public.question_competences (
  question_id uuid not null references public.questions (id) on delete cascade,
  competence_id uuid not null references public.competences (id) on delete cascade,
  primary key (question_id, competence_id)
);
create index question_competences_competence_idx on public.question_competences (competence_id);

-- Réordonner les propositions dans une même transaction (import).
alter table public.question_choices
  drop constraint question_choices_question_id_position_key,
  add constraint question_choices_question_position unique (question_id, position)
    deferrable initially deferred;

-- ---------------------------------------------------------------------------
-- Droits et politiques
-- ---------------------------------------------------------------------------
alter table public.lessons enable row level security;
alter table public.lesson_competences enable row level security;
alter table public.question_competences enable row level security;

revoke all on table public.lessons, public.lesson_competences, public.question_competences
  from anon, authenticated;
grant select on table public.lessons, public.lesson_competences to anon, authenticated;
grant select on table public.question_competences to authenticated;

create policy "leçons : publiées, ou équipe"
  on public.lessons for select to anon, authenticated
  using (status = 'published' or (select private.is_editor()));

create policy "compétences des leçons : de leçons publiées, ou équipe"
  on public.lesson_competences for select to anon, authenticated
  using (
    (select private.is_editor())
    or exists (select 1 from public.lessons l where l.id = lesson_id and l.status = 'published')
  );

create policy "compétences des questions : de questions publiées, ou équipe"
  on public.question_competences for select to authenticated
  using (
    (select private.is_editor())
    or exists (select 1 from public.questions q where q.id = question_id and q.status = 'published')
  );

-- ---------------------------------------------------------------------------
-- Maîtrise estimée par compétence
--   poids = 0,5 ^ (âge en jours / 30) ; score = (1 + Σ poids × juste) / (2 + Σ poids)
--   confiance = Σ poids / (Σ poids + 5) ; « non évaluée » sous 3 réponses.
-- Seules les réponses strictement antérieures à p_at comptent.
-- ---------------------------------------------------------------------------
create or replace function private.competence_mastery(p_user uuid, p_competence uuid, p_at timestamptz)
returns table (score double precision, confidence double precision, attempts integer)
language sql
stable
security definer
set search_path = ''
as $$
  with weighted as (
    select a.is_correct,
           power(0.5::double precision,
             greatest(0, extract(epoch from (p_at - a.answered_at)))::double precision / 86400 / 30) as w
    from public.attempts a
    join public.question_competences qc on qc.question_id = a.question_id
    where a.user_id = p_user and qc.competence_id = p_competence and a.answered_at < p_at
  )
  select (1 + coalesce(sum(w) filter (where is_correct), 0)) / (2 + coalesce(sum(w), 0)),
         coalesce(sum(w), 0) / (coalesce(sum(w), 0) + 5),
         count(*)::integer
  from weighted;
$$;

-- Maîtrise retenue pour une question : sa compétence évaluée la plus faible (null sinon).
create or replace function private.question_mastery(p_user uuid, p_question uuid, p_at timestamptz)
returns double precision
language sql
stable
security definer
set search_path = ''
as $$
  select min(m.score)
  from public.question_competences qc
  cross join lateral private.competence_mastery(p_user, qc.competence_id, p_at) m
  where qc.question_id = p_question and m.attempts >= 3;
$$;

-- ---------------------------------------------------------------------------
-- Révisions espacées adaptatives (voir scheduler.ts, valeurs entières)
-- ---------------------------------------------------------------------------
alter table public.revisions
  add column ease smallint not null default 250 check (ease between 130 and 300),
  add column interval_tenths integer not null default 0 check (interval_tenths between 0 and 1800),
  add column repetitions integer not null default 0 check (repetitions >= 0),
  add column lapses integer not null default 0 check (lapses >= 0);

comment on column public.revisions.box is
  'Compatibilité : least(repetitions + 1, 5). Le calendrier suit ease et interval_tenths.';

-- p_at : instant de la réponse (now() par défaut ; paramétrable pour les tests).
drop function private.record_revision(uuid, uuid, boolean);
create function private.record_revision(
  p_user uuid, p_question uuid, p_correct boolean, p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous public.revisions%rowtype;
  mastery double precision := private.question_mastery(p_user, p_question, p_at);
  factor integer;
  v_ease integer;
  v_reps integer;
  v_lapses integer;
  v_interval integer;
  base integer;
  due timestamptz;
begin
  select * into previous from public.revisions
  where user_id = p_user and question_id = p_question
  for update;

  v_ease := coalesce(previous.ease, 250);
  v_reps := coalesce(previous.repetitions, 0);
  v_lapses := coalesce(previous.lapses, 0);

  if not p_correct then
    v_ease := greatest(v_ease - 20, 130);
    v_reps := 0;
    v_lapses := v_lapses + 1;
    v_interval := 0;
    due := p_at + interval '10 minutes';
  else
    factor := case when mastery is null then 100 when mastery < 0.5 then 60 when mastery < 0.8 then 85 else 100 end;
    v_reps := v_reps + 1;
    base := case
      when v_reps = 1 then 10
      when v_reps = 2 then 30
      else round(greatest(coalesce(previous.interval_tenths, 0), 10)::numeric * v_ease / 100)::integer
    end;
    v_interval := least(greatest(round(base::numeric * factor / 100)::integer, 10), 1800);
    v_ease := least(v_ease + 10, 300);
    due := p_at + make_interval(secs => v_interval * 8640);
  end if;

  insert into public.revisions as r (
    user_id, question_id, box, correct_streak, due_at, last_answered_at,
    ease, interval_tenths, repetitions, lapses
  )
  values (
    p_user, p_question, least(v_reps + 1, 5), v_reps, due, p_at,
    v_ease, v_interval, v_reps, v_lapses
  )
  on conflict (user_id, question_id) do update set
    box = excluded.box,
    correct_streak = excluded.correct_streak,
    due_at = excluded.due_at,
    last_answered_at = excluded.last_answered_at,
    ease = excluded.ease,
    interval_tenths = excluded.interval_tenths,
    repetitions = excluded.repetitions,
    lapses = excluded.lapses,
    updated_at = now();
end;
$$;

revoke execute on function
  private.competence_mastery(uuid, uuid, timestamptz),
  private.question_mastery(uuid, uuid, timestamptz),
  private.record_revision(uuid, uuid, boolean, timestamptz)
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Examen blanc : uniquement des questions publiées, prévues pour l'examen,
-- et jamais de démonstration.
-- ---------------------------------------------------------------------------
create or replace function public.start_exam()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
  existing uuid;
  available integer;
  new_exam uuid;
  total smallint := private.exam_question_count();
begin
  select id into existing from public.exams where user_id = uid and status = 'in_progress';
  if found then
    return existing;
  end if;

  select count(*) into available
  from public.questions
  where status = 'published' and answer_count > 0 and exam_eligible and not is_demo;
  if available < total then
    raise exception 'KODI_NOT_ENOUGH_QUESTIONS'
      using errcode = 'P0001', detail = format('%s/%s', available, total);
  end if;

  insert into public.exams (user_id, question_count, pass_mark)
  values (uid, total, private.exam_pass_mark())
  returning id into new_exam;

  insert into public.exam_items (exam_id, position, question_id)
  select new_exam, row_number() over (), picked.id
  from (
    select id from public.questions
    where status = 'published' and answer_count > 0 and exam_eligible and not is_demo
    order by random()
    limit total
  ) picked;

  perform private.log_event(uid, 'exam.started', 'exams', new_exam::text);
  return new_exam;
end;
$$;

revoke execute on function public.start_exam() from public, anon;
grant execute on function public.start_exam() to authenticated;
