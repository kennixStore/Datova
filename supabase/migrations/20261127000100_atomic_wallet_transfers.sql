-- DATOVA internal wallet-to-wallet transfer
-- Apply only after reviewing the database schema and testing with non-production accounts.
-- Transfers are atomic: both wallet balances and both ledger entries commit together.

create or replace function public.transfer_datova_wallet(
  p_recipient_account_number text,
  p_amount numeric,
  p_pin text,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, auth, pg_temp
as $$
declare
  v_sender_id uuid := auth.uid();
  v_recipient_id uuid;
  v_recipient_name text;
  v_sender_wallet public.wallets%rowtype;
  v_recipient_wallet public.wallets%rowtype;
  v_account text;
  v_base_ref text;
  v_debit_ref text;
  v_credit_ref text;
  v_existing_count integer;
  v_existing_debit public.wallet_transactions%rowtype;
  v_existing_credit public.wallet_transactions%rowtype;
begin
  if v_sender_id is null then
    raise exception 'Authentication required';
  end if;

  if p_request_id is null then
    raise exception 'A transfer request reference is required';
  end if;

  if p_amount is null
     or p_amount::text in ('NaN', 'Infinity', '-Infinity')
     or p_amount < 100
     or p_amount <> round(p_amount, 2) then
    raise exception 'Enter an amount of at least ₦100 with no more than two decimal places';
  end if;

  v_account := upper(regexp_replace(coalesce(p_recipient_account_number, ''), '[[:space:]-]', '', 'g'));
  if v_account !~ '^DTV[0-9]{8}$' then
    raise exception 'Enter a valid DATOVA account number';
  end if;

  select count(*)
    into v_existing_count
  from public.profiles p
  where upper(regexp_replace(coalesce(p.account_number, ''), '[[:space:]-]', '', 'g')) = v_account;

  if v_existing_count = 0 then
    raise exception 'No DATOVA account was found with that account number';
  elsif v_existing_count > 1 then
    raise exception 'This recipient account number needs support review';
  end if;

  select p.id, nullif(btrim(p.full_name), '')
    into v_recipient_id, v_recipient_name
  from public.profiles p
  where upper(regexp_replace(coalesce(p.account_number, ''), '[[:space:]-]', '', 'g')) = v_account
  limit 1;

  if v_recipient_id = v_sender_id then
    raise exception 'You cannot send money to your own DATOVA account';
  end if;

  v_base_ref := 'DTVTR-' || replace(p_request_id::text, '-', '');
  v_debit_ref := v_base_ref || '-D';
  v_credit_ref := v_base_ref || '-C';

  -- Serialise retries using the caller-supplied idempotency key.
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));

  select *
    into v_existing_debit
  from public.wallet_transactions
  where reference = v_debit_ref;

  select *
    into v_existing_credit
  from public.wallet_transactions
  where reference = v_credit_ref;

  if found or v_existing_debit.id is not null then
    if v_existing_debit.id is null or v_existing_credit.id is null
       or v_existing_debit.user_id <> v_sender_id
       or v_existing_credit.user_id <> v_recipient_id
       or v_existing_debit.transaction_type <> 'debit'
       or v_existing_credit.transaction_type <> 'credit'
       or v_existing_debit.amount <> p_amount
       or v_existing_credit.amount <> p_amount then
      raise exception 'This transfer reference has already been used';
    end if;

    select * into v_sender_wallet
    from public.wallets
    where user_id = v_sender_id;

    return jsonb_build_object(
      'success', true,
      'already_processed', true,
      'reference', v_base_ref,
      'amount', p_amount,
      'currency', v_sender_wallet.currency,
      'recipient_name', v_recipient_name,
      'sender_balance', v_sender_wallet.balance
    );
  end if;

  -- The PIN check runs on the server and uses the existing bcrypt/lockout function.
  if not public.verify_datova_transaction_pin(p_pin) then
    raise exception 'Transaction PIN is incorrect, missing, or temporarily locked';
  end if;

  -- Lock both wallets in a stable order to prevent concurrent overspending/deadlocks.
  perform 1
  from public.wallets w
  where w.user_id in (v_sender_id, v_recipient_id)
  order by w.user_id
  for update;

  select * into v_sender_wallet
  from public.wallets
  where user_id = v_sender_id;

  if not found then
    raise exception 'Your DATOVA wallet could not be found';
  end if;

  select * into v_recipient_wallet
  from public.wallets
  where user_id = v_recipient_id;

  if not found then
    raise exception 'The recipient does not have an active DATOVA wallet';
  end if;

  if upper(coalesce(v_sender_wallet.currency, '')) <> 'NGN'
     or upper(coalesce(v_recipient_wallet.currency, '')) <> 'NGN'
     or v_sender_wallet.currency <> v_recipient_wallet.currency then
    raise exception 'Both wallets must use the same supported currency';
  end if;

  if v_sender_wallet.balance < p_amount then
    raise exception 'Insufficient wallet balance';
  end if;

  update public.wallets
  set balance = balance - p_amount,
      updated_at = now()
  where id = v_sender_wallet.id
  returning * into v_sender_wallet;

  update public.wallets
  set balance = balance + p_amount,
      updated_at = now()
  where id = v_recipient_wallet.id
  returning * into v_recipient_wallet;

  -- Existing ledger constraint allows only credit/debit/refund/adjustment.
  insert into public.wallet_transactions
    (wallet_id, user_id, transaction_type, amount, balance_before, balance_after, reference, description)
  values
    (v_sender_wallet.id, v_sender_id, 'debit', p_amount,
     v_sender_wallet.balance + p_amount, v_sender_wallet.balance,
     v_debit_ref, 'DATOVA transfer to ' || coalesce(v_recipient_name, 'DATOVA user')),
    (v_recipient_wallet.id, v_recipient_id, 'credit', p_amount,
     v_recipient_wallet.balance - p_amount, v_recipient_wallet.balance,
     v_credit_ref, 'DATOVA transfer from another user');

  return jsonb_build_object(
    'success', true,
    'already_processed', false,
    'reference', v_base_ref,
    'amount', p_amount,
    'currency', v_sender_wallet.currency,
    'recipient_name', v_recipient_name,
    'sender_balance', v_sender_wallet.balance
  );
end;
$$;

revoke all on function public.transfer_datova_wallet(text, numeric, text, uuid) from public, anon;
grant execute on function public.transfer_datova_wallet(text, numeric, text, uuid) to authenticated;

comment on function public.transfer_datova_wallet(text, numeric, text, uuid) is
  'Atomic DATOVA wallet-to-wallet transfer with server-side PIN verification and idempotent request references.';
