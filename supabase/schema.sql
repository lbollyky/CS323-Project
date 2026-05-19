-- ============================================================
-- Pepwell · Supabase schema
--
-- Paste the entire file into the Supabase SQL Editor (Project →
-- SQL Editor → "New query"). Run once. Idempotent — safe to re-run
-- if you tweak something.
--
-- What it sets up:
--   1. public.profiles      — one row per auth.users row
--   2. public.daily_logs    — wearable-grade daily check-in
--   3. RLS policies          — every user only sees their own data
--   4. Trigger               — auto-create a profile when a user
--                              signs up via Supabase Auth, so the
--                              app never has to do it manually
-- ============================================================

create extension if not exists "uuid-ossp";

-- ─── 1. profiles ────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles read own"   on public.profiles;
drop policy if exists "profiles update own" on public.profiles;

create policy "profiles read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles update own"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a Supabase Auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── 2. daily_logs ──────────────────────────────────────────
-- Wearable-grade daily check-in. One row per user per day; a second
-- save on the same day upserts the existing row.
create table if not exists public.daily_logs (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  log_date         date not null default current_date,

  -- which protocols did you take today?  Stored as the same string
  -- ids the app uses: 'epitalon', 'pinealon', 'restore-bpc'.
  protocols_taken  text[] not null default '{}',

  -- self-report (1-10).  Nullable so a user can skip dimensions.
  sleep_score      int check (sleep_score      between 1 and 10),
  energy_score     int check (energy_score     between 1 and 10),
  focus_score      int check (focus_score      between 1 and 10),
  mood_score       int check (mood_score       between 1 and 10),

  -- optional notes
  side_effects     text,
  notes            text,

  -- optional wearable metrics (Oura / Whoop / Apple Watch)
  hrv_ms           int check (hrv_ms           between 0 and 300),
  resting_hr       int check (resting_hr       between 20 and 200),
  rem_minutes      int check (rem_minutes      between 0 and 600),
  deep_minutes     int check (deep_minutes     between 0 and 600),

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (user_id, log_date)
);

create index if not exists idx_daily_logs_user_date
  on public.daily_logs (user_id, log_date desc);

alter table public.daily_logs enable row level security;

drop policy if exists "daily_logs select own" on public.daily_logs;
drop policy if exists "daily_logs insert own" on public.daily_logs;
drop policy if exists "daily_logs update own" on public.daily_logs;
drop policy if exists "daily_logs delete own" on public.daily_logs;

create policy "daily_logs select own"
  on public.daily_logs for select
  using (auth.uid() = user_id);

create policy "daily_logs insert own"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

create policy "daily_logs update own"
  on public.daily_logs for update
  using (auth.uid() = user_id);

create policy "daily_logs delete own"
  on public.daily_logs for delete
  using (auth.uid() = user_id);

-- Touch updated_at on any row change.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists daily_logs_touch on public.daily_logs;
create trigger daily_logs_touch
  before update on public.daily_logs
  for each row execute function public.touch_updated_at();
