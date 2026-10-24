-- ===========================================================================
-- Freemium et abonnements Stripe (D-030)
--
-- - Les droits Premium sont décidés ici, côté serveur : private.has_premium.
-- - L'abonnement n'est écrit que par le webhook Stripe du serveur KODI, via
--   public.billing_apply_subscription, exécutable par service_role seulement.
-- - Chaque événement Stripe est enregistré par son identifiant : un même
--   événement reçu deux fois n'est appliqué qu'une fois.
-- - Offre gratuite : un examen par jour (jour civil de Paris).
-- - Leçons Premium : lisibles seulement avec un abonnement actif.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Abonnements : statuts Stripe, résiliation en fin de période, rétractation
-- ---------------------------------------------------------------------------
alter table public.subscriptions drop constraint subscriptions_status_check;
alter table public.subscriptions
  add constraint subscriptions_status_check check (status in (
    'active', 'trialing', 'past_due', 'canceled', 'expired', 'incomplete', 'unpaid', 'paused'
  )),
  add column cancel_at_period_end boolean not null default false,
  add column provider_price_id text,
  add column started_at timestamptz,
  add column livemode boolean not null default false;

grant select (cancel_at_period_end, started_at) on table public.subscriptions to authenticated;

-- Statuts donnant accès à Premium. « past_due » : paiement échoué, Stripe
-- relance ; l'accès est conservé jusqu'à la fin des relances (passage à
-- « canceled » ou « unpaid »). Marge de 2 jours après la fin de période pour
-- laisser arriver le renouvellement.
create or replace function private.has_premium(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = p_user
      and s.plan = 'premium'
      and s.status in ('active', 'trialing', 'past_due')
      and (s.current_period_end is null or s.current_period_end + interval '2 days' > now())
  );
