"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Pencil } from "lucide-react";
import { saveDailyLog } from "@/app/track/actions";
import type { DailyLog } from "@/types/track";
import { cn } from "@/lib/utils";

interface Protocol {
  id: string;
  name: string;
}

type ScoreField =
  | "sleep_score"
  | "energy_score"
  | "focus_score"
  | "mood_score";

const SCORE_DIMENSIONS: Array<{
  field: ScoreField;
  label: string;
  low: string;
  high: string;
  /** Per-metric hue, shared with the trend chart for a coherent palette. */
  color: string;
  tint: string;
}> = [
  { field: "sleep_score",  label: "Sleep",  low: "wrecked",   high: "restorative", color: "oklch(0.55 0.18 280)", tint: "oklch(0.55 0.18 280 / 0.09)" },
  { field: "energy_score", label: "Energy", low: "depleted",  high: "high",        color: "oklch(0.62 0.17 40)",  tint: "oklch(0.62 0.17 40 / 0.10)"  },
  { field: "focus_score",  label: "Focus",  low: "scattered", high: "sharp",       color: "oklch(0.55 0.15 215)", tint: "oklch(0.55 0.15 215 / 0.10)" },
  { field: "mood_score",   label: "Mood",   low: "low",       high: "even",        color: "oklch(0.52 0.13 158)", tint: "oklch(0.52 0.13 158 / 0.10)" },
];

