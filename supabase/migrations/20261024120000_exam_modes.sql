-- KODI — modes d'examen (phase 4).
--
--   officiel  : 40 questions, réussite à 35 (format vérifié, voir docs/SOURCES.md)
--   express   : 10 questions, sans seuil réglementaire
--   cible     : 20 questions sur des compétences choisies
--   revanche  : 10 questions sur les compétences ratées
--
-- Toujours : questions validées (published), prévues pour l'examen, jamais de
-- démonstration ; questions inédites d'abord ; tirage, enregistrement et
-- correction faits ici, jamais par le client.

-- ---------------------------------------------------------------------------
-- Colonnes
-- ---------------------------------------------------------------------------
alter table public.exams
  add column mode text not null default 'officiel'
    check (mode in ('officiel', 'express', 'cible', 'revanche')),
  add column target_competence_ids uuid[],
  add column unseen_count smallint not null default 0 check (unseen_count >= 0),
  alter column pass_mark drop not null;

-- Seul le mode officiel a un seuil (35/40) ; les autres donnent un score.
alter table public.exams
  drop constraint exams_result_when_submitted,
  add constraint exams_result_when_submitted check (
    (status = 'submitted') = (score is not null and submitted_at is not null)
  ),
  add constraint exams_passed_only_with_pass_mark check (
    (passed is null) = (status <> 'submitted' or pass_mark is null)
  ),
  add constraint exams_official_format check (
    mode <> 'officiel' or (question_count = 40 and pass_mark = 35)
  ),
  add constraint exams_targets_when_needed check (
    (mode in ('cible', 'revanche')) = (target_competence_ids is not null and cardinality(target_competence_ids) > 0)
  );

create index exam_items_question_idx on public.exam_items (question_id);

-- ---------------------------------------------------------------------------
-- Paramètres des modes
-- ---------------------------------------------------------------------------
create or replace function private.exam_mode_count(p_mode text)
returns smallint
language sql
immutable
set search_path = ''
as $$
  select case p_mode
    when 'officiel' then 40
    when 'express' then 10
    when 'cible' then 20
    when 'revanche' then 10
  end::smallint;
$$;

create or replace function private.exam_mode_pass_mark(p_mode text)
returns smallint
language sql
immutable
set search_path = ''
as $$
  select case p_mode when 'officiel' then 35 end::smallint;
$$;

-- Compétences « ratées » : au moins une erreur et pas encore maîtrisées
-- (maîtrisée = au moins 3 réponses, score ≥ 0,8 et confiance ≥ 0,5).
create or replace function private.failed_competences(p_user uuid)
returns uuid[]
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(array_agg(c.id order by c.id), '{}')
  from public.competences c
  cross join lateral private.competence_mastery(p_user, c.id, now() + interval '1 microsecond') m
  where c.status = 'published'
    and exists (
      select 1 from public.attempts a
      join public.question_competences qc on qc.question_id = a.question_id
      where a.user_id = p_user and qc.competence_id = c.id and not a.is_correct
    )
    and not (m.attempts >= 3 and m.score >= 0.8 and m.confidence >= 0.5);
$$;

-- Compétences visées : choisies (cible) ou ratées (revanche).
create or replace function private.exam_targets(p_user uuid, p_mode text, p_competence_refs text[])
returns uuid[]
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result uuid[];
begin
  if p_mode not in ('officiel', 'express', 'cible', 'revanche') then
    raise exception 'KODI_INVALID_MODE' using errcode = 'P0001';
  end if;
  if p_mode = 'cible' then
    select coalesce(array_agg(c.id order by c.id), '{}') into result
    from public.competences c
    where c.status = 'published' and c.external_ref = any (coalesce(p_competence_refs, '{}'));
    if cardinality(result) = 0 then
      raise exception 'KODI_NO_TARGET' using errcode = 'P0001';
    end if;
    return result;
  end if;
  if p_mode = 'revanche' then
    result := private.failed_competences(p_user);
    if cardinality(result) = 0 then
      raise exception 'KODI_NO_FAILED_COMPETENCES' using errcode = 'P0001';
    end if;
    return result;
  end if;
  return null;
end;
$$;

-- Questions tirables, les inédites (jamais vues par la personne) d'abord,
-- puis les moins récemment vues ; ordre aléatoire à l'intérieur de chaque groupe.
create or replace function private.exam_pool(p_user uuid, p_targets uuid[])
returns table (question_id uuid, last_seen timestamptz)
language sql
volatile
security definer
set search_path = ''
as $$
  with seen as (
    select s.question_id, max(s.at) as at from (
      select a.question_id, a.answered_at as at from public.attempts a where a.user_id = p_user
      union all
      select i.question_id, e.started_at from public.exam_items i
      join public.exams e on e.id = i.exam_id where e.user_id = p_user
    ) s
    group by s.question_id
  )
  select q.id, seen.at
  from public.questions q
  left join seen on seen.question_id = q.id
  where q.status = 'published' and q.exam_eligible and not q.is_demo and q.answer_count > 0
    and (
      p_targets is null
      or exists (
        select 1 from public.question_competences qc
        where qc.question_id = q.id and qc.competence_id = any (p_targets)
      )
    )
  order by seen.at nulls first;
