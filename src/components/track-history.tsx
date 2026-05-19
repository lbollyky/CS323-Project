import type { DailyLog } from "@/types/track";

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
}> = [
  { field: "sleep_score", label: "Sleep" },
  { field: "energy_score", label: "Energy" },
  { field: "focus_score", label: "Focus" },
  { field: "mood_score", label: "Mood" },
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
  protocols,
}: {
  logs: DailyLog[];
  protocols: Protocol[];
}) {
  if (logs.length === 0) {
    return (
      <div className="mt-12 rounded-2xl border border-dashed border-border bg-background p-8 text-center">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
          History
        </p>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          Your last fourteen days will show here. Log a few in a row to
          see trend lines.
        </p>
      </div>
    );
  }

  const averages = SCORE_FIELDS.map((s) => ({
    label: s.label,
    avg: avg(logs.map((l) => l[s.field])),
  }));

  const protocolCounts = protocols.map((p) => ({
    name: p.name,
    days: logs.filter((l) => l.protocols_taken?.includes(p.id)).length,
  }));

  return (
    <div className="mt-12">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        Last 14 days
      </p>
      <h2 className="mt-2 text-[20px] font-medium tracking-tight">
        {logs.length} {logs.length === 1 ? "entry" : "entries"} · trend at a
        glance
      </h2>

      {/* Averages strip */}
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {averages.map((a) => (
          <div
            key={a.label}
            className="rounded-xl border border-border bg-background p-4"
          >
            <p className="text-[11.5px] uppercase tracking-wider text-muted-foreground">
              {a.label} avg
            </p>
            <p className="mt-1 text-[22px] font-medium tabular-nums">
              {a.avg != null ? a.avg.toFixed(1) : "—"}
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
            className="inline-flex items-baseline gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[12.5px]"
          >
            <span className="text-foreground">{p.name}</span>
            <span className="tabular-nums text-muted-foreground">
              {p.days}/{logs.length}d
            </span>
          </div>
        ))}
      </div>

      {/* Day-by-day list */}
      <ul className="mt-7 divide-y divide-border/60 rounded-2xl border border-border bg-background">
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
    </div>
  );
}
