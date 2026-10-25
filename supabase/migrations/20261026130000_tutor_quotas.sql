-- ===========================================================================
-- Professeur IA : compteurs partagés entre toutes les instances du serveur
-- (audit de lancement, correction I5). Appelées par le serveur seulement
-- (service_role) ; aucune donnée personnelle : le client est une empreinte
-- salée et éphémère, jamais une adresse IP.
-- ===========================================================================

create table private.tutor_rate (
  client text primary key check (char_length(client) between 8 and 64),
  window_start timestamptz not null,
  hits integer not null check (hits >= 0)
);

create table private.tutor_daily (
  day date not null,
  client text not null check (char_length(client) between 8 and 64),
  ai_count integer not null default 0 check (ai_count >= 0),
  primary key (day, client)
);

create table private.tutor_budget (
  day date primary key,
  committed numeric(12, 6) not null default 0 check (committed >= 0)
);

alter table private.tutor_rate enable row level security;
alter table private.tutor_daily enable row level security;
alter table private.tutor_budget enable row level security;
revoke all on table private.tutor_rate, private.tutor_daily, private.tutor_budget from public, anon, authenticated;

-- Fenêtre d'une minute : true si la demande est acceptée.
create or replace function public.tutor_hit(p_client text, p_per_minute integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_ private.tutor_rate%rowtype;
begin
  insert into private.tutor_rate (client, window_start, hits) values (p_client, now(), 0)
  on conflict (client) do nothing;
  select * into row_ from private.tutor_rate where client = p_client for update;
  if row_.window_start <= now() - interval '1 minute' then
    update private.tutor_rate set window_start = now(), hits = 1 where client = p_client;
    return true;
  end if;
  if row_.hits >= p_per_minute then
    return false;
  end if;
  update private.tutor_rate set hits = hits + 1 where client = p_client;
  return true;
end;
$$;

create or replace function public.tutor_ai_used(p_client text)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select ai_count from private.tutor_daily
                   where day = (now() at time zone 'UTC')::date and client = p_client), 0);
$$;

create or replace function public.tutor_take_ai(p_client text, p_per_day integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  today date := (now() at time zone 'UTC')::date;
  used integer;
begin
  insert into private.tutor_daily (day, client) values (today, p_client) on conflict do nothing;
  select ai_count into used from private.tutor_daily where day = today and client = p_client for update;
  if used >= p_per_day then
    return false;
  end if;
  update private.tutor_daily set ai_count = ai_count + 1 where day = today and client = p_client;
  return true;
end;
$$;

-- Réserve le pire cas sur le budget du jour ; false si le budget serait dépassé.
create or replace function public.tutor_reserve(p_amount numeric, p_limit numeric)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  today date := (now() at time zone 'UTC')::date;
  current_ numeric;
begin
  if p_amount is null or p_amount <= 0 then
    return false;
  end if;
  insert into private.tutor_budget (day) values (today) on conflict do nothing;
  select committed into current_ from private.tutor_budget where day = today for update;
  if current_ + p_amount > p_limit then
    return false;
  end if;
  update private.tutor_budget set committed = committed + p_amount where day = today;
  return true;
end;
$$;

-- Remplace la réservation par le coût réel (jamais négatif).
create or replace function public.tutor_settle(p_day date, p_reserved numeric, p_actual numeric)
returns void
language sql
security definer
set search_path = ''
as $$
  update private.tutor_budget
  set committed = greatest(0, committed - p_reserved + greatest(0, p_actual))
  where day = p_day;
$$;

revoke execute on function public.tutor_hit(text, integer), public.tutor_ai_used(text),
  public.tutor_take_ai(text, integer), public.tutor_reserve(numeric, numeric),
  public.tutor_settle(date, numeric, numeric) from public, anon, authenticated;
grant execute on function public.tutor_hit(text, integer), public.tutor_ai_used(text),
  public.tutor_take_ai(text, integer), public.tutor_reserve(numeric, numeric),
  public.tutor_settle(date, numeric, numeric) to service_role;
