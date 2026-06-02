"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  "Reading your goals",
  "Screening the clinical evidence",
  "Matching the shortest effective protocol",
  "Personalizing dose & duration",
  "Writing up the rationale",
];

/**
 * Controlled "thinking" panel for the right-side protocol slot. Progress is
 * driven by the conversation (one stage per answered question) so it advances
 * steadily and never resets between messages. When `done` is set, every stage
 * completes for a beat before the real protocol is revealed.
 */
export function ProtocolThinking({
  query,
  turns = 0,
  done = false,
}: {
  query?: string;
  turns?: number;
  done?: boolean;
}) {
  // While building, advance with the conversation but hold the final stage in
  // reserve — it only completes during the finishing beat (`done`).
  const activeStep = done
    ? STAGES.length
    : Math.min(turns, STAGES.length - 2);

  const trimmed = query?.trim();
  const subtitle = done
    ? "Finalizing your protocol…"
    : trimmed && trimmed.length > 0
      ? `Customizing for: “${trimmed.length > 64 ? trimmed.slice(0, 64) + "…" : trimmed}”`
      : "Working through the evidence for your goal.";

  return (
    <div className="rounded-2xl border border-border/70 bg-surface/40 p-4">
      <div className="flex items-center gap-2">
        {done ? (
          <Check className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-foreground/70" />
        )}
        <p className="text-[13.5px] font-medium text-foreground">
          {done ? "Protocol ready" : "Building your protocol"}
        </p>
      </div>
      <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
        {subtitle}
      </p>

      {/* Progress bar — sweeps while building, fills when done. */}
      <div className="relative mt-3 h-0.5 w-full overflow-hidden rounded-full bg-border">
        {done ? (
          <div className="absolute inset-0 rounded-full bg-foreground/40" />
        ) : (
          <div className="animate-thinking-sweep absolute inset-y-0 left-0 w-1/3 rounded-full bg-foreground/40" />
        )}
      </div>

      <ul className="mt-3.5 space-y-2">
        {STAGES.map((label, i) => {
          const isDone = done || i < activeStep;
          const isCurrent = !done && i === activeStep;
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2.5 text-[12.5px] transition-colors",
                isDone && "text-muted-foreground",
                isCurrent && "text-foreground",
                !isDone && !isCurrent && "text-muted-foreground/40",
              )}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                {isDone ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-foreground/70" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>
              <span className={cn(isCurrent && "font-medium")}>{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
