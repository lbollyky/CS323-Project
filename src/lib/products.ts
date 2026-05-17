import type { Product } from "@/types/database";

export interface ProtocolProduct extends Product {
  short_name: string;
  day_supply: number;
  active: string;
  mechanism: string;
  best_for: string[];
  compare_price?: number;
  bundle_of?: string[];
}

export const PRODUCTS: ProtocolProduct[] = [
  {
    id: "epitalon",
    name: "epitalON",
    short_name: "epitalON",
    description:
      "A daily oral capsule built around the Khavinson tetrapeptide AEDG (Ala-Glu-Asp-Gly). Used to support circadian rhythm and long-range recovery.",
    type: "OTC",
    price: 149,
    image_url: null,
    category: "Sleep & Recovery",
    tag_line: "The circadian and long-range recovery capsule.",
    day_supply: 30,
    active: "3 mg AEDG · 30 capsules · 30-day supply",
    mechanism:
      "A four-amino-acid sequence shown to upregulate telomerase in cultured human cells and restore nighttime melatonin amplitude in elderly humans.",
    best_for: [
      "Disrupted sleep architecture",
      "Jet lag, shift work, perimenopause",
      "Longevity-curious operators in midlife",
    ],
  },
  {
    id: "pinealon",
    name: "pinealON",
    short_name: "pinealON",
    description:
      "A daily oral capsule built around the Khavinson tripeptide EDR (Glu-Asp-Arg). Built for cognitive recovery under sustained load.",
    type: "OTC",
    price: 149,
    image_url: null,
    category: "Cognitive",
    tag_line: "The brain and cognitive recovery capsule.",
    day_supply: 30,
    active: "1 mg EDR · 60 capsules · 30-day supply",
    mechanism:
      "A three-amino-acid bioregulator that supports antioxidant gene expression, anti-apoptotic signaling, and neurotrophic pathways.",
    best_for: [
      "Brain fog under sustained load",
      "Founders, surgeons, lawyers in heavy seasons",
      "Non-stimulant cognitive support",
    ],
  },
  {
    id: "restore-bpc",
    name: "Restore BPC",
    short_name: "Restore",
    description:
      "A daily oral capsule built around BPC-157 (stable gastric pentadecapeptide). Used for tissue repair, joint support, and GI comfort.",
    type: "OTC",
    price: 149,
    image_url: null,
    category: "Foundational",
    tag_line: "The body-protection compound. Now oral.",
    day_supply: 30,
    active: "500 mcg BPC-157 · 60 capsules · 30-day supply",
    mechanism:
      "Activates VEGFR2 and nitric oxide signaling, drives fibroblast proliferation, and modulates macrophage polarization toward repair.",
    best_for: [
      "Post-injury and post-surgery recovery",
      "Tendon, ligament, joint discomfort",
      "Chronic stress GI symptoms",
    ],
  },
  {
    id: "dual-stack",
    name: "Dual-System Stack",
    short_name: "Dual Stack",
    description:
      "Two bottles epitalON + two bottles pinealON. A 60-day supply of the protocol that pairs circadian and cognitive support.",
    type: "OTC",
    price: 396,
    compare_price: 596,
    image_url: null,
    category: "Longevity",
    tag_line: "Two systems. Sixty days. Save $200.",
    day_supply: 60,
    active: "2 × epitalON + 2 × pinealON",
    mechanism:
      "Pairs the circadian (AEDG) and cognitive (EDR) bioregulators in a 60-day protocol most operators default to after running each alone.",
    best_for: [
      "Operators with both sleep and cognitive complaints",
      "Longevity-curious midlife users",
      "The default starting protocol most members choose",
    ],
    bundle_of: ["epitalon", "epitalon", "pinealon", "pinealon"],
  },
];

export function getProduct(id: string): ProtocolProduct | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProductsByIds(ids: string[]): ProtocolProduct[] {
  const out: ProtocolProduct[] = [];
  for (const id of ids) {
    const p = getProduct(id);
    if (p) out.push(p);
  }
  return out;
}
