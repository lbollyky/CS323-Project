import type { DailyLog } from "@/types/track";
import { TrackTrendChart } from "@/components/track-trend-chart";

interface Protocol {
  id: string;
  name: string;
}

const SCORE_FIELDS: Array<{
  field: keyof Pick<
    DailyLog,
    "sleep_score" | "energy_score" | "focus_score" | "mood_score"
  >;
  label: string;
  color: string;
  tint: string;
}> = [
  { field: "sleep_score", label: "Sleep", color: "oklch(0.55 0.18 280)", tint: "oklch(0.55 0.18 280 / 0.09)" },
  { field: "energy_score", label: "Energy", color: "oklch(0.62 0.17 40)", tint: "oklch(0.62 0.17 40 / 0.10)" },
  { field: "focus_score", label: "Focus", color: "oklch(0.55 0.15 215)", tint: "oklch(0.55 0.15 215 / 0.10)" },
  { field: "mood_score", label: "Mood", color: "oklch(0.52 0.13 158)", tint: "oklch(0.52 0.13 158 / 0.10)" },
];

function avg(values: Array<number | null | undefined>): number | null {
  const nums = values.filter(
    (v): v is number => typeof v === "number" && Number.isFinite(v),
  );
  if (nums.length === 0) return null;
  return nums.reduce((s, v) => s + v, 0) / nums.length;
}

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function TrackHistory({
  logs,
  todayLog,
  protocols,
}: {
  logs: DailyLog[];
  todayLog?: DailyLog | null;
  protocols: Protocol[];
}) {
  // The trend, averages, and counts should reflect everything through
  // today; the day-by-day list stays "past days" since today lives in the
  // check-in form on the left. `logs` arrives newest-first, so today (if
  // present) prepends to keep that order.
  const stats =
    todayLog && !logs.some((l) => l.log_date === todayLog.log_date)
      ? [todayLog, ...logs]
      : logs;

  if (stats.length === 0) {
    return (
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          History
        </p>
        <h2 className="mt-2 text-[28px] font-medium tracking-tight sm:text-[32px]">
          Last 14 days
        </h2>
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-background p-8 text-center">
          <p className="text-[13.5px] text-muted-foreground">
            Your last fourteen days will show here. Log a few in a row to
            see trend lines.
          </p>
        </div>
      </div>
    );
  }

  const averages = SCORE_FIELDS.map((s) => ({
    label: s.label,
    color: s.color,
    tint: s.tint,
    avg: avg(stats.map((l) => l[s.field])),
  }));

  const protocolCounts = protocols.map((p) => ({
    name: p.name,
    days: stats.filter((l) => l.protocols_taken?.includes(p.id)).length,
  }));

  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Last 14 days
      </p>
      <h2 className="mt-2 text-[28px] font-medium tracking-tight sm:text-[32px]">
        Trend at a glance
      </h2>
      <p className="mt-2 text-[13.5px] text-muted-foreground">
        {stats.length} {stats.length === 1 ? "entry" : "entries"} logged in the
        last two weeks.
      </p>

      {/* Trend chart */}
      <div className="mt-5">
        <TrackTrendChart logs={stats} />
      </div>

      {/* Averages strip */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {averages.map((a) => (
          <div
            key={a.label}
            className="relative overflow-hidden rounded-xl border border-border/70 p-4"
            style={{ background: a.tint }}
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1"
              style={{ background: a.color }}
            />
            <p className="flex items-center gap-1.5 text-[11.5px] uppercase tracking-wider text-muted-foreground">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: a.color }}
              />
              {a.label} avg
            </p>
            <p className="mt-1 text-[22px] font-medium tabular-nums">
              <span style={{ color: a.color }}>
                {a.avg != null ? a.avg.toFixed(1) : "—"}
              </span>
              <span className="ml-0.5 text-[12px] text-muted-foreground/60">
                /10
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Protocol consistency strip */}
      <div className="mt-5 flex flex-wrap gap-2">
        {protocolCounts.map((p) => (
          <div
            key={p.name}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[12.5px]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-foreground">{p.name}</span>
            <span className="tabular-nums text-muted-foreground">
              {p.days}/{stats.length}d
            </span>
          </div>
        ))}
      </div>

      {/* Day-by-day list (collapsed by default, click to expand). Shows
          past days only — today lives in the check-in form. */}
      {logs.length > 0 && (
      <details className="group mt-7 rounded-2xl border border-border bg-background">
        <summary className="focus-ring flex cursor-pointer select-none list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 [&::-webkit-details-marker]:hidden">
          <span className="text-[13.5px] font-medium">Day-by-day log</span>
          <span className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
            {logs.length} {logs.length === 1 ? "day" : "days"}
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="h-4 w-4 transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </summary>
        <ul className="divide-y divide-border/60 border-t border-border">
        {logs.map((log) => (
          <li key={log.id} className="px-5 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <div className="text-[13.5px] font-medium">
                {fmtDate(log.log_date)}
              </div>
              <div className="flex items-baseline gap-3 text-[12px] tabular-nums text-muted-foreground">
                {SCORE_FIELDS.map((s) => (
                  <span key={s.field}>
                    <span className="mr-0.5 text-muted-foreground/70">
                      {s.label[0]}
                    </span>
                    {log[s.field] ?? "—"}
                  </span>
                ))}
              </div>
            </div>

            {(log.protocols_taken?.length ?? 0) > 0 && (
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                {log.protocols_taken
                  .map(
                    (id) =>
                      protocols.find((p) => p.id === id)?.name ?? id,
                  )
                  .join(" · ")}
              </p>
            )}

            {(log.hrv_ms ||
              log.resting_hr ||
              log.rem_minutes ||
              log.deep_minutes) && (
              <p className="mt-1 text-[11.5px] tabular-nums text-muted-foreground/70">
                {[
                  log.hrv_ms != null ? `HRV ${log.hrv_ms}ms` : null,
                  log.resting_hr != null
                    ? `RHR ${log.resting_hr}bpm`
                    : null,
                  log.rem_minutes != null
                    ? `REM ${log.rem_minutes}m`
                    : null,
                  log.deep_minutes != null
                    ? `Deep ${log.deep_minutes}m`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}

            {log.notes && (
              <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/80">
                {log.notes}
              </p>
            )}
          </li>
        ))}
        </ul>
      </details>
      )}
    </div>
  );
}
