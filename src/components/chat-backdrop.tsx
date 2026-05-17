"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle, on-brand background for the chat surface.
 *
 *   1. A faded dot grid that fades toward the edges (radial mask).
 *   2. A pointer-tracking spotlight — a very soft glow that follows the
 *      cursor. Reads as "the surface is alive" without screaming for
 *      attention.
 *   3. A slow-breathing peptide-chain SVG anchored bottom-right — a small
 *      design touch that nods to the product without ever being loud.
 *
 * Everything sits at low opacity. The site stays sleek and medical;
 * these are texture, not decoration.
 */
export function ChatBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "50vw");
    el.style.setProperty("--my", "32vh");

    let raf = 0;
    function handle(e: PointerEvent) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!el) return;
        el.style.setProperty("--mx", `${e.clientX}px`);
        el.style.setProperty("--my", `${e.clientY}px`);
      });
    }
    window.addEventListener("pointermove", handle, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handle);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Pointer-tracking spotlight — the interactive bit */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(560px circle at var(--mx, 50vw) var(--my, 32vh), oklch(0.55 0.22 260 / 0.07), transparent 60%)",
          transition: "background-position 120ms linear",
        }}
      />

      {/* Faded dot grid, fades toward edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, oklch(0.16 0.015 250 / 0.10) 1px, transparent 0)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 38%, black 35%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 50% 38%, black 35%, transparent 85%)",
        }}
      />

      {/* Soft horizon glow at very top, behind the nav */}
      <div className="absolute inset-x-0 top-0 h-[36vh] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,oklch(0.55_0.22_260_/_0.05),transparent_70%)]" />

      {/* Slow-breathing peptide chain motif, bottom-right */}
      <PeptideMotif />
    </div>
  );
}

function PeptideMotif() {
  return (
    <svg
      className="absolute bottom-[14vh] right-[4vw] hidden h-[180px] w-[280px] opacity-[0.22] sm:block"
      viewBox="0 0 280 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pep-line" x1="0" y1="0" x2="1" y2="0">
          <stop
            offset="0%"
            stopColor="oklch(0.55 0.22 260)"
            stopOpacity="0"
          />
          <stop
            offset="50%"
            stopColor="oklch(0.55 0.22 260)"
            stopOpacity="0.6"
          />
          <stop
            offset="100%"
            stopColor="oklch(0.55 0.22 260)"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      <g className="animate-peptide-drift">
        <path
          d="M10 120 Q 60 60, 110 110 T 210 90 T 270 130"
          stroke="url(#pep-line)"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Nodes (amino acids) */}
        <circle cx="10" cy="120" r="3" fill="oklch(0.16 0.015 250 / 0.55)" />
        <circle cx="60" cy="78" r="3" fill="oklch(0.16 0.015 250 / 0.55)" />
        <circle cx="110" cy="110" r="3" fill="oklch(0.16 0.015 250 / 0.55)" />
        <circle cx="160" cy="92" r="3" fill="oklch(0.16 0.015 250 / 0.55)" />
        <circle cx="210" cy="90" r="3" fill="oklch(0.16 0.015 250 / 0.55)" />
        <circle cx="270" cy="130" r="3" fill="oklch(0.16 0.015 250 / 0.55)" />
        {/* Highlight ring on one node — the gentle "breath" */}
        <circle
          cx="160"
          cy="92"
          r="8"
          stroke="oklch(0.55 0.22 260 / 0.45)"
          strokeWidth="1"
          fill="none"
          className="animate-peptide-pulse"
        />
      </g>
    </svg>
  );
}
