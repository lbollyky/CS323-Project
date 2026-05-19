export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string; // ISO date (yyyy-mm-dd)
  protocols_taken: string[];

  sleep_score: number | null;
  energy_score: number | null;
  focus_score: number | null;
  mood_score: number | null;

  side_effects: string | null;
  notes: string | null;

  hrv_ms: number | null;
  resting_hr: number | null;
  rem_minutes: number | null;
  deep_minutes: number | null;

  created_at: string;
  updated_at: string;
}

export interface DailyLogInput {
  log_date: string;
  protocols_taken: string[];

  sleep_score: number | null;
  energy_score: number | null;
  focus_score: number | null;
  mood_score: number | null;

  side_effects: string | null;
  notes: string | null;

  hrv_ms: number | null;
  resting_hr: number | null;
  rem_minutes: number | null;
  deep_minutes: number | null;
}
