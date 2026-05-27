"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type Variant = "epitalon" | "pinealon" | "restore-bpc" | "dual-stack";

const PALETTE: Record<
  Variant,
  { from: string; to: string; cap: string; tag: string; code: string }
> = {
  epitalon: {
    from: "oklch(0.84 0.05 260)",
    to: "oklch(0.56 0.18 260)",
    cap: "oklch(0.22 0.05 260)",
    tag: "Sleep · AEDG",
    code: "AEDG",
  },
  pinealon: {
    from: "oklch(0.86 0.05 220)",
    to: "oklch(0.58 0.14 220)",
    cap: "oklch(0.20 0.04 220)",
    tag: "Cognitive · EDR",
    code: "EDR",
  },
  "restore-bpc": {
    from: "oklch(0.88 0.05 150)",
    to: "oklch(0.55 0.13 175)",
    cap: "oklch(0.20 0.04 180)",
    tag: "Recovery · BPC-157",
    code: "BPC",
  },
  "dual-stack": {
    from: "oklch(0.85 0.05 290)",
    to: "oklch(0.50 0.18 280)",
    cap: "oklch(0.20 0.05 280)",
    tag: "Longevity · Stack",
    code: "AEDG + EDR",
  },
};

/**
 * SVG product illustration for the supplement bottles. Reads as intentional,
 * on-brand product art — easy to swap for real photography later by replacing
 * this component with an <Image /> tag.
 */
export function ProductIllustration({
  id,
  className,
  showLabel = true,
}: {
  id: string;
  className?: string;
  showLabel?: boolean;
}) {
  const key = (id in PALETTE ? id : "epitalon") as Variant;
  const p = PALETTE[key];
  const isStack = key === "dual-stack";
  // Unique gradient ids so multiple instances on the same page don't collide.
  const uid = `${key}-${useId()}`;

  return (
    <div className={cn("relative aspect-square", className)}>
      <svg
        viewBox="0 0 160 160"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.from} stopOpacity="0.45" />
            <stop offset="100%" stopColor={p.to} stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id={`bottle-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.99 0 0)" />
            <stop offset="100%" stopColor="oklch(0.94 0.005 250)" />
          </linearGradient>
          <linearGradient id={`cap-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.cap} />
            <stop offset="100%" stopColor={p.to} />
          </linearGradient>
          <radialGradient id={`spot-${uid}`} cx="0.3" cy="0.2" r="0.6">
            <stop offset="0%" stopColor="white" stopOpacity="0.55" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Atmospheric backdrop */}
        <rect width="160" height="160" fill={`url(#bg-${uid})`} rx="14" />
        <circle
          cx="48"
          cy="50"
          r="60"
          fill={p.to}
          opacity="0.18"
          style={{ mixBlendMode: "multiply" }}
        />

        {isStack ? (
          <StackedBottles palette={p} uid={uid} />
        ) : (
          <SingleBottle palette={p} uid={uid} />
        )}
      </svg>

      {showLabel && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <span className="rounded-full bg-background/85 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-foreground/70 backdrop-blur-sm">
            {p.tag}
          </span>
        </div>
      )}
    </div>
  );
}

function SingleBottle({
  palette: p,
  uid,
}: {
  palette: (typeof PALETTE)[Variant];
  uid: string;
}) {
  return (
    <g>
      <ellipse cx="80" cy="142" rx="32" ry="3.5" fill="black" opacity="0.12" />
      {/* Bottle body */}
      <rect
        x="58"
        y="46"
        width="44"
        height="84"
        rx="9"
        fill={`url(#bottle-${uid})`}
        stroke="oklch(0.88 0.005 250)"
        strokeWidth="0.8"
      />
      {/* Label wash */}
      <rect
        x="62"
        y="60"
        width="36"
        height="44"
        rx="3"
        fill={p.from}
        opacity="0.22"
      />
      <text
        x="80"
        y="78"
        textAnchor="middle"
        fontFamily="ui-monospace, SFMono-Regular, Menlo"
        fontSize="9"
        fontWeight="600"
        fill="oklch(0.20 0.02 250)"
        letterSpacing="0.18em"
      >
        PEPWELL
      </text>
      <text
        x="80"
        y="92"
        textAnchor="middle"
        fontFamily="ui-monospace, SFMono-Regular, Menlo"
        fontSize="13"
        fontWeight="700"
        fill={p.cap}
        letterSpacing="0.12em"
      >
        {p.code}
      </text>
      <rect x="60" y="98" width="40" height="0.5" fill="oklch(0.86 0.005 250)" />
      {/* Cap */}
      <rect x="64" y="34" width="32" height="14" rx="3" fill={`url(#cap-${uid})`} />
      <rect x="68" y="42" width="24" height="2" fill="white" opacity="0.18" />
      {/* Shoulder shadow */}
      <rect x="58" y="46" width="44" height="6" rx="9" fill={p.cap} opacity="0.08" />
      {/* Highlight stripe */}
      <rect
        x="63"
        y="50"
        width="6"
        height="74"
        rx="3"
        fill="white"
        opacity="0.35"
      />
      {/* Specular blob */}
      <circle cx="58" cy="60" r="32" fill={`url(#spot-${uid})`} opacity="0.55" />
    </g>
  );
}

function StackedBottles({
  palette: p,
  uid,
}: {
  palette: (typeof PALETTE)[Variant];
  uid: string;
}) {
  return (
    <g>
      <ellipse cx="80" cy="146" rx="46" ry="4" fill="black" opacity="0.12" />
      {/* Back bottle */}
      <g transform="translate(40, 30) scale(0.78)">
        <rect
          x="58"
          y="46"
          width="44"
          height="84"
          rx="9"
          fill={`url(#bottle-${uid})`}
          stroke="oklch(0.88 0.005 250)"
          strokeWidth="0.8"
          opacity="0.9"
        />
        <rect
          x="64"
          y="34"
          width="32"
          height="14"
          rx="3"
          fill={p.cap}
          opacity="0.9"
        />
        <text
          x="80"
          y="92"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo"
          fontSize="13"
          fontWeight="700"
          fill={p.cap}
          letterSpacing="0.12em"
        >
          EDR
        </text>
      </g>
      {/* Front bottle */}
      <g transform="translate(20, 12)">
        <rect
          x="58"
          y="46"
          width="44"
          height="84"
          rx="9"
          fill={`url(#bottle-${uid})`}
          stroke="oklch(0.88 0.005 250)"
          strokeWidth="0.8"
        />
        <rect x="64" y="34" width="32" height="14" rx="3" fill={`url(#cap-${uid})`} />
        <rect x="68" y="42" width="24" height="2" fill="white" opacity="0.18" />
        <text
          x="80"
          y="78"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo"
          fontSize="9"
          fontWeight="600"
          fill="oklch(0.20 0.02 250)"
          letterSpacing="0.18em"
        >
          PEPWELL
        </text>
        <text
          x="80"
          y="92"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo"
          fontSize="13"
          fontWeight="700"
          fill={p.cap}
          letterSpacing="0.12em"
        >
          AEDG
        </text>
        <rect x="60" y="98" width="40" height="0.5" fill="oklch(0.86 0.005 250)" />
        <rect x="63" y="50" width="6" height="74" rx="3" fill="white" opacity="0.35" />
      </g>
    </g>
  );
}
