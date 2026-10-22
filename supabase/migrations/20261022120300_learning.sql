-- KODI — apprentissage : tentatives, révisions, examens, parcours de simulation.
--
-- Les tables dont le contenu dépend de la correction (tentatives, révisions,
-- examens) ne sont écrites que par les fonctions de la migration suivante :
-- un client ne peut pas s'attribuer une bonne réponse ou un examen réussi.

-- ---------------------------------------------------------------------------
-- Examens blancs
-- ---------------------------------------------------------------------------
create table public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'submitted', 'abandoned')),
  question_count smallint not null check (question_count > 0),
  pass_mark smallint not null check (pass_mark between 1 and question_count),
  score smallint check (score between 0 and question_count),
  passed boolean,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  constraint exams_result_when_submitted check (
    (status = 'submitted') = (score is not null and passed is not null and submitted_at is not null)
  )
);

create index exams_user_idx on public.exams (user_id, started_at desc);
-- Un seul examen en cours par personne.
create unique index exams_one_in_progress on public.exams (user_id) where status = 'in_progress';

create table public.exam_items (
  exam_id uuid not null references public.exams (id) on delete cascade,
  position smallint not null check (position >= 1),
  question_id uuid not null references public.questions (id) on delete restrict,
  selected_choice_ids uuid[],
  answered_at timestamptz,
  -- Renseigné seulement à la remise de l'examen.
  is_correct boolean,
  primary key (exam_id, position),
  unique (exam_id, question_id)
);

-- ---------------------------------------------------------------------------
-- Tentatives (chaque réponse donnée, en pratique ou en examen)
-- ---------------------------------------------------------------------------
create table public.attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  context text not null check (context in ('practice', 'exam')),
  exam_id uuid references public.exams (id) on delete cascade,
  selected_choice_ids uuid[] not null,
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  check ((context = 'exam') = (exam_id is not null))
);

create index attempts_user_idx on public.attempts (user_id, answered_at desc);

-- ---------------------------------------------------------------------------
-- Révisions espacées (boîtes de Leitner, 1 à 5)
-- ---------------------------------------------------------------------------
create table public.revisions (
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  box smallint not null default 1 check (box between 1 and 5),
  correct_streak integer not null default 0 check (correct_streak >= 0),
  due_at timestamptz not null default now(),
  last_answered_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index revisions_due_idx on public.revisions (user_id, due_at);

-- ---------------------------------------------------------------------------
-- Parcours des scènes de simulation
-- ---------------------------------------------------------------------------
create table public.simulation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  scene_id uuid not null references public.simulation_scenes (id) on delete cascade,
  camera text not null check (camera in ('conducteur', 'aerienne', 'arriere', 'usager')),
  completed_at timestamptz not null default now()
);

create index simulation_runs_user_idx on public.simulation_runs (user_id, completed_at desc);

-- ---------------------------------------------------------------------------
-- Droits et politiques
-- ---------------------------------------------------------------------------
alter table public.exams enable row level security;
alter table public.exam_items enable row level security;
alter table public.attempts enable row level security;
alter table public.revisions enable row level security;
alter table public.simulation_runs enable row level security;

revoke all on table public.exams, public.exam_items, public.attempts,
  public.revisions, public.simulation_runs from anon, authenticated;

-- Lecture seule de ses propres examens ; écriture par fonctions uniquement.
grant select on table public.exams, public.exam_items to authenticated;

create policy "examens : lecture des siens"
  on public.exams for select to authenticated
  using (user_id = (select auth.uid()));

create policy "questions d'examen : lecture des siennes"
  on public.exam_items for select to authenticated
  using (exists (
    select 1 from public.exams e
    where e.id = exam_id and e.user_id = (select auth.uid())
  ));

-- Tentatives et révisions : lecture, et suppression pour remettre à zéro.
grant select, delete on table public.attempts, public.revisions to authenticated;

create policy "tentatives : lecture des siennes"
  on public.attempts for select to authenticated
  using (user_id = (select auth.uid()));
create policy "tentatives : suppression des siennes"
  on public.attempts for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "révisions : lecture des siennes"
  on public.revisions for select to authenticated
  using (user_id = (select auth.uid()));
create policy "révisions : suppression des siennes"
  on public.revisions for delete to authenticated
  using (user_id = (select auth.uid()));

-- Parcours de scènes : données déclaratives, sans enjeu de correction.
grant select, insert, delete on table public.simulation_runs to authenticated;

create policy "parcours : lecture des siens"
  on public.simulation_runs for select to authenticated
  using (user_id = (select auth.uid()));
create policy "parcours : ajout pour soi, sur une scène publiée"
  on public.simulation_runs for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.simulation_scenes s
      where s.id = scene_id and s.status = 'published'
    )
  );
create policy "parcours : suppression des siens"
  on public.simulation_runs for delete to authenticated
  using (user_id = (select auth.uid()));