interface LogSnapshot {
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

function snapshotFromLog(log: DailyLog | null): LogSnapshot | null {
  if (!log) return null;
  return {
    protocols_taken: log.protocols_taken ?? [],
    sleep_score: log.sleep_score ?? null,
    energy_score: log.energy_score ?? null,
    focus_score: log.focus_score ?? null,
    mood_score: log.mood_score ?? null,
    side_effects: log.side_effects ?? null,
    notes: log.notes ?? null,
    hrv_ms: log.hrv_ms ?? null,
    resting_hr: log.resting_hr ?? null,
    rem_minutes: log.rem_minutes ?? null,
    deep_minutes: log.deep_minutes ?? null,
  };
}

function num(value: FormDataEntryValue | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function str(value: FormDataEntryValue | null): string | null {
  const s = value == null ? "" : String(value).trim();
  return s.length ? s : null;
}

function snapshotFromFormData(formData: FormData): LogSnapshot {
  return {
    protocols_taken: formData.getAll("protocols_taken").map((v) => String(v)),
    sleep_score: num(formData.get("sleep_score")),
    energy_score: num(formData.get("energy_score")),
    focus_score: num(formData.get("focus_score")),
    mood_score: num(formData.get("mood_score")),
    side_effects: str(formData.get("side_effects")),
    notes: str(formData.get("notes")),
    hrv_ms: num(formData.get("hrv_ms")),
    resting_hr: num(formData.get("resting_hr")),
    rem_minutes: num(formData.get("rem_minutes")),
    deep_minutes: num(formData.get("deep_minutes")),
  };
}

export function TrackForm({
  today,
  existing,
  protocols,
  defaultProtocolIds = [],
}: {
  today: string;
  existing: DailyLog | null;
  protocols: Protocol[];
  defaultProtocolIds?: string[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // A day that's already been logged starts condensed; press "Update" to edit.
  const [collapsed, setCollapsed] = useState<boolean>(existing != null);
  const [snapshot, setSnapshot] = useState<LogSnapshot | null>(
    snapshotFromLog(existing),
  );
  const [justSaved, setJustSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await saveDailyLog(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSnapshot(snapshotFromFormData(formData));
      setJustSaved(true);
      setCollapsed(true);
    });
  }

  if (collapsed && snapshot) {
    return (
      <LoggedSummary
        snapshot={snapshot}
        date={today}
        protocols={protocols}
        justSaved={justSaved}
        onEdit={() => {
          setJustSaved(false);
          setCollapsed(false);
        }}
      />
    );
  }

  return (
    <form
      action={handleSubmit}
      className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-background to-surface/70 p-1 shadow-elevated"
    >
      {/* Thin colored accent so the card doesn't read as flat white. */}
      <div
        aria-hidden
        className="mx-1 h-1 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.55 0.18 280), oklch(0.62 0.17 40), oklch(0.55 0.15 215), oklch(0.52 0.13 158))",
        }}
      />
      <input type="hidden" name="log_date" value={today} />
      <div className="rounded-[14px] p-5 sm:p-7">
        {/* Protocols */}
        <Section title="What did you take today?">
          <div className="flex flex-wrap gap-2">
            {protocols.map((p) => {
              const checked = snapshot
                ? (snapshot.protocols_taken?.includes(p.id) ?? false)
                : defaultProtocolIds.includes(p.id);
              return (
                <ProtocolChip
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  defaultChecked={checked}
                />
              );
            })}
          </div>
        </Section>

        {/* Scores */}
        <Section title="How did the day feel?">
          <div className="grid gap-5 sm:grid-cols-2">
            {SCORE_DIMENSIONS.map((d) => (
              <ScoreInput
                key={d.field}
                name={d.field}
                label={d.label}
                low={d.low}
                high={d.high}
                color={d.color}
                defaultValue={snapshot?.[d.field] ?? null}
              />
            ))}
          </div>
        </Section>

        {/* Notes */}
        <Section title="Side effects & notes">
          <div className="grid gap-3">
            <textarea
              name="side_effects"
              rows={2}
              placeholder="Anything off — vivid dreams, headache, GI sensations…"
              defaultValue={snapshot?.side_effects ?? ""}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/50 focus:outline-none"
            />
            <textarea
              name="notes"
              rows={3}
              placeholder="What's worth remembering about today — training, stress, alcohol, travel, anything that might explain the data."
              defaultValue={snapshot?.notes ?? ""}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/50 focus:outline-none"
            />
          </div>
        </Section>

        {/* Wearable */}
        <Section
          title="Wearable metrics"
          subtitle={
            snapshot?.hrv_ms != null
              ? "Last synced from your connected device — edit if needed."
              : "Connect a device above to auto-fill, or enter manually."
          }
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <WearableInput
              name="hrv_ms"
              label="HRV"
              unit="ms"
              defaultValue={snapshot?.hrv_ms ?? null}
            />
            <WearableInput
              name="resting_hr"
              label="Resting HR"
              unit="bpm"
              defaultValue={snapshot?.resting_hr ?? null}
            />
            <WearableInput
              name="rem_minutes"
              label="REM"
              unit="min"
              defaultValue={snapshot?.rem_minutes ?? null}
            />
            <WearableInput
              name="deep_minutes"
              label="Deep"
              unit="min"
              defaultValue={snapshot?.deep_minutes ?? null}
            />
          </div>
        </Section>

        {error && (
          <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12.5px] text-destructive">
            {error}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-[11.5px] text-muted-foreground">
            One entry per day — re-saving updates the existing log.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-foreground px-5 text-[13.5px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : snapshot ? (
                "Update today's log"
              ) : (
                "Save today's log"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

/**
 * The condensed view shown once today's log is saved. Keeps the day's
 * answers visible at a glance and tucks the full form away behind an
 * explicit "Update today's log" action.
 */
function LoggedSummary({
  snapshot,
  date,
  protocols,
  justSaved,
  onEdit,
}: {
  snapshot: LogSnapshot;
  date: string;
  protocols: Protocol[];
  justSaved: boolean;
  onEdit: () => void;
}) {
  const takenNames = snapshot.protocols_taken
    .map((id) => protocols.find((p) => p.id === id)?.name ?? id)
    .filter(Boolean);

  const wearables = [
    snapshot.hrv_ms != null ? `HRV ${snapshot.hrv_ms}ms` : null,
    snapshot.resting_hr != null ? `RHR ${snapshot.resting_hr}bpm` : null,
    snapshot.rem_minutes != null ? `REM ${snapshot.rem_minutes}m` : null,
    snapshot.deep_minutes != null ? `Deep ${snapshot.deep_minutes}m` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-background to-surface/70 p-1 shadow-elevated">
      <div className="rounded-[14px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 ring-1 ring-emerald-500/25">
              <Check className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <div>
              <p className="text-[15px] font-medium tracking-tight">
                {justSaved ? "Today's log saved" : "Today, already logged"}
              </p>
              <p className="text-[12px] text-muted-foreground">{date}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="focus-ring inline-flex h-9 select-none items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 text-[13px] font-medium text-foreground transition-colors hover:border-foreground/40 hover:bg-surface"
          >
            <Pencil className="h-3.5 w-3.5" />
            Update today&rsquo;s log
          </button>
        </div>

        {/* Scores at a glance */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {SCORE_DIMENSIONS.map((d) => {
            const value = snapshot[d.field];
            return (
              <div
                key={d.field}
                className="rounded-xl border border-border/70 p-3"
                style={{ background: d.tint }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: d.color }}
                  />
                  <span className="text-[11.5px] font-medium text-foreground/80">
                    {d.label}
                  </span>
                </div>
                <p className="mt-1.5 text-[22px] font-medium leading-none tabular-nums">
                  <span style={{ color: d.color }}>{value ?? "—"}</span>
                  <span className="ml-0.5 text-[12px] text-muted-foreground/60">
                    /10
                  </span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Protocols + wearables recap */}
        {(takenNames.length > 0 || wearables.length > 0) && (
          <div className="mt-4 space-y-2.5 border-t border-border/60 pt-4">
            {takenNames.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Taken
                </span>
                {takenNames.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-0.5 text-[12px] text-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {name}
                  </span>
                ))}
              </div>
            )}
            {wearables.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Device
                </span>
                <span className="text-[12px] tabular-nums text-muted-foreground">
                  {wearables.join("  ·  ")}
                </span>
              </div>
            )}
          </div>
        )}

        {(snapshot.notes || snapshot.side_effects) && (
          <p className="mt-3 line-clamp-2 text-[12.5px] leading-relaxed text-foreground/70">
            {snapshot.side_effects && (
              <span className="text-muted-foreground">
                {snapshot.side_effects}
                {snapshot.notes ? " — " : ""}
              </span>
            )}
            {snapshot.notes}
          </p>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-0.5 text-[12px] text-muted-foreground/80">
          {subtitle}
        </p>
      )}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ProtocolChip({
  id,
  name,
  defaultChecked,
}: {
  id: string;
  name: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
        checked
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      <input
        type="checkbox"
        name="protocols_taken"
        value={id}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="sr-only"
      />
      {checked && <Check className="h-3 w-3" strokeWidth={2.6} />}
      {name}
    </label>
  );
}

function ScoreInput({
  name,
  label,
  low,
  high,
  color,
  defaultValue,
}: {
  name: string;
  label: string;
  low: string;
  high: string;
  color: string;
  defaultValue: number | null;
}) {
  const [value, setValue] = useState<number | null>(defaultValue);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: color }}
          />
          {label}
        </span>
        <span className="tabular-nums text-[13px]">
          <span style={{ color }} className="font-medium">
            {value ?? "—"}
          </span>
          <span className="text-muted-foreground/50"> / 10</span>
        </span>
      </div>
      <input
        type="range"
        name={name}
        min={1}
        max={10}
        step={1}
        value={value ?? 5}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-2 w-full"
        style={{ accentColor: color }}
      />
      <div className="mt-1 flex justify-between text-[10.5px] text-muted-foreground/70">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function WearableInput({
  name,
  label,
  unit,
  defaultValue,
}: {
  name: string;
  label: string;
  unit: string;
  defaultValue: number | null;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] uppercase tracking-wider text-muted-foreground">
        {label}{" "}
        <span className="opacity-60">({unit})</span>
      </span>
      <input
        type="number"
        name={name}
        inputMode="numeric"
        defaultValue={defaultValue ?? ""}
        placeholder="—"
        className="h-9 rounded-lg border border-border bg-background px-2.5 text-[13.5px] tabular-nums text-foreground placeholder:text-muted-foreground/50 focus:border-foreground/50 focus:outline-none"
      />
    </label>
  );
}
