"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Check,
  MessageCircle,
  Pill,
} from "lucide-react";
import { CapsuleIllustration } from "@/components/capsule-illustration";
import {
  categoryForProduct,
  getPalette,
  type CategoryPalette,
} from "@/lib/category-palette";
import {
  getProductsByIds,
  PRODUCTS,
  type ProtocolProduct,
} from "@/lib/products";
import type { UserProtocol } from "@/types/user-protocol";

const DEFAULT_DURATION_WEEKS = 8;

interface Milestone {
  week: number;
  title: string;
  body: string;
  isKickoff?: boolean;
}

/**
 * Build a timeline of check-in milestones based on the protocol length.
 *
 * Cadence rule: roughly every quarter of the protocol, with a hard floor of
 * two weeks between check-ins. Always anchored by Week 0 (kickoff) and the
 * final stop date so the user sees the full arc, not just intervals.
 */
function buildMilestones(durationWeeks: number): Milestone[] {
  const interval = Math.max(2, Math.round(durationWeeks / 4));
  const weeks = new Set<number>([0, durationWeeks]);
  for (let w = interval; w < durationWeeks; w += interval) weeks.add(w);
  const sorted = [...weeks].sort((a, b) => a - b);
  const interior = sorted.filter((w) => w !== 0 && w !== durationWeeks);

  return sorted.map((week) => {
    if (week === 0) {
      return {
        week,
        title: "Protocol prescribed",
        body: `Dr. Levin signed off on the smallest, best-evidenced stack for your goal — with a clear stop date ${durationWeeks} weeks out.`,
        isKickoff: true,
      };
    }
    if (week === durationWeeks) {
      return {
        week,
        title: "Stop and reassess",
        body: "Compare baseline to outcome. Decide whether to taper, extend with cause, or move on. Off-cycle plan locked in.",
      };
    }
    if (week === interior[0]) {
      return {
        week,
        title: "Early-response check-in",
        body: "Are side effects acceptable? Any early signal in sleep, energy, or recovery? Adjust dose if needed.",
      };
    }
    if (week === interior[interior.length - 1]) {
      return {
        week,
        title: "Pre-finish check-in",
        body: "Look at the trend, not the day. Decide if the goal is met and prep the off-cycle window.",
      };
    }
    return {
      week,
      title: "Midpoint reassessment",
      body: "Two-week look-back. Adjust dose or sequencing only if the signal demands it — most protocols stay the course.",
    };
  });
}

function elapsedWeeks(startedAt: string | null): number | null {
  if (!startedAt) return null;
  const start = new Date(`${startedAt}T12:00:00`);
  const now = new Date();
  const days = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(0, Math.floor(days / 7));
}

function weekLabel(elapsed: number | null, duration: number): string | null {
  if (elapsed === null) return null;
  const week = Math.max(1, Math.min(duration, elapsed + 1));
  return `Week ${week} of ${duration}`;
}

type MilestoneStatus = "past" | "current" | "future";

/**
 * The "current" milestone is the next not-yet-completed one — i.e. what the
 * user should be thinking about now. If the protocol is already over, the
 * final stop becomes current so the reassess CTA still shows up.
 */
function currentMilestoneIndex(
  milestones: Milestone[],
  elapsed: number | null,
): number {
  if (elapsed === null) return 0;
  const idx = milestones.findIndex((m) => m.week >= elapsed);
  return idx === -1 ? milestones.length - 1 : idx;
}

