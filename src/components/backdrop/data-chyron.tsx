"use client";

import { CHYRON_FACTS } from "@/lib/backdrop-data";

/**
 * A single hairline row of monospace text scrolling slowly at the very
 * bottom of the viewport. Its job is not motion — it is content. Real
 * sequences, real molecular weights, real half-lives, picked one by one.
 * That's the signal AI-generated landing pages can't fake.
 *
 * Pauses on hover and on `prefers-reduced-motion` (becomes a static line).
 */
export function DataChyron() {
  const line = CHYRON_FACTS.join("    \u2022    ");
  return (
    <div
      role="presentation"
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-3 z-0 overflow-hidden"
    >
      <div className="relative mx-auto max-w-[1600px] px-5">
        <div
          className="overflow-hidden font-mono text-[10.5px] uppercase tracking-[0.18em]"
          style={{
            color: "oklch(0.16 0.015 250 / 0.32)",
            maskImage:
              "linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)",
          }}
        >
          <div className="flex w-max animate-chyron whitespace-nowrap">
            <span className="pr-12">{line}</span>
            <span className="pr-12" aria-hidden>
              {line}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
