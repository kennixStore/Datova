-- DATOVA transaction PIN setup and recovery
-- First-time setup is distinguished from an existing PIN. Recovery requires
-- a recent authenticated session, obtained in the UI through an email OTP.

create or replace function public.has_datova_transaction_pin()
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.wallet_security
    where user_id = auth.uid()
  );
$$;

create or replace function public.reset_datova_transaction_pin(p_new_pin text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_auth_time bigint;
  v_email_confirmed timestamptz;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_new_pin is null or p_new_pin !~ '^[0-9]{4}$' then
    raise exception 'PIN must contain exactly four digits';
  end if;

  v_auth_time := nullif(auth.jwt()->>'auth_time', '')::bigint;
  if v_auth_time is null or to_timestamp(v_auth_time) < now() - interval '10 minutes' then
    raise exception 'For your security, verify your email again before resetting your transaction PIN';
  end if;

  select email_confirmed_at into v_email_confirmed
  from auth.users
  where id = v_user_id;

  if v_email_confirmed is null then
    raise exception 'Verify your DATOVA email address before resetting your transaction PIN';
  end if;

  insert into public.wallet_security (
    user_id, transaction_pin_hash, failed_pin_attempts,
    pin_locked_until, pin_created_at, updated_at
  )
  values (
    v_user_id, crypt(p_new_pin, gen_salt('bf', 12)), 0,
    null, now(), now()
  )
  on conflict (user_id) do update
  set transaction_pin_hash = excluded.transaction_pin_hash,
      failed_pin_attempts = 0,
      pin_locked_until = null,
      pin_created_at = now(),
      updated_at = now();

  return true;
end;
$$;

revoke all on function public.has_datova_transaction_pin() from public, anon;
revoke all on function public.reset_datova_transaction_pin(text) from public, anon;
grant execute on function public.has_datova_transaction_pin() to authenticated;
grant execute on function public.reset_datova_transaction_pin(text) to authenticated;

comment on function public.reset_datova_transaction_pin(text) is
  'Resets a transaction PIN only for a confirmed-email account with authentication within the last 10 minutes.';
