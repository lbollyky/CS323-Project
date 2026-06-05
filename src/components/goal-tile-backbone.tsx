"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  CATEGORY_PROMPT,
  CATEGORY_ORDER,
  getPalette,
  type CategoryKey,
} from "@/lib/category-palette";
import { cn } from "@/lib/utils";

/** Associated, human-esque artwork for each goal, hue-matched to its card. */
const CATEGORY_IMAGE: Record<CategoryKey, string> = {
  sleep: "/goals/goal-sleep.png",
  cognition: "/goals/goal-cognition.png",
  recovery: "/goals/goal-recovery-v2.png",
  longevity: "/goals/goal-longevity.png",
};

/** Append an alpha channel to an `oklch(...)` color string. */
function withAlpha(color: string, a: number): string {
  return color.replace(/\)\s*$/, ` / ${a})`);
}

/**
 * The four goal cards — each a colored gradient panel with its title and
 * caption on the left and a slightly translucent associated image bled in
 * from the right. Clicking a card opens that category in the guide.
 */
export function GoalTileBackbone({
  onSelect,
  className,
}: {
  onSelect: (prompt: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {CATEGORY_ORDER.map((c, i) => (
          <GoalCard
            key={c}
            category={c}
            onClick={onSelect}
            badge={i === 0 ? "Most chosen" : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function GoalCard({
  category,
  badge,
  onClick,
}: {
  category: CategoryKey;
  badge?: string;
  onClick: (prompt: string) => void;
}) {
  const p = getPalette(category);
  return (
    <button
      type="button"
      onClick={() => onClick(CATEGORY_PROMPT[category])}
      aria-label={`${p.label} — ${p.caption}`}
      className="hover-lift focus-ring group relative flex min-h-[168px] w-full select-none overflow-hidden rounded-2xl border border-transparent text-left sm:min-h-[188px]"
      style={{
        background: `linear-gradient(135deg, ${p.bgFrom} 0%, ${p.bgTo} 100%)`,
      }}
    >
      {/* Associated image, right-anchored and slightly translucent. The
          mask fades its left edge into the card so the title stays legible. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[64%]">
        <Image
          src={CATEGORY_IMAGE[category]}
          alt=""
          fill
          sizes="(min-width: 640px) 320px, 60vw"
          quality={90}
          className="object-cover opacity-[0.85] transition-transform duration-500 group-hover:scale-[1.03]"
          style={{
            objectPosition: "right center",
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.9) 44%, #000 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.9) 44%, #000 100%)",
          }}
        />
        {/* Palette veil so the photo reads as part of the card surface. */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, ${withAlpha(
              p.bgTo,
              0.55,
            )} 0%, ${withAlpha(p.bgTo, 0)} 55%, ${withAlpha(
              p.soft,
              0.2,
            )} 100%)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col justify-between p-5">
        <div className="flex">
          {badge && (
            <span
              className="rounded-full px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-white"
              style={{ background: p.accent }}
            >
              {badge}
            </span>
          )}
        </div>

        <div className="mt-auto">
          <h3
            className="text-[20px] font-medium leading-tight tracking-tight sm:text-[22px]"
            style={{ color: p.accent }}
          >
            {p.label}
          </h3>
          <p className="mt-1 max-w-[18ch] text-[12.5px] leading-snug text-foreground/70">
            {p.caption}
          </p>

          <span className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 shadow-sm backdrop-blur transition-transform duration-300 group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" style={{ color: p.accent }} />
          </span>
        </div>
      </div>
    </button>
  );
}
