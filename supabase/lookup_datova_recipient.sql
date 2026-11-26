-- DATOVA: secure recipient lookup for authenticated wallet users
-- Run this once in the Supabase SQL Editor.

create or replace function public.lookup_datova_recipient(p_account_number text)
returns text
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_account text;
  v_name text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  v_account := upper(regexp_replace(coalesce(p_account_number, ''), '[[:space:]-]', '', 'g'));

  if v_account !~ '^DTV[0-9]{8}$' then
    raise exception 'Invalid DATOVA account number';
  end if;

  select nullif(btrim(p.full_name), '')
    into v_name
  from public.profiles p
  where upper(regexp_replace(coalesce(p.account_number, ''), '[[:space:]-]', '', 'g')) = v_account
    and p.id <> auth.uid()
  limit 1;

  return v_name;
end;
$$;

revoke all on function public.lookup_datova_recipient(text) from public;
revoke all on function public.lookup_datova_recipient(text) from anon;
grant execute on function public.lookup_datova_recipient(text) to authenticated;
