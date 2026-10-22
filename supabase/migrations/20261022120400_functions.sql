-- KODI — fonctions appelables par l'application (RPC).
--
-- Toutes sont SECURITY DEFINER avec search_path vide : elles lisent les
-- bonnes réponses (table question_answers, inaccessible aux clients) et
-- vérifient elles-mêmes l'identité (auth.uid()) et la propriété des données.
-- Erreurs : message « KODI_… », interprété par l'application.

-- ---------------------------------------------------------------------------
-- Paramètres de l'examen blanc (format vérifié : 40 questions, réussite à 35)
-- ---------------------------------------------------------------------------
create or replace function private.exam_question_count() returns smallint
language sql immutable set search_path = '' as $$ select 40::smallint $$;

create or replace function private.exam_pass_mark() returns smallint
language sql immutable set search_path = '' as $$ select 35::smallint $$;

-- ---------------------------------------------------------------------------
-- Utilitaires internes
-- ---------------------------------------------------------------------------
create or replace function private.require_user()
returns uuid
language plpgsql
stable
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'KODI_NOT_AUTHENTICATED' using errcode = '42501';
  end if;
  return uid;
end;
$$;

-- Dédoublonne, trie et vérifie que les propositions appartiennent à la question.
create or replace function private.normalize_choices(p_question uuid, p_choices uuid[])
returns uuid[]
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result uuid[];
begin
  select array_agg(distinct c order by c) into result from unnest(p_choices) as c;
  if result is null or cardinality(result) = 0 then
    raise exception 'KODI_EMPTY_ANSWER' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from unnest(result) as c
    where not exists (
      select 1 from public.question_choices qc where qc.id = c and qc.question_id = p_question
    )
  ) then
    raise exception 'KODI_INVALID_CHOICES' using errcode = 'P0001';
  end if;
  return result;
end;
$$;

create or replace function private.correct_choices(p_question uuid)
returns uuid[]
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(array_agg(a.choice_id order by a.choice_id), '{}')
  from public.question_answers a
  where a.question_id = p_question;
$$;