$$;

revoke execute on function
  private.exam_mode_count(text),
  private.exam_mode_pass_mark(text),
  private.failed_competences(uuid),
  private.exam_targets(uuid, text, text[]),
  private.exam_pool(uuid, uuid[])
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Disponibilité (avant de lancer) : nombres uniquement, aucune question.
-- ---------------------------------------------------------------------------
create or replace function public.exam_availability(p_mode text, p_competence_refs text[] default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
  targets uuid[];
  available integer;
  unseen integer;
begin
  begin
    targets := private.exam_targets(uid, p_mode, p_competence_refs);
  exception when others then
    if sqlerrm in ('KODI_NO_FAILED_COMPETENCES', 'KODI_NO_TARGET') then
      return jsonb_build_object('mode', p_mode, 'required', private.exam_mode_count(p_mode),
        'available', 0, 'unseen', 0, 'reason', sqlerrm, 'target_refs', '[]'::jsonb);
    end if;
    raise;
  end;
  select count(*), count(*) filter (where p.last_seen is null) into available, unseen
  from private.exam_pool(uid, targets) p;
  return jsonb_build_object(
    'mode', p_mode,
    'required', private.exam_mode_count(p_mode),
    'available', available,
    'unseen', unseen,
    'reason', case when available < private.exam_mode_count(p_mode) then 'KODI_NOT_ENOUGH_QUESTIONS' end,
    'target_refs', coalesce((
      select jsonb_agg(c.external_ref order by c.external_ref)
      from public.competences c where c.id = any (targets)
    ), '[]'::jsonb)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Lancement d'un examen
-- ---------------------------------------------------------------------------
create or replace function public.start_exam_mode(p_mode text, p_competence_refs text[] default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
  targets uuid[];
  total smallint;
  available integer;
  new_exam uuid;
  new_unseen integer;
begin
  if exists (select 1 from public.exams where user_id = uid and status = 'in_progress') then
    raise exception 'KODI_EXAM_IN_PROGRESS' using errcode = 'P0001';
  end if;
  targets := private.exam_targets(uid, p_mode, p_competence_refs);
  total := private.exam_mode_count(p_mode);

  select count(*), count(*) filter (where p.last_seen is null) into available, new_unseen
  from private.exam_pool(uid, targets) p;
  -- Jamais d'examen incomplet.
  if available < total then
    raise exception 'KODI_NOT_ENOUGH_QUESTIONS'
      using errcode = 'P0001', detail = format('%s/%s', available, total);
  end if;
  -- Les inédites sont tirées en premier : leur nombre dans l'examen est donc connu.
  new_unseen := least(new_unseen, total);

  insert into public.exams (user_id, mode, question_count, pass_mark, target_competence_ids, unseen_count)
  values (uid, p_mode, total, private.exam_mode_pass_mark(p_mode), targets, new_unseen)
  returning id into new_exam;

  -- Puis les questions sont mélangées dans l'examen.
  insert into public.exam_items (exam_id, position, question_id)
  select new_exam, row_number() over (order by random()), d.question_id
  from (
    select p.question_id from private.exam_pool(uid, targets) p
    order by p.last_seen nulls first, random()
    limit total
  ) d;

  perform private.log_event(uid, 'exam.started', 'exams', new_exam::text, jsonb_build_object('mode', p_mode));
  return new_exam;
end;
$$;

-- L'ancien point d'entrée lance le mode officiel.
create or replace function public.start_exam()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
  existing uuid;
begin
  select id into existing from public.exams where user_id = uid and status = 'in_progress';
  if found then
    return existing;
  end if;
  return public.start_exam_mode('officiel');
end;
$$;

-- ---------------------------------------------------------------------------
-- Lecture de l'examen : ajoute le mode (aucune bonne réponse)
-- ---------------------------------------------------------------------------
create or replace function public.get_exam(p_exam_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
  e public.exams := private.owned_exam(p_exam_id, uid);
begin
  return jsonb_build_object(
    'id', e.id,
    'mode', e.mode,
    'status', e.status,
    'question_count', e.question_count,
    'pass_mark', e.pass_mark,
    'unseen_count', e.unseen_count,
    'score', e.score,
    'passed', e.passed,
    'started_at', e.started_at,
    'submitted_at', e.submitted_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'position', i.position,
        'question_id', q.id,
        'prompt', q.prompt,
        'answer_count', q.answer_count,
        'selected_choice_ids', to_jsonb(i.selected_choice_ids),
        'choices', (
          select jsonb_agg(jsonb_build_object('id', c.id, 'label', c.label) order by c.position)
          from public.question_choices c where c.question_id = q.id
        )
      ) order by i.position)
      from public.exam_items i join public.questions q on q.id = i.question_id
      where i.exam_id = e.id
    ), '[]'::jsonb)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Remise : barème tout ou rien, question sans réponse = fausse
-- ---------------------------------------------------------------------------
create or replace function public.submit_exam(p_exam_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
  e public.exams;
  total_correct smallint;
  has_passed boolean;
begin
  select * into e from public.exams
  where id = p_exam_id and user_id = uid
  for update;
  if not found then
    raise exception 'KODI_EXAM_NOT_FOUND' using errcode = 'P0001';
  end if;
  if e.status <> 'in_progress' then
    raise exception 'KODI_EXAM_CLOSED' using errcode = 'P0001';
  end if;

  update public.exam_items i
  set is_correct = coalesce(private.is_answer_correct(i.question_id, i.selected_choice_ids), false)
  where i.exam_id = e.id;

  insert into public.attempts (user_id, question_id, context, exam_id, selected_choice_ids, is_correct)
  select uid, i.question_id, 'exam', e.id, i.selected_choice_ids, i.is_correct
  from public.exam_items i
  where i.exam_id = e.id and i.selected_choice_ids is not null;

  perform private.record_revision(uid, i.question_id, i.is_correct)
  from public.exam_items i
  where i.exam_id = e.id and i.selected_choice_ids is not null;

  select count(*) filter (where is_correct) into total_correct
  from public.exam_items where exam_id = e.id;
  has_passed := case when e.pass_mark is null then null else total_correct >= e.pass_mark end;

  update public.exams
  set status = 'submitted', score = total_correct, passed = has_passed, submitted_at = now()
  where id = e.id;

  perform private.log_event(uid, 'exam.submitted', 'exams', e.id::text,
    jsonb_build_object('mode', e.mode, 'score', total_correct, 'passed', has_passed));

  return jsonb_build_object(
    'mode', e.mode,
    'score', total_correct,
    'passed', has_passed,
    'question_count', e.question_count,
    'pass_mark', e.pass_mark
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Corrigé et bilan par compétence : uniquement après la remise
-- ---------------------------------------------------------------------------
create or replace function public.get_exam_correction(p_exam_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
  e public.exams := private.owned_exam(p_exam_id, uid);
begin
  if e.status <> 'submitted' then
    raise exception 'KODI_EXAM_NOT_SUBMITTED' using errcode = 'P0001';
  end if;
  return jsonb_build_object(
    'id', e.id,
    'mode', e.mode,
    'score', e.score,
    'passed', e.passed,
    'question_count', e.question_count,
    'pass_mark', e.pass_mark,
    'unseen_count', e.unseen_count,
    'submitted_at', e.submitted_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'position', i.position,
        'question_id', q.id,
        'prompt', q.prompt,
        'answer_count', q.answer_count,
        'selected_choice_ids', to_jsonb(i.selected_choice_ids),
        'correct_choice_ids', to_jsonb(private.correct_choices(q.id)),
        'is_correct', i.is_correct,
        'explanation', q.explanation,
        'sources', q.sources,
        'competence_refs', coalesce((
          select jsonb_agg(c.external_ref order by c.external_ref)
          from public.question_competences qc join public.competences c on c.id = qc.competence_id
          where qc.question_id = q.id and c.external_ref is not null
        ), '[]'::jsonb),
        'choices', (
          select jsonb_agg(jsonb_build_object('id', c.id, 'label', c.label) order by c.position)
          from public.question_choices c where c.question_id = q.id
        )
      ) order by i.position)
      from public.exam_items i join public.questions q on q.id = i.question_id
      where i.exam_id = e.id
    ), '[]'::jsonb),
    'competences', private.competence_report(uid, e.id)
  );
