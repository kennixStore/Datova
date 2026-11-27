-- DATOVA recipient lookup fix.
-- Supports profiles with a blank full_name by falling back to the registered
-- Supabase Auth user metadata. Account numbers are normalized before matching.

create or replace function public.lookup_datova_recipient(p_account_number text)
returns text
language plpgsql
security definer
stable
set search_path = public, auth, pg_temp
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

  select coalesce(
    nullif(btrim(p.full_name), ''),
    nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(u.raw_user_meta_data ->> 'name'), ''),
    nullif(btrim(concat_ws(' ',
      u.raw_user_meta_data ->> 'first_name',
      u.raw_user_meta_data ->> 'last_name'
    )), ''),
    'DATOVA User'
  )
    into v_name
  from public.profiles p
  left join auth.users u on u.id = p.id
  where upper(regexp_replace(coalesce(p.account_number, ''), '[[:space:]-]', '', 'g')) = v_account
    and p.id <> auth.uid()
  limit 1;

  return v_name;
end;
$$;

revoke all on function public.lookup_datova_recipient(text) from public;
revoke all on function public.lookup_datova_recipient(text) from anon;
grant execute on function public.lookup_datova_recipient(text) to authenticated;

comment on function public.lookup_datova_recipient(text) is
  'Returns a DATOVA recipient display name using profile name with registered Auth metadata fallback.';
