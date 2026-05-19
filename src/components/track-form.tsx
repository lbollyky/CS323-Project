"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { saveDailyLog } from "@/app/track/actions";
import type { DailyLog } from "@/types/track";
import { cn } from "@/lib/utils";

interface Protocol {
  id: string;
  name: string;
}

const SCORE_DIMENSIONS: Array<{
  field: keyof Pick<
    DailyLog,
    "sleep_score" | "energy_score" | "focus_score" | "mood_score"
  >;
  label: string;
  low: string;
  high: string;
}> = [
  { field: "sleep_score",  label: "Sleep",  low: "wrecked",   high: "restorative" },
  { field: "energy_score", label: "Energy", low: "depleted",  high: "high"        },
  { field: "focus_score",  label: "Focus",  low: "scattered", high: "sharp"       },
  { field: "mood_score",   label: "Mood",   low: "low",       high: "even"        },
];

export function TrackForm({
  today,
  existing,
  protocols,
}: {
  today: string;
  existing: DailyLog | null;
  protocols: Protocol[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await saveDailyLog(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSavedAt(new Date());
    });
  }

  return (
    <form
      action={handleSubmit}
      className="mt-8 rounded-2xl border border-border bg-background p-1"
    >
      <input type="hidden" name="log_date" value={today} />
      <div className="rounded-[14px] bg-background p-5 sm:p-7">
        {/* Protocols */}
        <Section title="What did you take today?">
          <div className="flex flex-wrap gap-2">
            {protocols.map((p) => {
              const checked =
                existing?.protocols_taken?.includes(p.id) ?? false;
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
                defaultValue={existing?.[d.field] ?? null}
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
              defaultValue={existing?.side_effects ?? ""}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/50 focus:outline-none"
            />
            <textarea
              name="notes"
              rows={3}
              placeholder="What's worth remembering about today — training, stress, alcohol, travel, anything that might explain the data."
              defaultValue={existing?.notes ?? ""}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/50 focus:outline-none"
            />
          </div>
        </Section>

        {/* Wearable */}
        <Section
          title="Wearable metrics"
          subtitle="Optional — fill in if your Oura / Whoop / Apple Watch has them."
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <WearableInput
              name="hrv_ms"
              label="HRV"
              unit="ms"
              defaultValue={existing?.hrv_ms ?? null}
            />
            <WearableInput
              name="resting_hr"
              label="Resting HR"
              unit="bpm"
              defaultValue={existing?.resting_hr ?? null}
            />
            <WearableInput
              name="rem_minutes"
              label="REM"
              unit="min"
              defaultValue={existing?.rem_minutes ?? null}
            />
            <WearableInput
              name="deep_minutes"
              label="Deep"
              unit="min"
              defaultValue={existing?.deep_minutes ?? null}
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
            {savedAt && !pending && (
              <span className="inline-flex items-center gap-1 text-[12px] text-emerald-600">
                <Check className="h-3.5 w-3.5" />
                Saved
              </span>
            )}
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
              ) : existing ? (
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
          ? "border-foreground bg-foreground text-background"
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
  defaultValue,
}: {
  name: string;
  label: string;
  low: string;
  high: string;
  defaultValue: number | null;
}) {
  const [value, setValue] = useState<number | null>(defaultValue);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-[13px] text-muted-foreground">
          {value ?? "—"}
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
        className="mt-2 w-full accent-foreground"
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