end;
$$;

-- Bilan par compétence d'un examen remis, ou de tous les examens remis (p_exam null).
create or replace function private.competence_report(p_user uuid, p_exam uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'competence_ref', r.ref,
    'title', r.title,
    'correct', r.correct,
    'total', r.total
  ) order by r.correct::numeric / r.total, r.ref), '[]'::jsonb)
  from (
    select c.external_ref as ref, c.title,
           count(*) filter (where i.is_correct)::int as correct,
           count(*)::int as total
    from public.exam_items i
    join public.exams e on e.id = i.exam_id
    join public.question_competences qc on qc.question_id = i.question_id
    join public.competences c on c.id = qc.competence_id
    where e.user_id = p_user and e.status = 'submitted'
      and (p_exam is null or e.id = p_exam)
    group by c.external_ref, c.title
  ) r;
$$;

revoke execute on function private.competence_report(uuid, uuid) from public, anon, authenticated;

create or replace function public.get_exam_competence_stats()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select private.competence_report(private.require_user(), null);
$$;

-- ---------------------------------------------------------------------------
-- Droits d'exécution
-- ---------------------------------------------------------------------------
revoke execute on function
  public.exam_availability(text, text[]),
  public.start_exam_mode(text, text[]),
  public.start_exam(),
  public.get_exam(uuid),
  public.submit_exam(uuid),
  public.get_exam_correction(uuid),
  public.get_exam_competence_stats()
  from public, anon;

grant execute on function
  public.exam_availability(text, text[]),
  public.start_exam_mode(text, text[]),
  public.start_exam(),
  public.get_exam(uuid),
  public.submit_exam(uuid),
  public.get_exam_correction(uuid),
  public.get_exam_competence_stats()
  to authenticated;
