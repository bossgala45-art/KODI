-- KODI — contenus pédagogiques : cours, compétences, questions, scènes.
--
-- Seuls les contenus au statut « published » sont visibles hors équipe
-- éditoriale. Les bonnes réponses vivent dans une table à part, illisible
-- par anon et authenticated : elles ne sortent que par les fonctions de
-- correction (pratique après réponse, examen après remise).

create type public.content_status as enum ('draft', 'in_review', 'published', 'retired');

-- ---------------------------------------------------------------------------
-- Cours et compétences
-- ---------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  description text not null default '',
  position smallint not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.competences (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  description text not null default '',
  position smallint not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug)
);

-- ---------------------------------------------------------------------------
-- Questions
-- ---------------------------------------------------------------------------
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  external_ref text unique,
  competence_id uuid references public.competences (id) on delete set null,
  topic text not null default '',
  prompt text not null check (char_length(prompt) between 10 and 600),
  explanation text not null,
  sources jsonb not null default '[]'::jsonb check (jsonb_typeof(sources) = 'array'),
  answer_count smallint not null default 0,
  status public.content_status not null default 'draft',
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Une question publiée a forcément été relue et cite au moins une source.
  constraint questions_published_reviewed check (
    status <> 'published'
    or (reviewed_at is not null and jsonb_array_length(sources) > 0)
  )
);

create table public.question_choices (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  position smallint not null check (position between 0 and 5),
  label text not null,
  unique (question_id, position)
);

-- Bonnes réponses : jamais lisibles directement par les clients.
create table public.question_answers (
  question_id uuid not null references public.questions (id) on delete cascade,
  choice_id uuid not null references public.question_choices (id) on delete cascade,
  primary key (question_id, choice_id)
);

create or replace function private.check_answer_choice()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.question_choices c
    where c.id = new.choice_id and c.question_id = new.question_id
  ) then
    raise exception 'la proposition % n''appartient pas à la question %', new.choice_id, new.question_id;
  end if;
  return new;
end;
$$;

create trigger question_answers_check
  before insert or update on public.question_answers
  for each row execute function private.check_answer_choice();

-- Nombre de réponses attendues : public (il est affiché à l'examen).
create or replace function private.refresh_answer_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  qid uuid := coalesce(new.question_id, old.question_id);
begin
  update public.questions q
  set answer_count = (select count(*) from public.question_answers a where a.question_id = qid)
  where q.id = qid;
  return null;
end;
$$;

create trigger question_answers_count
  after insert or delete on public.question_answers
  for each row execute function private.refresh_answer_count();

-- ---------------------------------------------------------------------------
-- Scènes de simulation (3D, quatre caméras)
-- ---------------------------------------------------------------------------
create table public.simulation_scenes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  description text not null default '',
  cameras text[] not null default array['conducteur', 'aerienne', 'arriere', 'usager']
    check (cameras <@ array['conducteur', 'aerienne', 'arriere', 'usager']),
  position smallint not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Horodatage
-- ---------------------------------------------------------------------------
create trigger courses_touch before update on public.courses
  for each row execute function private.touch_updated_at();
create trigger competences_touch before update on public.competences
  for each row execute function private.touch_updated_at();
create trigger questions_touch before update on public.questions
  for each row execute function private.touch_updated_at();
create trigger simulation_scenes_touch before update on public.simulation_scenes
  for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Droits et politiques
-- ---------------------------------------------------------------------------
alter table public.courses enable row level security;
alter table public.competences enable row level security;
alter table public.questions enable row level security;
alter table public.question_choices enable row level security;
alter table public.question_answers enable row level security;
alter table public.simulation_scenes enable row level security;

revoke all on table public.courses, public.competences, public.questions,
  public.question_choices, public.question_answers, public.simulation_scenes
  from anon, authenticated;

grant select on table public.courses, public.competences, public.simulation_scenes
  to anon, authenticated;
grant select on table public.questions, public.question_choices to authenticated;
-- question_answers : aucun droit pour anon et authenticated.

create policy "cours : publiés, ou équipe"
  on public.courses for select to anon, authenticated
  using (status = 'published' or (select private.is_editor()));

create policy "compétences : publiées, ou équipe"
  on public.competences for select to anon, authenticated
  using (status = 'published' or (select private.is_editor()));

create policy "scènes : publiées, ou équipe"
  on public.simulation_scenes for select to anon, authenticated
  using (status = 'published' or (select private.is_editor()));

create policy "questions : publiées, ou équipe"
  on public.questions for select to authenticated
  using (status = 'published' or (select private.is_editor()));

create policy "propositions : de questions publiées, ou équipe"
  on public.question_choices for select to authenticated
  using (
    (select private.is_editor())
    or exists (
      select 1 from public.questions q
      where q.id = question_id and q.status = 'published'
    )
  );
