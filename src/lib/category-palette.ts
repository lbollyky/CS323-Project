/**
 * Single source of truth for the per-category color treatment used across
 * goal tiles, product illustrations, mechanism diagrams, and chips. Each
 * category lives on a hue, with consistent lightness/chroma steps so we
 * never have to hand-tune individual gradient stops.
 */

export type CategoryKey = "sleep" | "cognition" | "recovery" | "longevity";

export interface CategoryPalette {
  key: CategoryKey;
  label: string;
  hue: number; // OKLCH hue, 0–360
  caption: string;
  /** Background gradient stops for tile / card surfaces. */
  bgFrom: string;
  bgTo: string;
  /** Capsule body — front half (pale) and back half (saturated). */
  capsulePale: string;
  capsuleDeep: string;
  /** Heavy tint for accents (chips, mechanism nodes, etc.). */
  accent: string;
  /** Soft tint for highlights and underlines. */
  soft: string;
}

const PALETTE: Record<CategoryKey, CategoryPalette> = {
  sleep: {
    key: "sleep",
    label: "Sleep",
    hue: 280,
    caption: "Wake at 3 a.m., low REM, jet lag",
    bgFrom: "oklch(0.96 0.025 280)",
    bgTo: "oklch(0.90 0.045 280)",
    capsulePale: "oklch(0.93 0.05 280)",
    capsuleDeep: "oklch(0.55 0.18 280)",
    accent: "oklch(0.48 0.18 280)",
    soft: "oklch(0.88 0.05 280)",
  },
  cognition: {
    key: "cognition",
    label: "Cognition",
    hue: 215,
    caption: "Brain fog, word-finding, focus drop",
    bgFrom: "oklch(0.96 0.025 215)",
    bgTo: "oklch(0.90 0.045 215)",
    capsulePale: "oklch(0.93 0.05 215)",
    capsuleDeep: "oklch(0.55 0.15 215)",
    accent: "oklch(0.48 0.15 215)",
    soft: "oklch(0.88 0.05 215)",
  },
  recovery: {
    key: "recovery",
    label: "Recovery",
    hue: 158,
    caption: "Post-surgery, tendon, gut",
    bgFrom: "oklch(0.95 0.03 158)",
    bgTo: "oklch(0.88 0.055 158)",
    capsulePale: "oklch(0.93 0.055 158)",
    capsuleDeep: "oklch(0.55 0.14 158)",
    accent: "oklch(0.46 0.14 158)",
    soft: "oklch(0.87 0.06 158)",
  },
  longevity: {
    key: "longevity",
    label: "Longevity",
    hue: 28,
    caption: "Aging well in midlife",
    bgFrom: "oklch(0.96 0.03 28)",
    bgTo: "oklch(0.89 0.055 28)",
    capsulePale: "oklch(0.93 0.055 28)",
    capsuleDeep: "oklch(0.60 0.16 28)",
    accent: "oklch(0.52 0.17 28)",
    soft: "oklch(0.88 0.06 28)",
  },
};

export const CATEGORY_ORDER: CategoryKey[] = [
  "sleep",
  "cognition",
  "recovery",
  "longevity",
];

export function getPalette(key: CategoryKey): CategoryPalette {
  return PALETTE[key];
}

/**
 * Map a product id to its dominant category, used to color the protocol
 * builder, mechanism diagrams, and product cards consistently.
 */
export function categoryForProduct(id: string): CategoryKey {
  switch (id) {
    case "epitalon":
      return "sleep";
    case "pinealon":
      return "cognition";
    case "restore-bpc":
      return "recovery";
    case "dual-stack":
      return "longevity";
    default:
      return "sleep";
  }
}

/**
 * The opening message a goal tile sends on click. Kept deliberately high-
 * level — the AI guide will follow up with a clarifying question (per the
 * system prompt's "ask 2-3 short follow-ups" rule), so a tile click should
 * open the category, not commit the user to a specific scenario.
 */
export const CATEGORY_PROMPT: Record<CategoryKey, string> = {
  sleep: "I want to work on my sleep.",
  cognition: "I want to work on my focus and mental clarity.",
  recovery: "I'm focused on recovery — tissue, joints, or gut.",
  longevity: "I want to age well. Help me figure out where to start.",
};
