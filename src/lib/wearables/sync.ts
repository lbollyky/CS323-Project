import type { WearableMetrics } from "@/types/wearable";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Plausible demo metrics when OAuth is not configured. */
export function demoWearableMetrics(
  provider: "oura" | "whoop" | "apple_health",
  seed: string,
): WearableMetrics {
  const hash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const jitter = (base: number, range: number) =>
    Math.round(base + (hash % range) - range / 2);

  switch (provider) {
    case "oura":
      return {
        hrv_ms: jitter(42, 16),
        resting_hr: jitter(58, 10),
        rem_minutes: jitter(95, 30),
        deep_minutes: jitter(72, 25),
      };
    case "whoop":
      return {
        hrv_ms: jitter(38, 14),
        resting_hr: jitter(62, 12),
        rem_minutes: jitter(88, 28),
        deep_minutes: jitter(65, 22),
      };
    case "apple_health":
      return {
        hrv_ms: jitter(35, 12),
        resting_hr: jitter(60, 8),
        rem_minutes: jitter(82, 24),
        deep_minutes: jitter(58, 20),
      };
  }
}

export async function fetchOuraMetrics(
  accessToken: string,
  date: string = todayISO(),
): Promise<WearableMetrics | null> {
  if (accessToken === "demo") {
    return demoWearableMetrics("oura", date);
  }

  const headers = { Authorization: `Bearer ${accessToken}` };

  const [readinessRes, sleepRes] = await Promise.all([
    fetch(
      `https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${date}&end_date=${date}`,
      { headers },
    ),
    fetch(
      `https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${date}&end_date=${date}`,
      { headers },
    ),
  ]);

  if (!readinessRes.ok && !sleepRes.ok) return null;

  const readiness = readinessRes.ok
    ? ((await readinessRes.json()) as {
        data?: Array<{ resting_heart_rate?: number; hrv_balance?: number }>;
      })
    : { data: [] };
  const sleep = sleepRes.ok
    ? ((await sleepRes.json()) as {
        data?: Array<{
          rem_sleep_duration?: number;
          deep_sleep_duration?: number;
        }>;
      })
    : { data: [] };

  const r = readiness.data?.[0];
  const s = sleep.data?.[0];

  return {
    hrv_ms: r?.hrv_balance ? Math.round(r.hrv_balance) : null,
    resting_hr: r?.resting_heart_rate
      ? Math.round(r.resting_heart_rate)
      : null,
    rem_minutes: s?.rem_sleep_duration
      ? Math.round(s.rem_sleep_duration / 60)
      : null,
    deep_minutes: s?.deep_sleep_duration
      ? Math.round(s.deep_sleep_duration / 60)
      : null,
  };
}

export async function fetchWhoopMetrics(
  accessToken: string,
  date: string = todayISO(),
): Promise<WearableMetrics | null> {
  if (accessToken === "demo") {
    return demoWearableMetrics("whoop", date);
  }

  const headers = { Authorization: `Bearer ${accessToken}` };

  const recoveryRes = await fetch(
    `https://api.prod.whoop.com/developer/v1/recovery?start=${date}T00:00:00.000Z&end=${date}T23:59:59.999Z`,
    { headers },
  );
  const sleepRes = await fetch(
    `https://api.prod.whoop.com/developer/v1/activity/sleep?start=${date}T00:00:00.000Z&end=${date}T23:59:59.999Z`,
    { headers },
  );

  if (!recoveryRes.ok && !sleepRes.ok) return null;

  const recovery = recoveryRes.ok
    ? ((await recoveryRes.json()) as {
        records?: Array<{
          score?: { resting_heart_rate?: number; hrv_rmssd_milli?: number };
        }>;
      })
    : { records: [] };
  const sleep = sleepRes.ok
    ? ((await sleepRes.json()) as {
        records?: Array<{
          score?: {
            stage_summary?: {
              total_rem_sleep_time_milli?: number;
              total_slow_wave_sleep_time_milli?: number;
            };
          };
        }>;
      })
    : { records: [] };

  const rec = recovery.records?.[0]?.score;
  const st = sleep.records?.[0]?.score?.stage_summary;

  return {
    hrv_ms: rec?.hrv_rmssd_milli ? Math.round(rec.hrv_rmssd_milli) : null,
    resting_hr: rec?.resting_heart_rate
      ? Math.round(rec.resting_heart_rate)
      : null,
    rem_minutes: st?.total_rem_sleep_time_milli
      ? Math.round(st.total_rem_sleep_time_milli / 60000)
      : null,
    deep_minutes: st?.total_slow_wave_sleep_time_milli
      ? Math.round(st.total_slow_wave_sleep_time_milli / 60000)
      : null,
  };
}

export async function fetchAppleHealthMetrics(
  _accessToken: string,
  date: string = todayISO(),
): Promise<WearableMetrics> {
  // Apple Health has no web OAuth API — linked accounts use demo metrics
  // until a native iOS companion app syncs via HealthKit.
  return demoWearableMetrics("apple_health", date);
}

export function mergeMetrics(
  sources: WearableMetrics[],
): WearableMetrics {
  const pick = (
    key: keyof WearableMetrics,
  ): number | null => {
    for (const s of sources) {
      const v = s[key];
      if (v != null) return v;
    }
    return null;
  };
  return {
    hrv_ms: pick("hrv_ms"),
    resting_hr: pick("resting_hr"),
    rem_minutes: pick("rem_minutes"),
    deep_minutes: pick("deep_minutes"),
  };
}
