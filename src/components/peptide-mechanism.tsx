"use client";

import { useId } from "react";
import {
  categoryForProduct,
  getPalette,
} from "@/lib/category-palette";
import { cn } from "@/lib/utils";

/**
 * Generative chemistry-style visualization of the peptide chain for one of
 * our SKUs. Reads as a designed artifact in the chat — not a stock icon.
 *
 * Each peptide we sell is a short sequence of amino acids:
 *   - epitalON / AEDG → Ala-Glu-Asp-Gly (4)
 *   - pinealON / EDR  → Glu-Asp-Arg (3)
 *   - Restore BPC     → Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val (15)
 *   - dual-stack      → AEDG + EDR (shown side by side)
 */

interface AminoAcid {
  code: string; // 3-letter code
  letter: string; // 1-letter code (shown inside the node)
  name?: string;
}

const SEQUENCES: Record<string, AminoAcid[]> = {
  epitalon: [
    { code: "Ala", letter: "A", name: "Alanine" },
    { code: "Glu", letter: "E", name: "Glutamate" },
    { code: "Asp", letter: "D", name: "Aspartate" },
    { code: "Gly", letter: "G", name: "Glycine" },
  ],
  pinealon: [
    { code: "Glu", letter: "E", name: "Glutamate" },
    { code: "Asp", letter: "D", name: "Aspartate" },
    { code: "Arg", letter: "R", name: "Arginine" },
  ],
  "restore-bpc": [
    { code: "Gly", letter: "G" },
    { code: "Glu", letter: "E" },
    { code: "Pro", letter: "P" },
    { code: "Pro", letter: "P" },
    { code: "Pro", letter: "P" },
    { code: "Gly", letter: "G" },
    { code: "Lys", letter: "K" },
    { code: "Pro", letter: "P" },
    { code: "Ala", letter: "A" },
    { code: "Asp", letter: "D" },
    { code: "Asp", letter: "D" },
    { code: "Ala", letter: "A" },
    { code: "Gly", letter: "G" },
    { code: "Leu", letter: "L" },
    { code: "Val", letter: "V" },
  ],
};

export function PeptideMechanism({
  productId,
  className,
  compact = false,
}: {
  productId: string;
  className?: string;
  compact?: boolean;
}) {
  const uid = useId();
  const category = categoryForProduct(productId);
  const palette = getPalette(category);

  // Dual-stack: render two short chains side by side.
  if (productId === "dual-stack") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-background p-4",
          className,
        )}
      >
        <Header palette={palette} title="Two systems · two short chains" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <ChainBlock id="epitalon" label="AEDG · circadian" />
          <ChainBlock id="pinealon" label="EDR · cognitive" />
        </div>
      </div>
    );
  }

  const sequence = SEQUENCES[productId] ?? SEQUENCES.epitalon;
  const isLong = sequence.length > 6;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-background p-4",
        className,
      )}
    >
      <Header
        palette={palette}
        title={
          productId === "epitalon"
            ? "AEDG · the circadian tetrapeptide"
            : productId === "pinealon"
              ? "EDR · the neurotrophic tripeptide"
              : "BPC-157 · stable gastric pentadecapeptide"
        }
      />
      <Chain
        sequence={sequence}
        uid={uid}
        palette={palette}
        compact={compact}
        wrap={isLong}
      />
      {!compact && (
        <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
          {productId === "epitalon"
            ? "Four amino acids. Crosses cell membranes, reaches the pineal axis, restores melatonin amplitude."
            : productId === "pinealon"
              ? "Three amino acids. Modulates antioxidant + neurotrophic gene expression — non-stimulant cognitive support."
              : "Fifteen amino acids, unusually gastric-stable. Activates VEGFR2 and fibroblast proliferation at injury sites."}
        </p>
      )}
    </div>
  );
}

function ChainBlock({ id, label }: { id: string; label: string }) {
  const uid = useId();
  const palette = getPalette(categoryForProduct(id));
  const sequence = SEQUENCES[id] ?? [];
  return (
    <div
      className="rounded-xl border border-border/60 p-3"
      style={{
        background: `linear-gradient(135deg, ${palette.bgFrom}, ${palette.bgTo})`,
      }}
    >
      <p
        className="font-mono text-[10px] uppercase tracking-[0.16em]"
        style={{ color: palette.accent }}
      >
        {label}
      </p>
      <Chain sequence={sequence} uid={uid} palette={palette} compact />
    </div>
  );
}

function Header({
  palette,
  title,
}: {
  palette: ReturnType<typeof getPalette>;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        Mechanism
      </p>
      <p
        className="text-[12px] font-medium"
        style={{ color: palette.accent }}
      >
        {title}
      </p>
    </div>
  );
}

function Chain({
  sequence,
  uid,
  palette,
  compact = false,
  wrap = false,
}: {
  sequence: AminoAcid[];
  uid: string;
  palette: ReturnType<typeof getPalette>;
  compact?: boolean;
  wrap?: boolean;
}) {
  const nodeR = compact ? 14 : 18;
  const gap = compact ? 38 : 50;
  const padX = nodeR + 6;
  const perRow = wrap ? 8 : sequence.length;
  const rows: AminoAcid[][] = [];
  for (let i = 0; i < sequence.length; i += perRow) {
    rows.push(sequence.slice(i, i + perRow));
  }

  const width = padX * 2 + Math.max(0, perRow - 1) * gap;
  const rowH = nodeR * 2 + 22;
  const height = rows.length * rowH + 8;

  return (
    <div className={cn("mt-3", compact ? "" : "overflow-x-auto")}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        style={{ minWidth: compact ? undefined : width }}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={`bond-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={palette.accent} stopOpacity="0.0" />
            <stop offset="50%" stopColor={palette.accent} stopOpacity="0.55" />
            <stop offset="100%" stopColor={palette.accent} stopOpacity="0.0" />
          </linearGradient>
          <radialGradient id={`node-${uid}`} cx="0.35" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {rows.map((row, rowIdx) => {
          const cy = rowIdx * rowH + nodeR + 6;
          return (
            <g key={rowIdx}>
              {/* Backbone line */}
              <line
                x1={padX}
                y1={cy}
                x2={padX + (row.length - 1) * gap}
                y2={cy}
                stroke={`url(#bond-${uid})`}
                strokeWidth="1.6"
              />

              {row.map((aa, i) => {
                const cx = padX + i * gap;
                const delay = (rowIdx * perRow + i) * 0.08;
                return (
                  <g key={`${rowIdx}-${i}`}>
                    {/* Node */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={nodeR}
                      fill={palette.capsuleDeep}
                      style={{
                        animation: `peptide-node-breathe 3.6s ease-in-out ${delay}s infinite`,
                        transformOrigin: `${cx}px ${cy}px`,
                      }}
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={nodeR}
                      fill={`url(#node-${uid})`}
                    />
                    {/* Letter */}
                    <text
                      x={cx}
                      y={cy + (compact ? 4 : 5)}
                      textAnchor="middle"
                      fontFamily="ui-monospace, SFMono-Regular, Menlo"
                      fontSize={compact ? 11 : 13}
                      fontWeight="700"
                      fill="white"
                    >
                      {aa.letter}
                    </text>
                    {/* Code below */}
                    {!compact && (
                      <text
                        x={cx}
                        y={cy + nodeR + 12}
                        textAnchor="middle"
                        fontFamily="ui-monospace, SFMono-Regular, Menlo"
                        fontSize="9"
                        fill="oklch(0.45 0.015 250)"
                        letterSpacing="0.08em"
                      >
                        {aa.code}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
