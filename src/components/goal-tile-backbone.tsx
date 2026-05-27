"use client";

import { CapsuleIllustration } from "@/components/capsule-illustration";
import { ChevronRight } from "lucide-react";
import {
  CATEGORY_PROMPT,
  CATEGORY_ORDER,
  getPalette,
  type CategoryKey,
} from "@/lib/category-palette";
import { cn } from "@/lib/utils";

/**
 * The goal tiles, anchored to a real peptide backbone above them. Each
 * tile is connected to its α-carbon residue via a hairline leader, so
 * the four-way category choice reads as one composed graphic — a single
 * BPC-157 N-terminal tetrapeptide whose residues are the navigation.
 *
 * The backbone rail is shown only at `lg` and up, where the tile grid is
 * a true 4-column. Below `lg`, only the tiles render.
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
      <BackboneRail />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORY_ORDER.map((c, i) => (
          <ColumnTile
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

// ─── The peptide backbone rail ──────────────────────────────────────

const RESIDUES = [
  { abbr: "GLY", name: "Glycine" },
  { abbr: "GLU", name: "Glutamic acid" },
  { abbr: "PRO", name: "Proline" },
  { abbr: "PRO", name: "Proline" },
] as const;

/**
 * The four α-carbons are placed at the x-centers of the underlying
 * 4-column tile grid. Between them, the backbone zigzags through two
 * intermediate points (one above, one below) — a stylized but real
 * skeletal drawing of a peptide bond geometry.
 */
function BackboneRail() {
  // viewBox is 1000 wide × 130 tall. Residue centers map to the tile
  // column centers: 12.5%, 37.5%, 62.5%, 87.5% of width.
  const cx = [125, 375, 625, 875];
  const baseY = 60;
  const upY = baseY - 11;
  const downY = baseY + 11;

  // Build a zigzag through every Cα. Between Cα(i) and Cα(i+1) we
  // pass through two midpoints — alternately up and down — to read as
  // the C(=O)-N(H) backbone hops.
  const segments: string[] = [`M ${cx[0]} ${baseY}`];
  for (let i = 0; i < cx.length - 1; i++) {
    const xL = cx[i];
    const xR = cx[i + 1];
    const t1 = xL + (xR - xL) * 0.35;
    const t2 = xL + (xR - xL) * 0.65;
    if (i % 2 === 0) {
      segments.push(`L ${t1} ${upY} L ${t2} ${downY} L ${xR} ${baseY}`);
    } else {
      segments.push(`L ${t1} ${downY} L ${t2} ${upY} L ${xR} ${baseY}`);
    }
  }
  const backbone = segments.join(" ");

  return (
    <div
      aria-hidden
      className="relative mb-4 hidden w-full lg:block"
      style={{ aspectRatio: "1000 / 130" }}
    >
      <svg
        viewBox="0 0 1000 130"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        {/* Eyebrow + lab-notebook caption */}
        <g>
          <text
            x="0"
            y="18"
            fontFamily="var(--font-mono)"
            fontSize="12"
            letterSpacing="2"
            fill="oklch(0.16 0.015 250 / 0.55)"
          >
            JUMP IN BY GOAL
          </text>
          <text
            x="1000"
            y="18"
            textAnchor="end"
            fontFamily="var(--font-mono)"
            fontSize="12"
            letterSpacing="2"
            fill="oklch(0.16 0.015 250 / 0.45)"
          >
            BPC-157 · N-TERMINUS · FIG. 01
          </text>
          <line
            x1="0"
            y1="26"
            x2="1000"
            y2="26"
            stroke="oklch(0.16 0.015 250 / 0.18)"
            strokeWidth="0.75"
            vectorEffect="non-scaling-stroke"
          />
        </g>

        {/* Cα–Cα dimension annotation between residues 1 and 2 */}
        <g
          fontFamily="var(--font-mono)"
          fontSize="11"
          fill="oklch(0.16 0.015 250 / 0.55)"
        >
          <line
            x1={cx[0]}
            y1="42"
            x2={cx[1]}
            y2="42"
            stroke="oklch(0.16 0.015 250 / 0.30)"
            strokeWidth="0.75"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={cx[0]}
            y1="38"
            x2={cx[0]}
            y2="46"
            stroke="oklch(0.16 0.015 250 / 0.30)"
            strokeWidth="0.75"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={cx[1]}
            y1="38"
            x2={cx[1]}
            y2="46"
            stroke="oklch(0.16 0.015 250 / 0.30)"
            strokeWidth="0.75"
            vectorEffect="non-scaling-stroke"
          />
          <text x={(cx[0] + cx[1]) / 2} y="38" textAnchor="middle">
            ≈ 3.8 Å · Cα–Cα
          </text>
        </g>

        {/* The backbone */}
        <path
          d={backbone}
          fill="none"
          stroke="oklch(0.16 0.015 250 / 0.78)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* α-Carbons */}
        {cx.map((x, i) => (
          <g key={i}>
            <circle
              cx={x}
              cy={baseY}
              r="9"
              fill="none"
              stroke="oklch(0.16 0.015 250 / 0.25)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={x} cy={baseY} r="4" fill="oklch(0.16 0.015 250)" />
          </g>
        ))}
      </svg>

      {/* Residue labels overlaid in HTML so the type stays crisp at every
          viewport width (no SVG scaling artefacts). Each is absolutely
          positioned at its column center and at the baseline of the rail. */}
      {RESIDUES.map((r, i) => {
        const xPercent = (i + 0.5) * 25; // 12.5, 37.5, 62.5, 87.5
        const topPercent = ((baseY + 14) / 130) * 100; // just below the α-carbon
        return (
          <div
            key={i}
            className="pointer-events-none absolute flex -translate-x-1/2 flex-col items-center"
            style={{
              left: `${xPercent}%`,
              top: `${topPercent}%`,
            }}
          >
            <span className="font-mono text-[26px] font-medium uppercase leading-none tracking-[0.18em] text-foreground/80">
              {r.abbr}
            </span>
            <span className="mt-1 font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-muted-foreground/70">
              · {String(i + 1).padStart(2, "0")} ·
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── A goal tile, retuned slightly for the integrated layout ────────

function ColumnTile({
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
      className="group relative flex h-full min-h-[120px] w-full items-center justify-between overflow-hidden rounded-2xl border border-transparent p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg sm:p-5"
      style={{
        background: `linear-gradient(135deg, ${p.bgFrom} 0%, ${p.bgTo} 100%)`,
      }}
    >
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center gap-2">
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

      <CapsuleIllustration
        palette={p}
        className="absolute right-0 top-1/2 h-[140px] w-[140px] -translate-y-1/2 translate-x-3 transition-transform duration-500 group-hover:-translate-y-[55%] group-hover:translate-x-1 sm:h-[160px] sm:w-[160px]"
        tilt={-22}
      />

      <ChevronRight
        className="relative z-10 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
        style={{ color: p.accent }}
      />
    </button>
  );
}
