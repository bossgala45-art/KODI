-- Édition personnelle gratuite (D-032) : aucun paiement, tout est accessible.
--
-- - Toute personne connectée a les droits de l'ancienne offre Premium :
--   examens blancs illimités, leçons « premium » lisibles.
-- - Les leçons publiées sont lisibles par tous, connectés ou non.
-- - Les fonctions réservées au webhook Stripe sont supprimées (plus aucun
--   service de paiement n'est branché).
-- Les tables (subscriptions, private.billing_events) restent pour ne pas
-- effacer de données ; elles ne servent plus.

create or replace function private.has_premium(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_user is not null;
$$;
revoke execute on function private.has_premium(uuid) from public, anon, authenticated;

create or replace function private.current_user_has_premium()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select true;
$$;
revoke execute on function private.current_user_has_premium() from public;
grant execute on function private.current_user_has_premium() to anon, authenticated;

drop function if exists public.billing_apply_subscription(
  text, text, uuid, text, text, text, text, timestamptz, boolean, timestamptz, boolean
);
drop function if exists public.billing_customer_of(uuid);
