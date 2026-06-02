import type { Product } from "@/types/database";

export interface ProductFaq {
  q: string;
  a: string;
}

export interface ProtocolProduct extends Product {
  short_name: string;
  day_supply: number;
  active: string;
  mechanism: string;
  best_for: string[];
  compare_price?: number;
  bundle_of?: string[];
  how_to_take?: string;
  science?: string;
  faqs?: ProductFaq[];
  /** Extra imagery shown in the product detail modal gallery. */
  gallery?: string[];
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
    image_url: "/products/epitalon-v2.png",
    gallery: [
      "/products/epitalon-lifestyle.png",
      "/products/epitalon-science.png",
      "/products/epitalon-pill.png",
    ],
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
    how_to_take:
      "One capsule daily, taken at night with or without food. Many members cycle it — a common pattern is 20 days on, 10 days off — though continuous daily use is also well tolerated.",
    science:
      "epitalON is built on AEDG (Ala-Glu-Asp-Gly), one of the short peptide bioregulators characterized by Vladimir Khavinson over three decades of research. In cultured human cells it has been shown to reactivate telomerase, and in clinical work with older adults it helped restore the nighttime amplitude of melatonin — the signal that anchors the entire circadian system. The result members describe is deeper, more consolidated sleep and steadier day-to-day rhythm rather than sedation.",
    faqs: [
      {
        q: "Will it make me groggy in the morning?",
        a: "No. epitalON is not a sedative — it supports your own melatonin rhythm rather than forcing sleep, so it shouldn't leave a hangover. Most people report waking more rested.",
      },
      {
        q: "How long until I notice anything?",
        a: "Sleep quality often shifts within the first one to two weeks. The circadian and recovery benefits build over a full 20–30 day cycle.",
      },
      {
        q: "Can I take it with pinealON?",
        a: "Yes — that's the Dual-System Stack. epitalON runs at night, pinealON in the morning. They're designed to be paired.",
      },
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
    image_url: "/products/pinealon-v2.png",
    gallery: [
      "/products/pinealon-lifestyle.png",
      "/products/pinealon-science.png",
      "/products/pinealon-pill.png",
    ],
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
    how_to_take:
      "Two capsules daily, taken in the morning with food. It's non-stimulant, so it won't interfere with sleep, but most members prefer it earlier in the day to match their working hours.",
    science:
      "pinealON is built on EDR (Glu-Asp-Arg), a Khavinson tripeptide studied for its effects on the brain. Rather than stimulating like caffeine, it works upstream — supporting antioxidant gene expression, anti-apoptotic signaling, and neurotrophic pathways that protect neurons under sustained load. The experience members describe is less of a spike and more of a lifted fog: cleaner recall and sustained focus through long, demanding days.",
    faqs: [
      {
        q: "Is this a stimulant?",
        a: "No. pinealON contains no caffeine or stimulants. It supports the brain's own recovery and signaling pathways, so there's no crash and no effect on sleep.",
      },
      {
        q: "How is it different from a nootropic stack?",
        a: "Most nootropics push neurotransmitters for an acute effect. pinealON is a bioregulator — it works on the underlying gene-expression and protective pathways, so benefits accumulate over a cycle rather than lasting a few hours.",
      },
      {
        q: "When will I feel it?",
        a: "Some notice clearer focus within the first week; the fuller cognitive-recovery effect builds across a 30-day cycle.",
      },
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
    image_url: "/products/restore-bpc-v2.png",
    gallery: [
      "/products/restore-bpc-lifestyle.png",
      "/products/restore-bpc-science.png",
      "/products/restore-bpc-pill.png",
    ],
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
    how_to_take:
      "Two capsules daily, on an empty stomach or with a light meal. Commonly run in 4–8 week blocks around an injury, a heavy training phase, or a GI flare-up, then paused.",
    science:
      "Restore BPC is built on BPC-157, a stable fragment of a protective protein found naturally in gastric juice. It promotes repair by activating VEGFR2 and nitric-oxide signaling to support new blood-vessel growth, driving fibroblast proliferation for connective-tissue healing, and nudging immune cells toward a repair-oriented state. Because it's a gut-derived peptide, the oral route puts it where much of its protective signaling begins.",
    faqs: [
      {
        q: "Why oral instead of injection?",
        a: "BPC-157 is naturally a gastric peptide, so a large part of its protective activity originates in the GI tract. Our capsule is formulated for oral delivery — no needles, no reconstitution.",
      },
      {
        q: "Is it safe for athletes?",
        a: "BPC-157 is on the WADA prohibited list. If you're subject to anti-doping testing, do not use it. For everyone else, it's a well-tolerated daily capsule.",
      },
      {
        q: "How long should I run it?",
        a: "Most members use 4–8 week blocks tied to a specific recovery goal, then take a break. It can be repeated as needed.",
      },
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
    image_url: "/products/dual-stack.png",
    gallery: [
      "/products/dual-stack-duo.png",
      "/products/dual-stack-pharmacist.png",
    ],
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
    how_to_take:
      "Take pinealON (two capsules) in the morning with food and epitalON (one capsule) at night. The two run on opposite ends of the day by design — cognitive support while you work, circadian support while you sleep. A full 60-day supply covers two complete cycles.",
    science:
      "The Dual-System Stack pairs the two Khavinson bioregulators most members end up running together: AEDG (epitalON) for the circadian system and EDR (pinealON) for the cognitive system. Sleep and daytime clarity are tightly coupled — poor circadian recovery blunts focus, and cognitive overload degrades sleep — so addressing both at once tends to compound. It's the default 60-day protocol most people settle on after trying each compound alone.",
    faqs: [
      {
        q: "Why take both instead of one?",
        a: "Sleep and cognition reinforce each other. epitalON deepens overnight recovery while pinealON supports daytime focus, so running them together tends to produce a steadier result than either alone.",
      },
      {
        q: "How is the $200 savings calculated?",
        a: "Bought separately, two epitalON and two pinealON would be $596. The stack is $396 — a $200 saving for the same four bottles and a full 60-day protocol.",
      },
      {
        q: "Do I take them at the same time?",
        a: "No — pinealON in the morning, epitalON at night. They're designed for opposite ends of the day.",
      },
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
