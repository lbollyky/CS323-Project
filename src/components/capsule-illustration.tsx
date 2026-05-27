"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import type { CategoryPalette } from "@/lib/category-palette";

/**
 * Floating two-tone capsule, drawn as SVG. Used inside goal tiles and the
 * builder's "in the box" list. Reads as an intentional product render even
 * before we ship real photography.
 *
 *   - The capsule is drawn at a slight tilt with a soft drop shadow puddle.
 *   - The back half uses the saturated category color; the front half is
 *     pale; specular highlights add the "rendered" feel.
 *   - `floating` adds a slow vertical drift (turn off for static cards).
 */
export function CapsuleIllustration({
  palette,
  className,
  tilt = -18,
  floating = true,
}: {
  palette: CategoryPalette;
  className?: string;
  tilt?: number;
  floating?: boolean;
}) {
  const uid = useId();

  return (
    <div
      className={cn(
        "relative",
        floating && "motion-safe:animate-float-slow",
        className,
      )}
    >
      <svg
        viewBox="0 0 200 200"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={`pale-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={palette.capsulePale} stopOpacity="0.9" />
            <stop offset="100%" stopColor={palette.capsulePale} stopOpacity="1" />
          </linearGradient>
          <linearGradient id={`deep-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={palette.capsuleDeep} />
            <stop offset="100%" stopColor={palette.accent} />
          </linearGradient>
          <radialGradient id={`shadow-${uid}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor={palette.accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`spec-${uid}`} cx="0.3" cy="0.25" r="0.5">
            <stop offset="0%" stopColor="white" stopOpacity="0.75" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Shadow puddle */}
        <ellipse
          cx="100"
          cy="172"
          rx="62"
          ry="9"
          fill={`url(#shadow-${uid})`}
        />

        {/* Capsule */}
        <g transform={`translate(100, 96) rotate(${tilt})`}>
          {/* Body — two halves, joined seam */}
          <g transform="translate(-72, -22)">
            {/* Back / saturated half */}
            <rect
              x="72"
              y="0"
              width="72"
              height="44"
              rx="22"
              ry="22"
              fill={`url(#deep-${uid})`}
            />
            {/* Front / pale half */}
            <rect
              x="0"
              y="0"
              width="74"
              height="44"
              rx="22"
              ry="22"
              fill={`url(#pale-${uid})`}
              stroke={palette.soft}
              strokeWidth="0.6"
            />
            {/* Subtle seam */}
            <line
              x1="73"
              y1="2"
              x2="73"
              y2="42"
              stroke={palette.accent}
              strokeOpacity="0.18"
              strokeWidth="1"
            />
            {/* Specular highlight on the pale half */}
            <ellipse
              cx="32"
              cy="14"
              rx="22"
              ry="6"
              fill={`url(#spec-${uid})`}
            />
            {/* Tiny highlight on the deep half */}
            <ellipse
              cx="106"
              cy="13"
              rx="14"
              ry="3.5"
              fill="white"
              opacity="0.18"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