create or replace function private.is_answer_correct(p_question uuid, p_normalized uuid[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_normalized is not null
     and cardinality(private.correct_choices(p_question)) > 0
     and p_normalized = private.correct_choices(p_question);
$$;

-- Intervalle de révision selon la boîte de Leitner.
create or replace function private.revision_interval(p_box smallint)
returns interval
language sql
immutable
set search_path = ''
as $$
  select case p_box
    when 1 then interval '1 day'
    when 2 then interval '2 days'
    when 3 then interval '4 days'
    when 4 then interval '7 days'
    else interval '15 days'
  end;
$$;

create or replace function private.record_revision(p_user uuid, p_question uuid, p_correct boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.revisions as r (user_id, question_id, box, correct_streak, due_at, last_answered_at)
  values (
    p_user, p_question,
    case when p_correct then 2 else 1 end,
    case when p_correct then 1 else 0 end,
    now() + case when p_correct then private.revision_interval(2::smallint) else interval '10 minutes' end,
    now()
  )
  on conflict (user_id, question_id) do update set
    box = case when p_correct then least(r.box + 1, 5) else 1 end,
    correct_streak = case when p_correct then r.correct_streak + 1 else 0 end,
    due_at = now() + case
      when p_correct then private.revision_interval(least(r.box + 1, 5)::smallint)
      else interval '10 minutes'
    end,
    last_answered_at = now(),
    updated_at = now();
end;
$$;

revoke execute on function
  private.require_user(),
  private.normalize_choices(uuid, uuid[]),
  private.correct_choices(uuid),
  private.is_answer_correct(uuid, uuid[]),
  private.revision_interval(smallint),
  private.record_revision(uuid, uuid, boolean),
  private.exam_question_count(),
  private.exam_pass_mark()
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Pratique : correction immédiate après réponse
-- ---------------------------------------------------------------------------
create or replace function public.submit_practice_answer(p_question_id uuid, p_choice_ids uuid[])
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
  q public.questions%rowtype;
  normalized uuid[];
  correct boolean;
begin
  select * into q from public.questions where id = p_question_id and status = 'published';
  if not found then
    raise exception 'KODI_QUESTION_UNAVAILABLE' using errcode = 'P0001';
  end if;

  -- Empêche d'obtenir en « pratique » la réponse d'une question de son examen en cours.
  if exists (
    select 1 from public.exam_items i join public.exams e on e.id = i.exam_id
    where e.user_id = uid and e.status = 'in_progress' and i.question_id = p_question_id
  ) then
    raise exception 'KODI_QUESTION_IN_ACTIVE_EXAM' using errcode = 'P0001';
  end if;

  normalized := private.normalize_choices(p_question_id, p_choice_ids);
  correct := private.is_answer_correct(p_question_id, normalized);

  insert into public.attempts (user_id, question_id, context, selected_choice_ids, is_correct)
  values (uid, p_question_id, 'practice', normalized, correct);
  perform private.record_revision(uid, p_question_id, correct);

  return jsonb_build_object(
    'is_correct', correct,
    'correct_choice_ids', to_jsonb(private.correct_choices(p_question_id)),
    'explanation', q.explanation,
    'sources', q.sources
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Examen blanc
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
  from public.questions where status = 'published' and answer_count > 0;
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
    where status = 'published' and answer_count > 0
    order by random()
    limit total
  ) picked;

  perform private.log_event(uid, 'exam.started', 'exams', new_exam::text);
  return new_exam;
end;
$$;

create or replace function private.owned_exam(p_exam uuid, p_user uuid)
returns public.exams
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  e public.exams%rowtype;
begin
  select * into e from public.exams where id = p_exam and user_id = p_user;
  if not found then
    -- Même message qu'un examen inexistant : on ne révèle rien sur les autres.
    raise exception 'KODI_EXAM_NOT_FOUND' using errcode = 'P0001';
  end if;
  return e;
end;
$$;
revoke execute on function private.owned_exam(uuid, uuid) from public, anon, authenticated;

-- Énoncés et propositions, SANS indication de bonne réponse.
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
    'status', e.status,
    'question_count', e.question_count,
    'pass_mark', e.pass_mark,
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

create or replace function public.answer_exam_question(p_exam_id uuid, p_position integer, p_choice_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
  e public.exams := private.owned_exam(p_exam_id, uid);
  qid uuid;
begin
  if e.status <> 'in_progress' then
    raise exception 'KODI_EXAM_CLOSED' using errcode = 'P0001';
  end if;
  select question_id into qid from public.exam_items
  where exam_id = e.id and position = p_position;
  if not found then
    raise exception 'KODI_INVALID_POSITION' using errcode = 'P0001';
  end if;
  update public.exam_items
  set selected_choice_ids = private.normalize_choices(qid, p_choice_ids),
      answered_at = now()
  where exam_id = e.id and position = p_position;
end;
$$;

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
  set is_correct = private.is_answer_correct(i.question_id, i.selected_choice_ids)
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
  has_passed := total_correct >= e.pass_mark;

  update public.exams
  set status = 'submitted', score = total_correct, passed = has_passed, submitted_at = now()
  where id = e.id;

  perform private.log_event(uid, 'exam.submitted', 'exams', e.id::text,
    jsonb_build_object('score', total_correct, 'passed', has_passed));

  return jsonb_build_object(
    'score', total_correct,
    'passed', has_passed,
    'question_count', e.question_count,
    'pass_mark', e.pass_mark
  );
end;
$$;

create or replace function public.abandon_exam(p_exam_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
  e public.exams := private.owned_exam(p_exam_id, uid);
begin
  if e.status <> 'in_progress' then
    raise exception 'KODI_EXAM_CLOSED' using errcode = 'P0001';
  end if;
  update public.exams set status = 'abandoned' where id = e.id;
  perform private.log_event(uid, 'exam.abandoned', 'exams', e.id::text);
end;
$$;

-- Corrigé : uniquement après la remise.
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
    'score', e.score,
    'passed', e.passed,
    'question_count', e.question_count,
    'pass_mark', e.pass_mark,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'position', i.position,
        'question_id', q.id,
        'prompt', q.prompt,
        'selected_choice_ids', to_jsonb(i.selected_choice_ids),
        'correct_choice_ids', to_jsonb(private.correct_choices(q.id)),
        'is_correct', i.is_correct,
        'explanation', q.explanation,
        'sources', q.sources,
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
-- Relecture éditoriale
-- ---------------------------------------------------------------------------
create or replace function private.require_editor()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
begin
  if not private.is_editor() then
    raise exception 'KODI_FORBIDDEN' using errcode = '42501';
  end if;
  return uid;
end;
$$;
revoke execute on function private.require_editor() from public, anon, authenticated;

create or replace function public.get_question_for_review(p_question_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_editor();
  q public.questions%rowtype;
begin
  select * into q from public.questions where id = p_question_id;
  if not found then
    raise exception 'KODI_QUESTION_UNAVAILABLE' using errcode = 'P0001';
  end if;
  return to_jsonb(q) || jsonb_build_object(
    'correct_choice_ids', to_jsonb(private.correct_choices(q.id)),
    'choices', (
      select jsonb_agg(jsonb_build_object('id', c.id, 'label', c.label) order by c.position)
      from public.question_choices c where c.question_id = q.id
    )
  );
end;
$$;

create or replace function public.review_question(p_question_id uuid, p_status public.content_status)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_editor();
begin
  update public.questions
  set status = p_status,
      reviewed_by = case when p_status = 'published' then uid else reviewed_by end,
      reviewed_at = case when p_status = 'published' then now() else reviewed_at end
  where id = p_question_id;
  if not found then
    raise exception 'KODI_QUESTION_UNAVAILABLE' using errcode = 'P0001';
  end if;
  perform private.log_event(uid, 'content.reviewed', 'questions', p_question_id::text,
    jsonb_build_object('status', p_status));
end;
$$;

-- ---------------------------------------------------------------------------
-- Droits d'exécution : utilisateurs connectés uniquement
-- ---------------------------------------------------------------------------
revoke execute on function
  public.submit_practice_answer(uuid, uuid[]),
  public.start_exam(),
  public.get_exam(uuid),
  public.answer_exam_question(uuid, integer, uuid[]),
  public.submit_exam(uuid),
  public.abandon_exam(uuid),
  public.get_exam_correction(uuid),
  public.get_question_for_review(uuid),
  public.review_question(uuid, public.content_status)
  from public, anon;

grant execute on function
  public.submit_practice_answer(uuid, uuid[]),
  public.start_exam(),
  public.get_exam(uuid),
  public.answer_exam_question(uuid, integer, uuid[]),
  public.submit_exam(uuid),
  public.abandon_exam(uuid),
  public.get_exam_correction(uuid),
  public.get_question_for_review(uuid),
  public.review_question(uuid, public.content_status)
  to authenticated;
