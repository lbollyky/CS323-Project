import { cn } from "@/lib/utils";

/**
 * The Pepwell wordmark — "pep — well" with a long center bar, drawn as a
 * vector so it stays crisp at any size and renders as black on the light
 * (white) chrome via `currentColor`. Single source of truth for the logo
 * across the nav, auth screens, and anywhere else it appears.
 *
 * Sized by height; pass `className` to resize (keep `w-auto`).
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 60"
      role="img"
      aria-label="Pepwell"
      className={cn("h-5 w-auto text-foreground", className)}
      fill="none"
    >
      <text
        x="0"
        y="44"
        textLength="78"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        fontSize="40"
        fontWeight="400"
        fill="currentColor"
      >
        pep
      </text>
      <rect x="92" y="29.5" width="56" height="2.4" rx="1.2" fill="currentColor" />
      <text
        x="162"
        y="44"
        textLength="78"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        fontSize="40"
        fontWeight="400"
        fill="currentColor"
      >
        well
      </text>
    </svg>
  );
}
