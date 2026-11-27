-- DATOVA transaction PIN foundation
-- Private bcrypt-hashed PIN storage. This does NOT enable transfers or withdrawals.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.wallet_security (
  user_id uuid primary key references auth.users(id) on delete cascade,
  transaction_pin_hash text not null,
  failed_pin_attempts integer not null default 0 check (failed_pin_attempts between 0 and 5),
  pin_locked_until timestamptz,
  pin_created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wallet_security enable row level security;

create or replace function public.set_datova_transaction_pin(
  p_new_pin text,
  p_current_pin text default null
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_security public.wallet_security%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_new_pin is null or p_new_pin !~ '^[0-9]{4}$' then
    raise exception 'PIN must contain exactly four digits';
  end if;

  select * into v_security
  from public.wallet_security
  where user_id = v_user_id
  for update;

  if found then
    if v_security.pin_locked_until is not null and v_security.pin_locked_until > now() then
      return false;
    end if;

    if p_current_pin is null or p_current_pin !~ '^[0-9]{4}$'
       or crypt(p_current_pin, v_security.transaction_pin_hash) <> v_security.transaction_pin_hash then
      update public.wallet_security
      set failed_pin_attempts = least(failed_pin_attempts + 1, 5),
          pin_locked_until = case
            when failed_pin_attempts + 1 >= 5 then now() + interval '15 minutes'
            else pin_locked_until
          end,
          updated_at = now()
      where user_id = v_user_id;
      return false;
    end if;

    update public.wallet_security
    set transaction_pin_hash = crypt(p_new_pin, gen_salt('bf', 12)),
        failed_pin_attempts = 0,
        pin_locked_until = null,
        pin_created_at = now(),
        updated_at = now()
    where user_id = v_user_id;
  else
    insert into public.wallet_security(user_id, transaction_pin_hash)
    values (v_user_id, crypt(p_new_pin, gen_salt('bf', 12)));
  end if;

  return true;
end;
$$;

create or replace function public.verify_datova_transaction_pin(p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_security public.wallet_security%rowtype;
  v_next_attempt integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_pin is null or p_pin !~ '^[0-9]{4}$' then
    return false;
  end if;

  select * into v_security
  from public.wallet_security
  where user_id = v_user_id
  for update;

  if not found then
    return false;
  end if;

  if v_security.pin_locked_until is not null and v_security.pin_locked_until > now() then
    return false;
  end if;

  if crypt(p_pin, v_security.transaction_pin_hash) = v_security.transaction_pin_hash then
    update public.wallet_security
    set failed_pin_attempts = 0,
        pin_locked_until = null,
        updated_at = now()
    where user_id = v_user_id;
    return true;
  end if;

  v_next_attempt := v_security.failed_pin_attempts + 1;
  update public.wallet_security
  set failed_pin_attempts = least(v_next_attempt, 5),
      pin_locked_until = case
        when v_next_attempt >= 5 then now() + interval '15 minutes'
        else pin_locked_until
      end,
      updated_at = now()
  where user_id = v_user_id;

  return false;
end;
$$;

-- No direct table access for browser clients. Access is through the RPCs.
revoke all on table public.wallet_security from anon, authenticated;
revoke all on function public.set_datova_transaction_pin(text, text) from public, anon;
revoke all on function public.verify_datova_transaction_pin(text) from public, anon;
grant execute on function public.set_datova_transaction_pin(text, text) to authenticated;
grant execute on function public.verify_datova_transaction_pin(text) to authenticated;

comment on table public.wallet_security is
  'Private DATOVA wallet security data. No direct client table access; use restricted RPCs.';
