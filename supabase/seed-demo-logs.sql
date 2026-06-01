-- ============================================================
-- Pepwell · Demo data seed for /track
--
-- Generates ~21 days of realistic, gently-improving daily logs so the
-- track history (averages + day-by-day list) has something to show.
--
-- HOW TO USE:
--   1. Edit the email on the line below to YOUR signed-in account.
--   2. Paste this whole file into the Supabase SQL Editor and run it.
--   3. Reload /track.
--
-- Safe to re-run: it upserts on (user_id, log_date), so running again
-- just refreshes the same 21 days. Adjust the `21` in generate_series
-- to seed more or fewer days.
-- ============================================================

do $$
declare
  v_user_id uuid;
  v_email   text := 'you@example.com';  -- ← CHANGE THIS
begin
  select id into v_user_id
  from public.profiles
  where email = v_email
  limit 1;

  if v_user_id is null then
    raise exception 'No profile found for %. Sign up / log in first, then set the right email.', v_email;
  end if;

  insert into public.daily_logs (
    user_id, log_date, protocols_taken,
    sleep_score, energy_score, focus_score, mood_score,
    side_effects, notes,
    hrv_ms, resting_hr, rem_minutes, deep_minutes
  )
  select
    v_user_id,
    current_date - g.i,
    -- Most days both compounds; skip one occasionally for realism.
    case when g.i % 6 = 2
      then array['epitalon']::text[]
      else array['epitalon','pinealon']::text[]
    end,
    -- Scores trend upward toward today (trend = 1 today, ~0 three weeks ago)
    -- with a little sinusoidal noise so the line isn't a perfect ramp.
    greatest(1, least(10, round(5.0 + 3.0 * trend + sin(g.i * 0.9))))::int,
    greatest(1, least(10, round(4.5 + 3.2 * trend + sin(g.i * 0.7 + 1))))::int,
    greatest(1, least(10, round(4.0 + 3.5 * trend + sin(g.i * 1.1 + 2))))::int,
    greatest(1, least(10, round(5.0 + 2.8 * trend + sin(g.i * 0.5 + 0.5))))::int,
    null,
    case
      when g.i = 0  then 'Slept through the night, woke before the alarm.'
      when g.i = 4  then 'Long training day — legs heavy but mood good.'
      when g.i = 9  then 'Travel day, off schedule. Still logged it.'
      when g.i = 14 then 'First week where focus felt noticeably sharper.'
      else null
    end,
    -- Wearable metrics: HRV / REM / deep rise with the trend, resting HR falls.
    greatest(0,   least(300, round(40 + 18 * trend + 6 * sin(g.i * 0.8))))::int,
    greatest(20,  least(200, round(62 - 6  * trend + 3 * sin(g.i * 0.6))))::int,
    greatest(0,   least(600, round(80 + 30 * trend + 12 * sin(g.i))))::int,
    greatest(0,   least(600, round(60 + 25 * trend + 10 * sin(g.i * 1.2))))::int
  from generate_series(0, 21) as g(i)
  cross join lateral (
    select (21 - g.i)::numeric / 21 as trend
  ) t
  on conflict (user_id, log_date) do update set
    protocols_taken = excluded.protocols_taken,
    sleep_score     = excluded.sleep_score,
    energy_score    = excluded.energy_score,
    focus_score     = excluded.focus_score,
    mood_score      = excluded.mood_score,
    side_effects    = excluded.side_effects,
    notes           = excluded.notes,
    hrv_ms          = excluded.hrv_ms,
    resting_hr      = excluded.resting_hr,
    rem_minutes     = excluded.rem_minutes,
    deep_minutes    = excluded.deep_minutes;

  raise notice 'Seeded 22 days of demo logs for %.', v_email;
end $$;
