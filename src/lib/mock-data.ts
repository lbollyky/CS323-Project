import type { Product } from "@/types/database";

/**
 * Fallback product catalog used when Supabase is unreachable / unconfigured.
 * Mirrors the shape of `public.products` so pages can render normally.
 *
 * Coverage spans the full modern wellness store: foundational vitamins,
 * sports nutrition (powders + capsules), nootropics, sleep, longevity,
 * hormones, weight management, and skin/mood — including Rx peptides
 * and GLP-1s.
 */
export const MOCK_PRODUCTS: Product[] = [
  // ──────────────────────────────────────────────────────────────
  // FOUNDATIONAL — daily baseline
  // ──────────────────────────────────────────────────────────────
  {
    id: "mock-multi",
    name: "Daily Foundation Multivitamin",
    description:
      "26 essential micronutrients in their bioavailable forms — methylated B-vitamins, chelated minerals, and full-spectrum carotenoids.",
    type: "OTC",
    price: 39,
    image_url: null,
    category: "Foundational",
    tag_line: "Your nutritional baseline.",
  },
  {
    id: "mock-omega3",
    name: "Omega-3 Triglyceride",
    description:
      "Pharmaceutical-grade EPA/DHA in re-esterified triglyceride form for cardiovascular and cognitive support. 2g per serving.",
    type: "OTC",
    price: 39,
    image_url: null,
    category: "Foundational",
    tag_line: "Heart, brain, joints — daily.",
  },
  {
    id: "mock-vitd",
    name: "Vitamin D3 + K2",
    description:
      "5,000 IU cholecalciferol with MK-7 menaquinone for bone, immune, and arterial health.",
    type: "OTC",
    price: 24,
    image_url: null,
    category: "Foundational",
    tag_line: "Bone & immune support.",
  },
  {
    id: "mock-mag-gly",
    name: "Magnesium Glycinate",
    description:
      "400 mg of highly absorbable chelated magnesium for muscle relaxation, sleep quality, and 300+ enzymatic processes.",
    type: "OTC",
    price: 22,
    image_url: null,
    category: "Foundational",
    tag_line: "The mineral 50% are short on.",
  },
  {
    id: "mock-probiotic",
    name: "Probiotic 50B CFU",
    description:
      "Multi-strain probiotic with Lactobacillus and Bifidobacterium species for gut barrier integrity and immune balance.",
    type: "OTC",
    price: 34,
    image_url: null,
    category: "Foundational",
    tag_line: "Gut-immune axis support.",
  },
  {
    id: "mock-bcomplex",
    name: "B-Complex (Methylated)",
    description:
      "Pre-methylated B-vitamins (methylfolate, methylcobalamin, P5P) for energy metabolism and homocysteine balance.",
    type: "OTC",
    price: 26,
    image_url: null,
    category: "Foundational",
    tag_line: "Energy at the cellular level.",
  },
  {
    id: "mock-zinc",
    name: "Zinc + Copper",
    description:
      "Bisglycinate zinc paired with copper to maintain optimal mineral ratios for immunity and connective tissue.",
    type: "OTC",
    price: 18,
    image_url: null,
    category: "Foundational",
    tag_line: "Immune & skin support.",
  },

  // ──────────────────────────────────────────────────────────────
  // ATHLETIC PERFORMANCE — sports nutrition & training
  // ──────────────────────────────────────────────────────────────
  {
    id: "mock-creatine",
    name: "Creatine Monohydrate",
    description:
      "5 g micronized creatine for ATP regeneration, strength, lean mass, and cognition. The most-studied supplement on earth.",
    type: "OTC",
    price: 29,
    image_url: null,
    category: "Athletic Performance",
    tag_line: "The original ergogenic.",
  },
  {
    id: "mock-whey",
    name: "Whey Protein Isolate",
    description:
      "Cold-processed grass-fed whey isolate. 25 g protein, 5.5 g BCAAs, no artificial sweeteners. Vanilla or chocolate.",
    type: "OTC",
    price: 59,
    image_url: null,
    category: "Athletic Performance",
    tag_line: "25g protein per scoop.",
  },
  {
    id: "mock-plant-protein",
    name: "Plant Protein Blend",
    description:
      "Pea, rice, and pumpkin protein engineered for a complete amino-acid profile. 24 g protein, gut-friendly.",
    type: "OTC",
    price: 54,
    image_url: null,
    category: "Athletic Performance",
    tag_line: "Plant-based, complete amino.",
  },
  {
    id: "mock-preworkout",
    name: "Pre-Workout Pump Stack",
    description:
      "L-citrulline, beta-alanine, betaine, and 200 mg caffeine. Clean energy, no jitter crash.",
    type: "OTC",
    price: 44,
    image_url: null,
    category: "Athletic Performance",
    tag_line: "Pump without the crash.",
  },
  {
    id: "mock-bcaa",
    name: "BCAAs (2:1:1)",
    description:
      "Fermented L-leucine, L-isoleucine, and L-valine in the clinical 2:1:1 ratio for training in a fasted state.",
    type: "OTC",
    price: 32,
    image_url: null,
    category: "Athletic Performance",
    tag_line: "Fasted training fuel.",
  },
  {
    id: "mock-beta-alanine",
    name: "Beta-Alanine",
    description:
      "3.2 g of CarnoSyn beta-alanine to buffer lactic acid and extend high-intensity training capacity.",
    type: "OTC",
    price: 24,
    image_url: null,
    category: "Athletic Performance",
    tag_line: "Endurance & power output.",
  },
  {
    id: "mock-citrulline",
    name: "Citrulline Malate",
    description:
      "8 g pre-training boost for nitric oxide, blood flow, and muscle pump. Stack with creatine for synergy.",
    type: "OTC",
    price: 27,
    image_url: null,
    category: "Athletic Performance",
    tag_line: "Nitric oxide & blood flow.",
  },
  {
    id: "mock-electrolyte",
    name: "Electrolyte Complex",
    description:
      "Pharmaceutical-grade sodium, potassium, magnesium, and chloride for hydration without sugar bombs.",
    type: "OTC",
    price: 19,
    image_url: null,
    category: "Athletic Performance",
    tag_line: "Hydration, no sugar.",
  },

  // ──────────────────────────────────────────────────────────────
  // COGNITIVE — focus, memory, neuroprotection
  // ──────────────────────────────────────────────────────────────
  {
    id: "mock-lions",
    name: "Lion's Mane Extract",
    description:
      "Standardized hericenones and erinacines for nerve growth factor support, memory, and neuroplasticity.",
    type: "OTC",
    price: 33,
    image_url: null,
    category: "Cognitive",
    tag_line: "Focus & neuroplasticity.",
  },
  {
    id: "mock-alpha",
    name: "Alpha-GPC",
    description:
      "Bioavailable choline donor for acetylcholine synthesis, mental clarity, and learning.",
    type: "OTC",
    price: 29,
    image_url: null,
    category: "Cognitive",
    tag_line: "Memory & clarity.",
  },
  {
    id: "mock-theanine",
    name: "L-Theanine",
    description:
      "200 mg of green-tea-derived L-theanine for alpha-wave calm focus without sedation.",
    type: "OTC",
    price: 17,
    image_url: null,
    category: "Cognitive",
    tag_line: "Calm focus.",
  },
  {
    id: "mock-caf-theanine",
    name: "Caffeine + L-Theanine",
    description:
      "100 mg caffeine paired with 200 mg L-theanine — the cleanest stim stack ever studied.",
    type: "OTC",
    price: 24,
    image_url: null,
    category: "Cognitive",
    tag_line: "Smooth, focused energy.",
  },
  {
    id: "mock-bacopa",
    name: "Bacopa Monnieri",
    description:
      "Standardized 50% bacosides for memory consolidation and cognitive resilience under stress.",
    type: "OTC",
    price: 26,
    image_url: null,
    category: "Cognitive",
    tag_line: "Long-term memory support.",
  },
  {
    id: "mock-rhodiola",
    name: "Rhodiola Rosea",
    description:
      "Adaptogenic root for mental fatigue resistance, stamina, and serotonin balance under load.",
    type: "OTC",
    price: 28,
    image_url: null,
    category: "Cognitive",
    tag_line: "Adaptogen for the mind.",
  },
  {
    id: "mock-modafinil",
    name: "Modafinil",
    description:
      "Wakefulness-promoting agent prescribed for narcolepsy, shift-work disorder, and cognitive performance optimization.",
    type: "Rx",
    price: 129,
    image_url: null,
    category: "Cognitive",
    tag_line: "Wakefulness on demand.",
  },

  // ──────────────────────────────────────────────────────────────
  // SLEEP & RECOVERY — repair while you sleep
  // ──────────────────────────────────────────────────────────────
  {
    id: "mock-bpc157",
    name: "BPC-157",
    description:
      "Body Protection Compound peptide. Accelerates tissue repair, gut healing, and joint recovery.",
    type: "Rx",
    price: 149,
    image_url: null,
    category: "Sleep & Recovery",
    tag_line: "Tissue & gut repair.",
  },
  {
    id: "mock-tb500",
    name: "TB-500",
    description:
      "Thymosin Beta-4 fragment. Whole-body recovery support — connective tissue, vasculature, inflammation.",
    type: "Rx",
    price: 179,
    image_url: null,
    category: "Sleep & Recovery",
    tag_line: "Whole-body recovery.",
  },
  {
    id: "mock-mag-thr",
    name: "Magnesium L-Threonate",
    description:
      "The only form of magnesium that crosses the blood-brain barrier. Deep sleep architecture and synaptic plasticity.",
    type: "OTC",
    price: 35,
    image_url: null,
    category: "Sleep & Recovery",
    tag_line: "Deep sleep & calm.",
  },
  {
    id: "mock-glycine",
    name: "Glycine",
    description:
      "3 g of inhibitory amino acid that lowers core body temperature and improves sleep onset and quality.",
    type: "OTC",
    price: 14,
    image_url: null,
    category: "Sleep & Recovery",
    tag_line: "Faster sleep onset.",
  },
  {
    id: "mock-melatonin",
    name: "Melatonin (Low-Dose)",
    description:
      "300 mcg micro-dose melatonin — the dose actually shown to support circadian rhythm without grogginess.",
    type: "OTC",
    price: 14,
    image_url: null,
    category: "Sleep & Recovery",
    tag_line: "Circadian, not sedation.",
  },
  {
    id: "mock-tart-cherry",
    name: "Tart Cherry Extract",
    description:
      "Concentrated anthocyanins to reduce exercise-induced inflammation and accelerate overnight recovery.",
    type: "OTC",
    price: 24,
    image_url: null,
    category: "Sleep & Recovery",
    tag_line: "Recovery & inflammation.",
  },

  // ──────────────────────────────────────────────────────────────
  // LONGEVITY — cellular & mitochondrial health
  // ──────────────────────────────────────────────────────────────
  {
    id: "mock-nmn",
    name: "NMN (NAD+ precursor)",
    description:
      "Nicotinamide mononucleotide for cellular energy, sirtuin activation, and longevity pathways.",
    type: "OTC",
    price: 79,
    image_url: null,
    category: "Longevity",
    tag_line: "Cellular energy & repair.",
  },
  {
    id: "mock-motsc",
    name: "MOTS-c",
    description:
      "Mitochondrial-derived peptide for metabolic optimization and exercise mimetic effects.",
    type: "Rx",
    price: 199,
    image_url: null,
    category: "Longevity",
    tag_line: "Mitochondrial reset.",
  },
  {
    id: "mock-coq10",
    name: "CoQ10 (Ubiquinol)",
    description:
      "Reduced-form CoQ10 for mitochondrial energy production and cardiovascular support.",
    type: "OTC",
    price: 44,
    image_url: null,
    category: "Longevity",
    tag_line: "Mitochondrial support.",
  },
  {
    id: "mock-resveratrol",
    name: "Resveratrol",
    description:
      "Trans-resveratrol polyphenol, sirtuin activator paired with piperine for absorption.",
    type: "OTC",
    price: 39,
    image_url: null,
    category: "Longevity",
    tag_line: "Sirtuin activation.",
  },
  {
    id: "mock-fisetin",
    name: "Fisetin",
    description:
      "Senolytic flavonoid that targets damaged senescent cells. Strawberry-derived, clinically dosed.",
    type: "OTC",
    price: 34,
    image_url: null,
    category: "Longevity",
    tag_line: "Senolytic support.",
  },
  {
    id: "mock-spermidine",
    name: "Spermidine",
    description:
      "Wheat-germ-derived polyamine that activates autophagy — your cellular spring-cleaning program.",
    type: "OTC",
    price: 54,
    image_url: null,
    category: "Longevity",
    tag_line: "Autophagy on demand.",
  },
  {
    id: "mock-rapamycin",
    name: "Rapamycin",
    description:
      "mTOR inhibitor used in low-dose, intermittent protocols for healthspan extension. Care-team monitored.",
    type: "Rx",
    price: 249,
    image_url: null,
    category: "Longevity",
    tag_line: "mTOR modulation.",
  },

  // ──────────────────────────────────────────────────────────────
  // HORMONES — endocrine optimization
  // ──────────────────────────────────────────────────────────────
  {
    id: "mock-encl",
    name: "Enclomiphene",
    description:
      "Selective estrogen receptor modulator for endogenous testosterone optimization without TRT shutdown.",
    type: "Rx",
    price: 129,
    image_url: null,
    category: "Hormones",
    tag_line: "Natural testosterone support.",
  },
  {
    id: "mock-cjc",
    name: "CJC-1295 / Ipamorelin",
    description:
      "Growth hormone secretagogue stack for lean mass, recovery, sleep depth, and skin elasticity.",
    type: "Rx",
    price: 219,
    image_url: null,
    category: "Hormones",
    tag_line: "GH support stack.",
  },
  {
    id: "mock-test",
    name: "Testosterone Cypionate",
    description:
      "Long-ester testosterone for full hormone replacement. Prescribed and monitored by our endocrine care team.",
    type: "Rx",
    price: 149,
    image_url: null,
    category: "Hormones",
    tag_line: "Full TRT — monitored.",
  },
  {
    id: "mock-dhea",
    name: "DHEA (Micronized)",
    description:
      "Pharmaceutical-grade precursor hormone for testosterone and estrogen synthesis, mood and libido.",
    type: "OTC",
    price: 22,
    image_url: null,
    category: "Hormones",
    tag_line: "Hormone precursor.",
  },
  {
    id: "mock-pregnenolone",
    name: "Pregnenolone",
    description:
      "Master neurosteroid precursor supporting cognition, mood, and downstream hormone production.",
    type: "OTC",
    price: 24,
    image_url: null,
    category: "Hormones",
    tag_line: "The master neurosteroid.",
  },
  {
    id: "mock-tongkat",
    name: "Tongkat Ali",
    description:
      "Standardized eurycomanone extract shown to support free testosterone and reduce SHBG.",
    type: "OTC",
    price: 34,
    image_url: null,
    category: "Hormones",
    tag_line: "Natural test, no Rx.",
  },

  // ──────────────────────────────────────────────────────────────
  // WEIGHT MANAGEMENT — GLP-1s + metabolic support
  // ──────────────────────────────────────────────────────────────
  {
    id: "mock-sema",
    name: "Semaglutide",
    description:
      "GLP-1 receptor agonist for appetite regulation, glucose control, and durable weight management.",
    type: "Rx",
    price: 299,
    image_url: null,
    category: "Weight Management",
    tag_line: "GLP-1 weight loss.",
  },
  {
    id: "mock-tirz",
    name: "Tirzepatide",
    description:
      "Dual GIP/GLP-1 agonist. Best-in-class weight management with care-team monitoring.",
    type: "Rx",
    price: 399,
    image_url: null,
    category: "Weight Management",
    tag_line: "Dual-action weight loss.",
  },
  {
    id: "mock-berberine",
    name: "Berberine HCl",
    description:
      "Plant alkaloid that activates AMPK — \u201cnature's GLP-1\u201d for glucose control and body composition.",
    type: "OTC",
    price: 29,
    image_url: null,
    category: "Weight Management",
    tag_line: "AMPK activator.",
  },
  {
    id: "mock-egcg",
    name: "Green Tea EGCG",
    description:
      "Concentrated catechins for thermogenesis and fatty acid oxidation. Decaffeinated.",
    type: "OTC",
    price: 24,
    image_url: null,
    category: "Weight Management",
    tag_line: "Thermogenic catechins.",
  },
  {
    id: "mock-carnitine",
    name: "L-Carnitine",
    description:
      "Acetyl-L-carnitine for fatty acid transport into mitochondria. Pairs with cardio for metabolic flexibility.",
    type: "OTC",
    price: 26,
    image_url: null,
    category: "Weight Management",
    tag_line: "Fat transport, mental edge.",
  },
  {
    id: "mock-hmb",
    name: "HMB",
    description:
      "β-Hydroxy β-Methylbutyrate to preserve lean mass during caloric deficits and intense training.",
    type: "OTC",
    price: 34,
    image_url: null,
    category: "Weight Management",
    tag_line: "Preserve muscle in a cut.",
  },

  // ──────────────────────────────────────────────────────────────
  // STRESS & MOOD / SKIN
  // ──────────────────────────────────────────────────────────────
  {
    id: "mock-ghk",
    name: "GHK-Cu",
    description:
      "Copper peptide for skin renewal, collagen synthesis, and reversal of UV photo-damage.",
    type: "Rx",
    price: 129,
    image_url: null,
    category: "Stress & Mood",
    tag_line: "Skin renewal.",
  },
  {
    id: "mock-tretinoin",
    name: "Tretinoin",
    description:
      "Prescription retinoic acid — the gold standard for photo-aging, fine lines, and skin texture.",
    type: "Rx",
    price: 89,
    image_url: null,
    category: "Stress & Mood",
    tag_line: "The gold-standard retinoid.",
  },
  {
    id: "mock-ashwagandha",
    name: "Ashwagandha KSM-66",
    description:
      "Patented full-spectrum extract clinically dosed at 600 mg for cortisol modulation and resilience.",
    type: "OTC",
    price: 24,
    image_url: null,
    category: "Stress & Mood",
    tag_line: "Cortisol & resilience.",
  },
  {
    id: "mock-saffron",
    name: "Saffron Extract (Affron)",
    description:
      "Patented saffron extract with serotonergic effects shown to support mood and emotional balance.",
    type: "OTC",
    price: 32,
    image_url: null,
    category: "Stress & Mood",
    tag_line: "Mood & emotional balance.",
  },
  {
    id: "mock-collagen",
    name: "Collagen Peptides",
    description:
      "Hydrolyzed type I + III bovine collagen for skin elasticity, joint comfort, and connective tissue.",
    type: "OTC",
    price: 39,
    image_url: null,
    category: "Stress & Mood",
    tag_line: "Skin & joint support.",
  },
  {
    id: "mock-ha",
    name: "Hyaluronic Acid",
    description:
      "Low-molecular-weight HA for skin hydration from the inside out and joint lubrication.",
    type: "OTC",
    price: 29,
    image_url: null,
    category: "Stress & Mood",
    tag_line: "Hydration from within.",
  },
  {
    id: "mock-apigenin",
    name: "Apigenin",
    description:
      "Chamomile flavonoid that supports GABA receptor activity for calm, focus, and natural sleep onset.",
    type: "OTC",
    price: 19,
    image_url: null,
    category: "Stress & Mood",
    tag_line: "Calm & glow.",
  },
];
