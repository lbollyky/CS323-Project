import { LatticeField } from "@/components/backdrop/lattice-field";

/**
 * The quieter, site-wide echo of the home backdrop. Same lattice texture,
 * no cursor warp, no focal artifact, no chyron — those belong to home.
 *
 * Mount as a fixed, full-viewport layer behind the page content. See
 * `app/page.tsx` for the canonical `relative + z-10 over fixed z-0`
 * wrapping pattern.
 */
export function SiteBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <LatticeField interactive={false} opacity={0.55} />
      {/* Soft horizon glow at very top, behind the nav. */}
      <div className="absolute inset-x-0 top-0 h-[36vh] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,oklch(0.55_0.22_260_/_0.04),transparent_70%)]" />
    </div>
  );
}
