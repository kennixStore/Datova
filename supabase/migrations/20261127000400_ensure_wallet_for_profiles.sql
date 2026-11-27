-- DATOVA: ensure every registered profile has a wallet row.
-- Existing profiles are backfilled with a zero-balance NGN wallet.
-- New profiles automatically receive the same wallet after profile creation.
-- This does not credit funds or change any existing wallet balance.

create or replace function public.ensure_datova_wallet_for_profile()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.wallets (user_id, balance, currency)
  values (new.id, 0, 'NGN')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists ensure_datova_wallet_after_profile_insert on public.profiles;

create trigger ensure_datova_wallet_after_profile_insert
after insert on public.profiles
for each row
execute function public.ensure_datova_wallet_for_profile();

-- Backfill existing profile records that do not yet have a wallet.
insert into public.wallets (user_id, balance, currency)
select p.id, 0, 'NGN'
from public.profiles p
where not exists (
  select 1
  from public.wallets w
  where w.user_id = p.id
)
on conflict (user_id) do nothing;

comment on function public.ensure_datova_wallet_for_profile() is
  'Creates a zero-balance NGN wallet for each newly created DATOVA profile.';
