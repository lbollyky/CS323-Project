"use client";

import { getPalette } from "@/lib/category-palette";
import type { CategoryKey } from "@/lib/category-palette";
import { cn } from "@/lib/utils";

interface Milestone {
  week: string;
  label: string;
  note: string;
}

const TIMELINES: Record<string, Milestone[]> = {
  epitalon: [
    { week: "Wk 1", label: "Settle in", note: "First sleep cycle shifts" },
    { week: "Wk 2–3", label: "Stabilize", note: "Fewer 3 a.m. wakeups" },
    { week: "Wk 4–6", label: "Architecture", note: "Deep + REM rebalance" },
    { week: "Wk 8", label: "Reassess", note: "Decide to continue / taper" },
  ],
  pinealon: [
    { week: "Wk 1", label: "Light up", note: "Morning focus lifts" },
    { week: "Wk 2–3", label: "Hold", note: "Word-finding steadier" },
    { week: "Wk 4–6", label: "Compound", note: "Sustained clarity midday" },
    { week: "Wk 8", label: "Reassess", note: "Optional cycle off" },
  ],
  "restore-bpc": [
    { week: "Wk 1", label: "Inflame ↓", note: "Soreness softens" },
    { week: "Wk 2–3", label: "Repair", note: "Range of motion returns" },
    { week: "Wk 4–6", label: "Rebuild", note: "Load tolerance up" },
    { week: "Wk 8", label: "Off-ramp", note: "Stop or taper" },
  ],
  "dual-stack": [
    { week: "Wk 1", label: "Both online", note: "Evening calm, morning lift" },
    { week: "Wk 2–4", label: "Compound", note: "Sleep + focus reinforce" },
    { week: "Wk 5–7", label: "Restore", note: "Architecture + cognition" },
    { week: "Wk 8", label: "Reassess", note: "Choose to continue solo or stack" },
  ],
};

export function ProtocolTimeline({
  productId,
  category,
  className,
}: {
  productId: string;
  category: CategoryKey;
  className?: string;
}) {
  const palette = getPalette(category);
  const milestones = TIMELINES[productId] ?? TIMELINES.epitalon;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-background p-4",
        className,
      )}
    >
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
          What to expect
        </p>
        <p className="text-[11px] text-muted-foreground">
          Self-reported median, n = 1,247
        </p>
      </div>

      <div className="relative mt-4">
        {/* Rail */}
        <div
          className="absolute left-2 right-2 top-[18px] h-px"
          style={{
            background: `linear-gradient(to right, transparent, ${palette.accent}, transparent)`,
            opacity: 0.6,
          }}
        />
        <ol className="relative grid grid-cols-4 gap-2">
          {milestones.map((m, i) => (
            <li key={i} className="flex flex-col items-center text-center">
              <span
                className="grid h-9 w-9 place-items-center rounded-full border-2 bg-background font-mono text-[10px] font-medium"
                style={{
                  borderColor: palette.accent,
                  color: palette.accent,
                }}
              >
                {i + 1}
              </span>
              <p
                className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em]"
                style={{ color: palette.accent }}
              >
                {m.week}
              </p>
              <p className="mt-1 text-[12px] font-medium text-foreground">
                {m.label}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {m.note}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
