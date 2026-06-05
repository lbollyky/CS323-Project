-- ============================================================
-- Pepwell · Seed an active protocol for /track
--
-- Sets the active protocol shown at the top of /track for one
-- account. Pairs nicely with seed-demo-logs.sql (which logs
-- epitalON + pinealON days).
--
-- HOW TO USE:
--   0. FIRST run schema.sql once (it creates the profiles / daily_logs /
--      wearable_connections tables). This seed assumes those exist.
--   1. Edit the email below to YOUR signed-in account.
--   2. Paste this whole file into the Supabase SQL Editor and run it.
--   3. Reload /track.
--
-- Safe to re-run: it just overwrites the protocol columns on the
-- profile. To clear the protocol, set active_protocol_ids = '{}'.
-- ============================================================

-- Make sure the protocol columns exist (in case the "Active protocol
-- on profile" block of schema.sql was never run). Idempotent.
alter table public.profiles
  add column if not exists active_protocol_ids text[] not null default '{}',
  add column if not exists protocol_goal text,
  add column if not exists protocol_duration_weeks int check (protocol_duration_weeks between 1 and 52),
  add column if not exists protocol_started_at date;

do $$
declare
  v_user_id uuid;
  v_email   text := 'lbollyky@gmail.com';  -- ← CHANGE THIS
begin
  -- Backfill a profile row from auth.users if this account signed up
  -- before the auto-create trigger existed (the trigger only fires for
  -- *new* signups).
  insert into public.profiles (id, email, name)
  select u.id, u.email,
         coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1))
  from auth.users u
  where u.email = v_email
  on conflict (id) do nothing;

  select id into v_user_id
  from public.profiles
  where email = v_email
  limit 1;

  if v_user_id is null then
    raise exception 'No auth user found for %. Sign up / log in first, then set the right email.', v_email;
  end if;

  update public.profiles
  set
    -- Single-product ids the app understands: 'epitalon', 'pinealon',
    -- 'restore-bpc'. This is the Dual-System Stack (sleep + cognitive).
    active_protocol_ids     = array['epitalon', 'pinealon']::text[],
    protocol_goal           = 'Deep sleep & daytime focus',
    protocol_duration_weeks = 8,
    protocol_started_at     = current_date - 18  -- ~Week 3 of 8
  where id = v_user_id;

  raise notice 'Set active protocol for %.', v_email;
end $$;
