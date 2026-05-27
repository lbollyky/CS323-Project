import { LatticeField } from "@/components/backdrop/lattice-field";
import { DataChyron } from "@/components/backdrop/data-chyron";

/**
 * The home-page backdrop. Two layers, each doing one job:
 *
 *   1. LatticeField — crystallographic dot lattice that warps radially
 *      near the cursor. Quiet at rest; reveals its structure on motion.
 *   2. DataChyron — a single hairline row of mono text at the very
 *      bottom, scrolling real peptide constants and sequences.
 *
 * Plus a soft horizon glow at the top to add depth behind the nav. The
 * focal molecular artifact has moved out of the backdrop and into the
 * goal-tile backbone rail (see `goal-tile-backbone.tsx`), where it now
 * carries real weight in the layout instead of sitting as a corner
 * watermark.
 */
export function ChatBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <LatticeField interactive opacity={0.75} />
        {/* Soft horizon glow behind the nav. */}
        <div className="absolute inset-x-0 top-0 h-[36vh] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,oklch(0.55_0.22_260_/_0.05),transparent_70%)]" />
      </div>
      <DataChyron />
    </>
  );
}
