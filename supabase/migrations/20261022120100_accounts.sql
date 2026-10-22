-- KODI — comptes : profils, préférences, abonnements.

-- ---------------------------------------------------------------------------
-- Profils
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '' check (char_length(first_name) <= 30),
  daily_goal smallint not null default 20 check (daily_goal in (10, 20, 40)),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_touch
  before update on public.profiles
  for each row execute function private.touch_updated_at();

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
-- Seules ces colonnes sont modifiables par l'utilisateur.
grant update (first_name, daily_goal, onboarding_completed) on table public.profiles to authenticated;

create policy "profils : lecture du sien"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profils : modification du sien"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Préférences d'affichage
-- ---------------------------------------------------------------------------
create table public.preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  motion text not null default 'system' check (motion in ('full', 'reduce', 'system')),
  updated_at timestamptz not null default now()
);

create trigger preferences_touch
  before update on public.preferences
  for each row execute function private.touch_updated_at();

alter table public.preferences enable row level security;
revoke all on table public.preferences from anon, authenticated;
grant select on table public.preferences to authenticated;
grant update (theme, motion) on table public.preferences to authenticated;

create policy "préférences : lecture des siennes"
  on public.preferences for select to authenticated
  using (user_id = (select auth.uid()));

create policy "préférences : modification des siennes"
  on public.preferences for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Abonnements (écrits uniquement côté serveur, par exemple par le webhook
-- du prestataire de paiement avec la clé secrète : jamais par le client)
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  status text not null default 'active'
    check (status in ('active', 'trialing', 'past_due', 'canceled', 'expired')),
  current_period_end timestamptz,
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger subscriptions_touch
  before update on public.subscriptions
  for each row execute function private.touch_updated_at();

alter table public.subscriptions enable row level security;
revoke all on table public.subscriptions from anon, authenticated;
grant select (user_id, plan, status, current_period_end, updated_at)
  on table public.subscriptions to authenticated;

create policy "abonnements : lecture du sien"
  on public.subscriptions for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function private.audit_subscription_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.plan is distinct from old.plan or new.status is distinct from old.status then
    perform private.log_event(
      new.user_id, 'subscription.changed', 'subscriptions', new.user_id::text,
      jsonb_build_object('from', jsonb_build_object('plan', old.plan, 'status', old.status),
                         'to', jsonb_build_object('plan', new.plan, 'status', new.status))
    );
  end if;
  return new;
end;
$$;

create trigger subscriptions_audit
  after update on public.subscriptions
  for each row execute function private.audit_subscription_change();

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
      and s.status in ('active', 'trialing')
      and (s.current_period_end is null or s.current_period_end > now())
  );
$$;
revoke execute on function private.has_premium(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Création automatique à l'inscription
-- ---------------------------------------------------------------------------
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.preferences (user_id) values (new.id);
  insert into public.subscriptions (user_id) values (new.id);
  perform private.log_event(new.id, 'account.created', 'auth.users', new.id::text);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.audit_profile_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed jsonb;
begin
  select coalesce(jsonb_agg(n.key), '[]'::jsonb) into changed
  from jsonb_each(to_jsonb(new)) n
  where n.key <> 'updated_at'
    and n.value is distinct from (to_jsonb(old) -> n.key);

  -- Pas d'événement pour une mise à jour sans changement (synchronisation).
  if jsonb_array_length(changed) > 0 then
    perform private.log_event(new.id, 'profile.updated', 'profiles', new.id::text,
                              jsonb_build_object('fields', changed));
  end if;
  return new;
end;
$$;

create trigger profiles_audit
  after update on public.profiles
  for each row execute function private.audit_profile_change();
