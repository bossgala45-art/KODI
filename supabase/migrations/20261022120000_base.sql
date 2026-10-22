-- KODI — socle : schéma privé, rôles éditoriaux, journal d'audit.
--
-- Principes de sécurité appliqués dans toutes les migrations :
--   * RLS activé sur chaque table du schéma public ;
--   * privilèges retirés par défaut à anon / authenticated, puis accordés
--     au minimum nécessaire (table par table, parfois colonne par colonne) ;
--   * toute écriture sensible passe par des fonctions SECURITY DEFINER
--     avec search_path vide, qui vérifient elles-mêmes auth.uid().

-- Fonctions internes, jamais exposées par l'API (PostgREST n'expose que public).
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

-- Par défaut, PostgreSQL rend toute nouvelle fonction exécutable par PUBLIC.
-- On retire ce droit globalement (un retrait limité à un schéma ne suffit
-- pas) : chaque fonction reçoit ensuite explicitement les droits voulus.
alter default privileges revoke execute on functions from public;

-- ---------------------------------------------------------------------------
-- Horodatage automatique
-- ---------------------------------------------------------------------------
create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Équipe éditoriale (relecture et publication des contenus)
-- ---------------------------------------------------------------------------
create type public.staff_role as enum ('editor', 'admin');

create table public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.staff_role not null,
  created_at timestamptz not null default now()
);

alter table public.staff enable row level security;
revoke all on table public.staff from anon, authenticated;
grant select on table public.staff to authenticated;

-- Chacun peut seulement savoir s'il fait lui-même partie de l'équipe.
create policy "staff : lecture de sa propre ligne"
  on public.staff for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function private.is_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff s where s.user_id = (select auth.uid())
  );
$$;
grant execute on function private.is_editor() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Journal d'audit (append-only)
-- ---------------------------------------------------------------------------
create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  event_type text not null check (event_type ~ '^[a-z_]+\.[a-z_]+$'),
  entity text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index audit_events_actor_idx on public.audit_events (actor_id, created_at desc);

alter table public.audit_events enable row level security;
revoke all on table public.audit_events from anon, authenticated;
grant select on table public.audit_events to authenticated;

-- Transparence : chacun peut consulter les événements qui le concernent.
create policy "audit : lecture de ses propres événements"
  on public.audit_events for select to authenticated
  using (actor_id = (select auth.uid()));

-- Immuable : aucune modification ni suppression, sauf l'anonymisation
-- automatique (actor_id -> null) lors de la suppression d'un compte.
create or replace function private.protect_audit_events()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
     and old.actor_id is not null
     and new.actor_id is null
     and new.event_type = old.event_type
     and new.entity is not distinct from old.entity
     and new.entity_id is not distinct from old.entity_id
     and new.metadata = old.metadata
     and new.created_at = old.created_at then
    return new;
  end if;
  raise exception 'audit_events est en ajout seul' using errcode = '42501';
end;
$$;

create trigger audit_events_immutable
  before update or delete on public.audit_events
  for each row execute function private.protect_audit_events();

create or replace function private.log_event(
  p_actor uuid,
  p_event_type text,
  p_entity text default null,
  p_entity_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.audit_events (actor_id, event_type, entity, entity_id, metadata)
  values (p_actor, p_event_type, p_entity, p_entity_id, coalesce(p_metadata, '{}'::jsonb));
$$;
revoke execute on function private.log_event(uuid, text, text, text, jsonb) from public, anon, authenticated;
