"use client";

import { useState } from "react";
import {
  Sun,
  Moon,
  Lock,
  Loader2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { CapsuleIllustration } from "@/components/capsule-illustration";
import { ClinicianCard } from "@/components/clinician-card";
import { ProtocolTimeline } from "@/components/protocol-timeline";
import { ProductDetailModal } from "@/components/product-detail-modal";
import { ProtocolThinking } from "@/components/protocol-thinking";
import { categoryForProduct, getPalette } from "@/lib/category-palette";
import type { ProtocolProduct } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * Live, structured protocol panel that builds up as the AI streams its
 * recommendation. Lives to the right of the conversation on the chat
 * screen. Replaces "ask the bot, get a paragraph + one card" with
 * "build the protocol with the bot, see it materialize in real time."
 */

export interface ProtocolMeta {
  goal?: string;
  duration_weeks?: number;
  cohort?: string; // e.g. "users 35–45 with similar goals"
  cohort_outcome?: string; // e.g. "reported deeper sleep within 6 weeks"
}

export function ProtocolBuilder({
  products,
  meta,
  isStreaming,
  query,
  building = false,
  buildTurns = 0,
  buildDone = false,
  onCheckout,
  className,
}: {
  products: ProtocolProduct[];
  meta: ProtocolMeta;
  isStreaming: boolean;
  query?: string;
  /** Show the staged "thinking" panel instead of the empty/protocol view. */
  building?: boolean;
  /** Conversation progress (answered questions) that drives the steps. */
  buildTurns?: number;
  /** Finishing beat — completes every step before revealing the protocol. */
  buildDone?: boolean;
  onCheckout: () => void;
  className?: string;
}) {
  const subtotal = products.reduce((s, p) => s + p.price, 0);
  const empty = products.length === 0;
  const [active, setActive] = useState<ProtocolProduct | null>(null);

  return (
    <aside
      className={cn(
        "flex h-full flex-col gap-4 overflow-y-auto",
        className,
      )}
    >
      <header className="flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
            Your protocol
          </p>
          <h2 className="mt-1 text-[20px] font-medium tracking-tight text-foreground">
            {building || empty ? "Building…" : meta.goal ?? "Recommended"}
          </h2>
        </div>
        {isStreaming && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 px-2 py-1 text-[11px] text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Updating
          </span>
        )}
      </header>

      {building ? (
        <ProtocolThinking query={query} turns={buildTurns} done={buildDone} />
      ) : empty ? (
        <EmptyState />
      ) : (
        <>
          <ClinicianCard variant="compact" />

          {meta.cohort && (
            <CohortReasoning
              cohort={meta.cohort}
              outcome={meta.cohort_outcome}
            />
          )}

          <section className="rounded-2xl border border-border bg-background">
            <div className="border-b border-border/60 px-4 py-2.5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                Daily schedule
              </p>
            </div>
            <DosingSchedule products={products} />
          </section>

          <ProtocolTimeline
            productId={products[0].id}
            category={categoryForProduct(products[0].id)}
          />

          <section className="rounded-2xl border border-border bg-background p-4">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
              In the box
            </p>
            <ul className="mt-3 space-y-3">
              {products.map((p) => {
                const palette = getPalette(categoryForProduct(p.id));
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setActive(p)}
                      aria-label={`View details for ${p.name}`}
                      className="focus-ring group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-border/60 p-2 text-left transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        background: `linear-gradient(135deg, ${palette.bgFrom}, ${palette.bgTo})`,
                      }}
                    >
                      {/* Glow + ring on hover, in the product's own hue. */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          boxShadow: `inset 0 0 0 1.5px ${palette.accent}, 0 10px 28px -8px ${palette.accent}`,
                        }}
                      />
                      <CapsuleIllustration
                        palette={palette}
                        floating={false}
                        className="h-14 w-14 shrink-0"
                        tilt={-18}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-medium text-foreground">
                          {p.name}
                        </p>
                        <p className="truncate text-[11.5px] text-foreground/65">
                          {p.active}
                        </p>
                        <span className="mt-0.5 inline-block text-[10.5px] font-medium text-foreground/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          Tap for details →
                        </span>
                      </div>
                      <span className="shrink-0 text-[13px] font-medium tabular-nums">
                        ${p.price}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
              <span className="text-[12.5px] text-muted-foreground">
                Subtotal · {meta.duration_weeks ?? 8} weeks
              </span>
              <span className="text-[15px] font-semibold tabular-nums">
                ${subtotal}
              </span>
            </div>

            <button
              type="button"
              onClick={onCheckout}
              disabled={isStreaming}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-foreground py-2.5 text-[13.5px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-30"
            >
              Add to cart & check out
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-muted-foreground">
              <Lock className="h-2.5 w-2.5" />
              Stripe secure checkout · 30-day return
            </p>
          </section>
        </>
      )}

      <ProductDetailModal product={active} onClose={() => setActive(null)} />
    </aside>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-5">
      <p className="text-[13.5px] font-medium text-foreground/80">
        Your protocol will appear here.
      </p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
        As Dr. Levin gathers what you need, the daily schedule, the bottles,
        and the cost will fill in on this side. Cart updates live — one
        click to check out.
      </p>
      <ul className="mt-4 space-y-2 text-[12px] text-muted-foreground">
        <li className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-foreground/40" />
          Reviewed by a board-certified MD
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-foreground/40" />
          Based on cohort data from users like you
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-foreground/40" />
          Smallest fitting protocol — not the most
        </li>
      </ul>
    </div>
  );
}

function CohortReasoning({
  cohort,
  outcome,
}: {
  cohort: string;
  outcome?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-3.5 w-3.5 text-foreground" />
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
          Why this fits
        </p>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">
        Based on <span className="font-medium">{cohort}</span>
        {outcome ? (
          <>
            , who <span className="font-medium">{outcome}</span>.
          </>
        ) : (
          "."
        )}
      </p>
    </div>
  );
}

function DosingSchedule({ products }: { products: ProtocolProduct[] }) {
  // Map products to morning/evening slots using the same routing the
  // system prompt uses. epitalON → evening, pinealON → morning, BPC → morning,
  // dual-stack → both.
  const morning = products.filter((p) =>
    ["pinealon", "restore-bpc"].includes(p.id),
  );
  const evening = products.filter((p) =>
    ["epitalon"].includes(p.id),
  );
  const dual = products.find((p) => p.id === "dual-stack");
  if (dual) {
    morning.push({ ...dual, name: "pinealON (from stack)" });
    evening.push({ ...dual, name: "epitalON (from stack)" });
  }

  return (
    <div className="grid grid-cols-2 divide-x divide-border/60">
      <Slot
        label="Morning"
        icon={<Sun className="h-3.5 w-3.5" />}
        products={morning}
      />
      <Slot
        label="Evening"
        icon={<Moon className="h-3.5 w-3.5" />}
        products={evening}
      />
    </div>
  );
}

function Slot({
  label,
  icon,
  products,
}: {
  label: string;
  icon: React.ReactNode;
  products: ProtocolProduct[];
}) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-1.5 text-foreground">
        {icon}
        <span className="text-[11.5px] font-medium tracking-wide">
          {label}
        </span>
      </div>
      {products.length === 0 ? (
        <p className="mt-2 text-[11.5px] text-muted-foreground">—</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {products.map((p, i) => (
            <li
              key={`${p.id}-${i}`}
              className="truncate text-[11.5px] text-foreground/85"
            >
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