$$;
revoke execute on function private.has_premium(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Journal des événements Stripe déjà traités (idempotence)
-- ---------------------------------------------------------------------------
create table private.billing_events (
  event_id text primary key check (event_id ~ '^evt_[A-Za-z0-9]+$'),
  event_type text not null,
  outcome text not null check (outcome in ('applique', 'ignore')),
  received_at timestamptz not null default now()
);
alter table private.billing_events enable row level security;
revoke all on table private.billing_events from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Application d'un événement (appelée par le webhook, après vérification de
-- la signature et lecture de l'abonnement à jour chez Stripe).
-- Renvoie 'applique', 'ignore' ou 'deja-traite'.
-- ---------------------------------------------------------------------------
create or replace function public.billing_apply_subscription(
  p_event_id text,
  p_event_type text,
  p_user uuid,
  p_customer text,
  p_subscription text,
  p_price text,
  p_status text,
  p_current_period_end timestamptz,
  p_cancel_at_period_end boolean,
  p_started_at timestamptz,
  p_livemode boolean
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_row public.subscriptions%rowtype;
  usable boolean;
begin
  usable := p_user is not null
    and exists (select 1 from auth.users u where u.id = p_user)
    and p_subscription is not null
    and p_status in ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused');

  insert into private.billing_events (event_id, event_type, outcome)
  values (p_event_id, p_event_type, case when usable then 'applique' else 'ignore' end)
  on conflict (event_id) do nothing;
  if not found then
    return 'deja-traite';
  end if;
  if not usable then
    return 'ignore';
  end if;

  select * into current_row from public.subscriptions where user_id = p_user for update;
  -- Un compte ne peut pas être rattaché au client Stripe d'un autre compte.
  if exists (
    select 1 from public.subscriptions s
    where s.provider_customer_id = p_customer and s.user_id <> p_user
  ) then
    update private.billing_events set outcome = 'ignore' where event_id = p_event_id;
    return 'ignore';
  end if;
  -- Un ancien abonnement (remplacé) ne doit pas écraser l'abonnement en cours.
  if current_row.provider_subscription_id is not null
     and current_row.provider_subscription_id <> p_subscription
     and current_row.status in ('active', 'trialing', 'past_due')
     and p_status not in ('active', 'trialing', 'past_due') then
    update private.billing_events set outcome = 'ignore' where event_id = p_event_id;
    return 'ignore';
  end if;

  insert into public.subscriptions as s (
    user_id, plan, status, current_period_end, provider, provider_customer_id,
    provider_subscription_id, provider_price_id, cancel_at_period_end, started_at, livemode
  )
  values (
    p_user,
    case when p_status in ('active', 'trialing', 'past_due') then 'premium' else 'free' end,
    case when p_status = 'incomplete_expired' then 'expired' else p_status end,
    p_current_period_end, 'stripe', p_customer, p_subscription, p_price,
    coalesce(p_cancel_at_period_end, false), p_started_at, coalesce(p_livemode, false)
  )
  on conflict (user_id) do update set
    plan = excluded.plan,
    status = excluded.status,
    current_period_end = excluded.current_period_end,
    provider = excluded.provider,
    provider_customer_id = excluded.provider_customer_id,
    provider_subscription_id = excluded.provider_subscription_id,
    provider_price_id = excluded.provider_price_id,
    cancel_at_period_end = excluded.cancel_at_period_end,
    started_at = excluded.started_at,
    livemode = excluded.livemode;
  return 'applique';
end;
$$;

revoke execute on function public.billing_apply_subscription(
  text, text, uuid, text, text, text, text, timestamptz, boolean, timestamptz, boolean
) from public, anon, authenticated;
grant execute on function public.billing_apply_subscription(
  text, text, uuid, text, text, text, text, timestamptz, boolean, timestamptz, boolean
) to service_role;

-- Identifiants Stripe d'un compte (serveur seulement : portail, résiliation).
create or replace function public.billing_customer_of(p_user uuid)
returns table (customer_id text, subscription_id text, status text, started_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select s.provider_customer_id, s.provider_subscription_id, s.status, s.started_at
  from public.subscriptions s
  where s.user_id = p_user and s.provider = 'stripe';
$$;
revoke execute on function public.billing_customer_of(uuid) from public, anon, authenticated;
grant execute on function public.billing_customer_of(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Droits de la personne connectée (lecture seule)
-- ---------------------------------------------------------------------------
create or replace function private.exams_started_today(p_user uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer from public.exams e
  where e.user_id = p_user
    and (e.started_at at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date;
$$;
revoke execute on function private.exams_started_today(uuid) from public, anon, authenticated;

create or replace function public.my_entitlements()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
  s public.subscriptions%rowtype;
begin
  select * into s from public.subscriptions where user_id = uid;
  return jsonb_build_object(
    'premium', private.has_premium(uid),
    'plan', coalesce(s.plan, 'free'),
    'status', s.status,
    'current_period_end', s.current_period_end,
    'cancel_at_period_end', coalesce(s.cancel_at_period_end, false),
    'started_at', s.started_at,
    'exams_today', private.exams_started_today(uid),
    'free_daily_exams', 1
  );
end;
$$;
revoke execute on function public.my_entitlements() from public, anon;
grant execute on function public.my_entitlements() to authenticated;

-- ---------------------------------------------------------------------------
-- Offre gratuite : un examen par jour
-- ---------------------------------------------------------------------------
create or replace function private.require_exam_allowance(p_user uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.has_premium(p_user) and private.exams_started_today(p_user) >= 1 then
    raise exception 'KODI_DAILY_EXAM_LIMIT' using errcode = 'P0001';
  end if;
end;
$$;
revoke execute on function private.require_exam_allowance(uuid) from public, anon, authenticated;

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
  perform private.require_exam_allowance(uid);
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
  limited boolean := not private.has_premium(uid) and private.exams_started_today(uid) >= 1;
begin
  begin
    targets := private.exam_targets(uid, p_mode, p_competence_refs);
  exception when others then
    if sqlerrm in ('KODI_NO_FAILED_COMPETENCES', 'KODI_NO_TARGET') then
      return jsonb_build_object('mode', p_mode, 'required', private.exam_mode_count(p_mode),
        'available', 0, 'unseen', 0, 'reason', sqlerrm, 'target_refs', '[]'::jsonb,
        'daily_limit_reached', limited);
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
    'reason', case
      when available < private.exam_mode_count(p_mode) then 'KODI_NOT_ENOUGH_QUESTIONS'
      when limited then 'KODI_DAILY_EXAM_LIMIT'
    end,
    'daily_limit_reached', limited,
    'target_refs', coalesce((
      select jsonb_agg(c.external_ref order by c.external_ref)
      from public.competences c where c.id = any (targets)
    ), '[]'::jsonb)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Leçons Premium : réservées aux abonnés (le texte n'est pas servi sinon)
-- ---------------------------------------------------------------------------
alter table public.lessons
  add column access text not null default 'gratuit' check (access in ('gratuit', 'premium'));

-- Variante sans argument, pour les politiques : on ne peut tester que soi-même.
create or replace function private.current_user_has_premium()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.has_premium((select auth.uid())), false);
$$;
revoke execute on function private.current_user_has_premium() from public;
grant execute on function private.current_user_has_premium() to anon, authenticated;

drop policy "leçons : publiées, ou équipe" on public.lessons;
create policy "leçons : publiées (Premium pour les abonnés), ou équipe"
  on public.lessons for select to anon, authenticated
  using (
    (status = 'published' and (access = 'gratuit' or (select private.current_user_has_premium())))
    or (select private.is_editor())
  );
