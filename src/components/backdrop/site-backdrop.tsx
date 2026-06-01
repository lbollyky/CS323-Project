/**
 * The quieter, site-wide backdrop for /shop and /clinician. Just a soft
 * top horizon glow behind the nav — no texture, no focal artifact.
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
      <div className="absolute inset-x-0 top-0 h-[36vh] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,oklch(0.55_0.22_260_/_0.04),transparent_70%)]" />
    </div>
  );
}