export function ProtocolHeader({
  protocol,
}: {
  protocol: UserProtocol | null;
}) {
  const ids = protocol?.active_protocol_ids ?? [];
  const products = getProductsByIds(ids);

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-6">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
          Your protocol
        </p>
        <h2 className="mt-2 text-[20px] font-medium tracking-tight">
          No active protocol yet
        </h2>
        <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
          Start with the{" "}
          <Link href="/" className="text-foreground underline-offset-4 hover:underline">
            protocol guide
          </Link>{" "}
          or checkout from the shop — your plan will show up here automatically.
        </p>
      </div>
    );
  }

  const headerPalette = getPalette(categoryForProduct(products[0].id));
  const duration =
    protocol?.protocol_duration_weeks ?? DEFAULT_DURATION_WEEKS;
  const milestones = buildMilestones(duration);
  const elapsed = elapsedWeeks(protocol?.protocol_started_at ?? null);
  const currentIdx = currentMilestoneIndex(milestones, elapsed);
  const label = weekLabel(elapsed, duration);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-background p-1 shadow-elevated">
      {/* Soft category-tinted glow in the corner for depth. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-70 blur-3xl"
        style={{ background: headerPalette.soft }}
      />
      <div className="relative rounded-[14px] bg-gradient-to-br from-background to-surface/80 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              Your protocol
            </p>
            <h2 className="mt-1 text-balance text-[22px] font-medium leading-tight tracking-tight sm:text-[26px]">
              {protocol?.protocol_goal ?? "Active protocol"}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[12.5px] text-muted-foreground">
              {label && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {label}
                </span>
              )}
              {protocol?.protocol_started_at && (
                <span>Started {protocol.protocol_started_at}</span>
              )}
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <Pill className="h-3 w-3" />
            {products.length} compound{products.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-6 rounded-xl border border-border/60 bg-background/80 p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              Timeline · check-ins with Dr. Levin
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {duration}-week arc
            </p>
          </div>

          <ol className="mt-5">
            {milestones.map((m, i) => (
              <TimelineItem
                key={m.week}
                milestone={m}
                status={
                  i < currentIdx
                    ? "past"
                    : i === currentIdx
                      ? "current"
                      : "future"
                }
                isLast={i === milestones.length - 1}
                palette={headerPalette}
                products={m.isKickoff ? products : []}
              />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  milestone,
  status,
  isLast,
  palette,
  products,
}: {
  milestone: Milestone;
  status: MilestoneStatus;
  isLast: boolean;
  palette: CategoryPalette;
  products: ProtocolProduct[];
}) {
  const accent = palette.accent;

  const nodeStyle: CSSProperties =
    status === "past"
      ? { background: "oklch(0.55 0.02 280)", borderColor: "transparent" }
      : status === "current"
        ? {
            background: accent,
            borderColor: accent,
            boxShadow: `0 0 0 4px ${palette.soft}`,
          }
        : { background: "transparent" };

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* Connector line to the next milestone. */}
      {!isLast && (
        <span
          aria-hidden
          className={
            "absolute left-[10px] top-[22px] w-px " +
            (status === "past" ? "bg-foreground/25" : "bg-border")
          }
          style={{ height: "calc(100% - 22px)" }}
        />
      )}

      {/* Node circle: filled+check (past), filled+halo (current), outlined (future). */}
      <span
        aria-hidden
        className="relative z-10 mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 border-border transition-colors"
        style={nodeStyle}
      >
        {status === "past" && (
          <Check className="h-3 w-3 text-background" strokeWidth={3} />
        )}
        {status === "current" && (
          <span className="h-1.5 w-1.5 rounded-full bg-background" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
            Week {String(milestone.week).padStart(2, "0")}
          </span>
          {status === "current" && (
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.18em]"
              style={{ background: palette.soft, color: accent }}
            >
              Up next
            </span>
          )}
          {status === "past" && (
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">
              Done
            </span>
          )}
        </div>
        <h3 className="mt-1 text-[15px] font-medium tracking-tight">
          {milestone.title}
        </h3>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
          {milestone.body}
        </p>

        {/* Kickoff milestone: surface the prescribed compounds inline so the
            timeline still shows what was originally signed off on. */}
        {products.length > 0 && (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {products.map((p) => {
              const itemPalette = getPalette(categoryForProduct(p.id));
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2"
                >
                  <CapsuleIllustration
                    palette={itemPalette}
                    className="h-9 w-9 shrink-0"
                    tilt={-18}
                    floating={false}
                  />
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium tracking-tight">
                      {p.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                      {p.active}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* CTA on the active check-in. Skipped on the kickoff node since the
            user has nothing to reevaluate on day zero. */}
        {status === "current" && !milestone.isKickoff && (
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-opacity hover:opacity-90"
            style={{ background: palette.soft, color: accent }}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Reevaluate with your guide
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </li>
  );
}

/** Map checkout line-item names back to product ids. */
export function productIdsFromLineItems(
  names: string[],
): string[] {
  const ids: string[] = [];
  for (const name of names) {
    const match = PRODUCTS.find(
      (p) =>
        p.name.toLowerCase() === name.toLowerCase() ||
        name.toLowerCase().includes(p.short_name.toLowerCase()),
    );
    if (match) ids.push(match.id);
  }
  return [...new Set(ids)];
}
