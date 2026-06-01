import { DataChyron } from "@/components/backdrop/data-chyron";

/**
 * The home-page backdrop. A soft top horizon glow gives the nav some
 * depth, and a single hairline mono chyron of real peptide constants
 * scrolls slowly at the very bottom of the viewport. The focal
 * molecular artifact lives in the goal-tile backbone rail (see
 * `goal-tile-backbone.tsx`), not back here.
 */
export function ChatBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {/* Soft horizon glow behind the nav. */}
        <div className="absolute inset-x-0 top-0 h-[36vh] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,oklch(0.55_0.22_260_/_0.05),transparent_70%)]" />
      </div>
      <DataChyron />
    </>
  );
}
