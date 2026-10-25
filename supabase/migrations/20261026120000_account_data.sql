-- ===========================================================================
-- Données du compte (audit de lancement, corrections B5 et B6)
--
-- - Progression pédagogique synchronisée : historique des réponses, leçons
--   terminées et séries, rangés tels quels (fusion côté appareil, par union).
-- - Suppression du compte par la personne elle-même.
-- - Export de toutes ses données.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Progression pédagogique
-- ---------------------------------------------------------------------------
create table public.learning_states (
  user_id uuid primary key references auth.users (id) on delete cascade,
  answers jsonb not null default '[]'::jsonb check (jsonb_typeof(answers) = 'array'),
  lessons jsonb not null default '{}'::jsonb check (jsonb_typeof(lessons) = 'object'),
  sessions jsonb not null default '[]'::jsonb check (jsonb_typeof(sessions) = 'array'),
  version integer not null default 0 check (version >= 0),
  updated_at timestamptz not null default now()
);

alter table public.learning_states enable row level security;
revoke all on table public.learning_states from anon, authenticated;
grant select on table public.learning_states to authenticated;

create policy "progression : lecture de la sienne"
  on public.learning_states for select to authenticated
  using (user_id = (select auth.uid()));

-- Mêmes limites que sur l'appareil (src/lib/pedagogy/history.ts, src/lib/history.ts).
create or replace function public.save_learning_state(
  p_answers jsonb,
  p_lessons jsonb,
  p_sessions jsonb,
  p_expected_version integer
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
  current_version integer;
begin
  if jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) > 5000
     or jsonb_typeof(p_lessons) <> 'object'
     or jsonb_typeof(p_sessions) <> 'array' or jsonb_array_length(p_sessions) > 200
     or octet_length(p_answers::text) + octet_length(p_lessons::text) + octet_length(p_sessions::text) > 3000000 then
    raise exception 'KODI_INVALID_LEARNING_STATE' using errcode = 'P0001';
  end if;

  insert into public.learning_states (user_id) values (uid) on conflict (user_id) do nothing;
  select version into current_version from public.learning_states where user_id = uid for update;
  -- Écriture conditionnelle : un autre appareil a pu écrire entre-temps.
  if current_version <> p_expected_version then
    raise exception 'KODI_SYNC_CONFLICT' using errcode = 'P0001';
  end if;

  update public.learning_states
  set answers = p_answers, lessons = p_lessons, sessions = p_sessions,
      version = current_version + 1, updated_at = now()
  where user_id = uid;
  return current_version + 1;
end;
$$;

revoke execute on function public.save_learning_state(jsonb, jsonb, jsonb, integer) from public, anon;
grant execute on function public.save_learning_state(jsonb, jsonb, jsonb, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Suppression du compte par la personne
-- ---------------------------------------------------------------------------
create or replace function public.delete_my_account(p_confirmation text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
begin
  if p_confirmation is distinct from 'SUPPRIMER' then
    raise exception 'KODI_CONFIRMATION_REQUIRED' using errcode = 'P0001';
  end if;
  -- Un abonnement payant en cours doit d'abord être résilié : sinon Stripe
  -- continuerait à prélever un compte qui n'existe plus.
  if exists (
    select 1 from public.subscriptions s
    where s.user_id = uid and s.provider = 'stripe'
      and s.status in ('active', 'trialing', 'past_due')
      and not s.cancel_at_period_end
  ) then
    raise exception 'KODI_ACTIVE_SUBSCRIPTION' using errcode = 'P0001';
  end if;
  -- Les données liées sont effacées en cascade ; le journal d'audit est
  -- anonymisé (actor_id à null).
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account(text) from public, anon;
grant execute on function public.delete_my_account(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Export de toutes les données de la personne
-- ---------------------------------------------------------------------------
create or replace function public.export_my_data()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
begin
  return jsonb_build_object(
    'format', 'kodi-export-1',
    'exporte_le', now(),
    'compte', (select jsonb_build_object('id', u.id, 'email', u.email, 'cree_le', u.created_at) from auth.users u where u.id = uid),
    'profil', (select to_jsonb(p) - 'id' from public.profiles p where p.id = uid),
    'preferences', (select to_jsonb(p) - 'user_id' from public.preferences p where p.user_id = uid),
    'abonnement', (
      select jsonb_build_object(
        'offre', s.plan, 'statut', s.status, 'fin_de_periode', s.current_period_end,
        'resiliation_programmee', s.cancel_at_period_end, 'debut', s.started_at, 'prestataire', s.provider)
      from public.subscriptions s where s.user_id = uid
    ),
    'progression', (select jsonb_build_object('reponses', l.answers, 'lecons', l.lessons, 'series', l.sessions, 'mise_a_jour', l.updated_at)
                    from public.learning_states l where l.user_id = uid),
    'examens', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id, 'mode', e.mode, 'statut', e.status, 'questions', e.question_count, 'score', e.score,
        'reussi', e.passed, 'debut', e.started_at, 'remise', e.submitted_at,
        'reponses', coalesce((
          select jsonb_agg(jsonb_build_object('position', i.position, 'question', q.external_ref,
                                              'reponse', i.selected_choice_ids, 'juste', i.is_correct) order by i.position)
          from public.exam_items i join public.questions q on q.id = i.question_id
          where i.exam_id = e.id), '[]'::jsonb)
      ) order by e.started_at)
      from public.exams e where e.user_id = uid), '[]'::jsonb),
    'tentatives', coalesce((
      select jsonb_agg(jsonb_build_object('question', q.external_ref, 'contexte', a.context,
                                          'juste', a.is_correct, 'le', a.answered_at) order by a.answered_at)
      from public.attempts a join public.questions q on q.id = a.question_id where a.user_id = uid), '[]'::jsonb),
    'revisions', coalesce((
      select jsonb_agg(jsonb_build_object('question', q.external_ref, 'boite', r.box, 'echeance', r.due_at))
      from public.revisions r join public.questions q on q.id = r.question_id where r.user_id = uid), '[]'::jsonb),
    'simulations', coalesce((
      select jsonb_agg(jsonb_build_object('scene', s.slug, 'camera', r.camera, 'le', r.completed_at) order by r.completed_at)
      from public.simulation_runs r join public.simulation_scenes s on s.id = r.scene_id where r.user_id = uid), '[]'::jsonb),
    'journal', coalesce((
      select jsonb_agg(jsonb_build_object('evenement', a.event_type, 'le', a.created_at) order by a.created_at)
      from public.audit_events a where a.actor_id = uid), '[]'::jsonb)
  );
end;
$$;

revoke execute on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;
