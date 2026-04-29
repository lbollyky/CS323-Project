import {
  Dumbbell,
  Brain,
  Moon,
  Clock,
  Activity,
  Scale,
  Heart,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import type { ProductCategory } from "@/types/database";

interface CategoryMeta {
  label: string;
  slug: string;
  icon: LucideIcon;
  description: string;
  short: string;
  accent: string;
}

export const CATEGORIES: Record<ProductCategory, CategoryMeta> = {
  Foundational: {
    label: "Foundational",
    slug: "foundational",
    icon: Heart,
    description:
      "Multivitamins, omega-3, magnesium, probiotics — the daily basics done at a clinical standard.",
    short: "Daily baseline",
    accent: "from-sky-500/20 via-sky-400/10 to-blue-500/5",
  },
  "Athletic Performance": {
    label: "Performance",
    slug: "athletic-performance",
    icon: Dumbbell,
    description:
      "Protein, creatine, BCAAs, pre-workout, and electrolytes — fully transparent, third-party tested.",
    short: "Train harder",
    accent: "from-blue-500/25 via-indigo-400/10 to-violet-500/5",
  },
  Cognitive: {
    label: "Cognitive",
    slug: "cognitive",
    icon: Brain,
    description:
      "Nootropics, adaptogens, and prescription wakefulness aids for sharper, calmer focus.",
    short: "Focus on tap",
    accent: "from-violet-500/25 via-blue-400/10 to-cyan-500/5",
  },
  "Sleep & Recovery": {
    label: "Sleep & Recovery",
    slug: "sleep-recovery",
    icon: Moon,
    description:
      "From magnesium and melatonin to BPC-157 and TB-500 — repair while you sleep.",
    short: "Repair on autopilot",
    accent: "from-indigo-500/25 via-violet-400/10 to-fuchsia-500/5",
  },
  Longevity: {
    label: "Longevity",
    slug: "longevity",
    icon: Clock,
    description:
      "NMN, resveratrol, fisetin, spermidine, rapamycin — the science of aging well.",
    short: "Age in reverse",
    accent: "from-cyan-500/25 via-sky-400/10 to-blue-500/5",
  },
  Hormones: {
    label: "Hormones",
    slug: "hormones",
    icon: Activity,
    description:
      "TRT, GH support, and over-the-counter precursors — endocrine balance, monitored by clinicians.",
    short: "Restore balance",
    accent: "from-amber-500/25 via-orange-400/10 to-rose-500/5",
  },
  "Weight Management": {
    label: "Weight Loss",
    slug: "weight-management",
    icon: Scale,
    description:
      "GLP-1s, dual agonists, berberine, and metabolic adjuncts for body composition.",
    short: "Effortless cuts",
    accent: "from-rose-500/25 via-pink-400/10 to-fuchsia-500/5",
  },
  "Stress & Mood": {
    label: "Skin & Mood",
    slug: "stress-mood",
    icon: Leaf,
    description:
      "Tretinoin, GHK-Cu, ashwagandha, saffron and more — calmer mind, glowing skin.",
    short: "Calm & glow",
    accent: "from-emerald-500/25 via-teal-400/10 to-cyan-500/5",
  },
};

export const CATEGORY_LIST = Object.entries(CATEGORIES) as [
  ProductCategory,
  CategoryMeta,
][];

export function getCategoryBySlug(slug: string) {
  return CATEGORY_LIST.find(([, meta]) => meta.slug === slug);
}
