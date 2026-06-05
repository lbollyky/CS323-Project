"use client";

import Link from "next/link";
import { Calendar, Pill } from "lucide-react";
import { CapsuleIllustration } from "@/components/capsule-illustration";
import { categoryForProduct, getPalette } from "@/lib/category-palette";
import { getProductsByIds, PRODUCTS } from "@/lib/products";
import type { UserProtocol } from "@/types/user-protocol";

function weekOfProtocol(startedAt: string | null, durationWeeks: number | null): string | null {
  if (!startedAt || !durationWeeks) return null;
  const start = new Date(`${startedAt}T12:00:00`);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  const week = Math.max(1, Math.floor(diffDays / 7) + 1);
  return `Week ${Math.min(week, durationWeeks)} of ${durationWeeks}`;
}

export function ProtocolHeader({
  protocol,
}: {
  protocol: UserProtocol | null;
}) {
  const ids = protocol?.active_protocol_ids ?? [];
  const products = getProductsByIds(ids);
  const weekLabel = weekOfProtocol(
    protocol?.protocol_started_at ?? null,
    protocol?.protocol_duration_weeks ?? null,
  );

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
              {weekLabel && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {weekLabel}
                </span>
              )}
              {protocol?.protocol_started_at && (
                <span>
                  Started {protocol.protocol_started_at}
                </span>
              )}
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <Pill className="h-3 w-3" />
            {products.length} compound{products.length === 1 ? "" : "s"}
          </span>
        </div>

        <ul className="mt-5 divide-y divide-border/60 rounded-xl border border-border/60 bg-background/80">
          {products.map((p) => {
            const palette = getPalette(categoryForProduct(p.id));
            return (
              <li
                key={p.id}
                className="flex items-center gap-4 px-4 py-3.5"
              >
                <CapsuleIllustration
                  palette={palette}
                  className="h-12 w-12 shrink-0"
                  tilt={-18}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium tracking-tight">
                    {p.name}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                    {p.active}
                  </p>
                </div>
                <p className="hidden shrink-0 text-[11.5px] text-muted-foreground sm:block">
                  {p.tag_line}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
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
