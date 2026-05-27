"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { CapsuleIllustration } from "@/components/capsule-illustration";
import {
  CATEGORY_PROMPT,
  CATEGORY_ORDER,
  getPalette,
  type CategoryKey,
} from "@/lib/category-palette";
import { cn } from "@/lib/utils";

/**
 * Large entry tile in the style of the Hims category grid. A tinted card
 * with a floating, color-matched capsule render and a goal label. Replaces
 * the small text chips as the primary on-ramp into the protocol guide.
 */
export function GoalTile({
  category,
  badge,
  onClick,
  className,
  icon: Icon,
}: {
  category: CategoryKey;
  badge?: string;
  onClick: (prompt: string) => void;
  className?: string;
  icon?: LucideIcon;
}) {
  const p = getPalette(category);

  return (
    <button
      type="button"
      onClick={() => onClick(CATEGORY_PROMPT[category])}
      className={cn(
        "group relative flex h-full min-h-[120px] w-full items-center justify-between overflow-hidden rounded-2xl border border-transparent p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg sm:p-5",
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${p.bgFrom} 0%, ${p.bgTo} 100%)`,
      }}
    >
      {/* Top-left meta */}
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center gap-2">
          {Icon && (
            <span
              className="grid h-5 w-5 place-items-center rounded-full"
              style={{ background: p.accent }}
            >
              <Icon className="h-3 w-3 text-white" strokeWidth={2.4} />
            </span>
          )}
          {badge && (
            <span
              className="rounded-full px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-white"
              style={{ background: p.accent }}
            >
              {badge}
            </span>
          )}
        </div>

        <div>
          <p
            className="text-[19px] font-medium tracking-tight"
            style={{ color: p.accent }}
          >
            {p.label}
          </p>
          <p className="mt-1 max-w-[16ch] text-[12px] leading-snug text-foreground/65">
            {p.caption}
          </p>
        </div>
      </div>

      {/* Floating capsule on the right */}
      <CapsuleIllustration
        palette={p}
        className="absolute right-0 top-1/2 h-[140px] w-[140px] -translate-y-1/2 translate-x-3 transition-transform duration-500 group-hover:-translate-y-[55%] group-hover:translate-x-1 sm:h-[160px] sm:w-[160px]"
        tilt={-22}
      />

      {/* Chevron */}
      <ChevronRight
        className="relative z-10 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
        style={{ color: p.accent }}
      />
    </button>
  );
}

export function GoalTileGrid({
  onSelect,
  className,
}: {
  onSelect: (prompt: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {CATEGORY_ORDER.map((c, i) => (
        <GoalTile
          key={c}
          category={c}
          onClick={onSelect}
          badge={i === 0 ? "Most chosen" : undefined}
        />
      ))}
    </div>
  );
}
