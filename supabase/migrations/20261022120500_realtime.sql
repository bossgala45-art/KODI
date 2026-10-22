-- KODI — synchronisation en temps réel entre les sessions d'un même compte.
-- Realtime applique les politiques RLS : chacun ne reçoit que ses lignes.
-- La publication « supabase_realtime » existe dans tout projet Supabase.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.profiles, public.preferences, public.exams;
  end if;
end;
$$;
