-- Migration: Expand catalog from peptide-focused to a one-stop wellness shop.
-- Run AFTER migration-002-categories.sql in your Supabase SQL Editor.
--
-- This migration ADDS new products. It does not delete or rename existing
-- ones, so existing carts / orders stay valid.

-- ─── Foundational ─────────────────────────────────────────────
insert into public.products (name, description, type, price, category, tag_line) values
  ('Daily Foundation Multivitamin', '26 essential micronutrients in their bioavailable forms — methylated B-vitamins, chelated minerals, and full-spectrum carotenoids.', 'OTC', 39.00, 'Foundational', 'Your nutritional baseline'),
  ('Magnesium Glycinate', '400 mg of highly absorbable chelated magnesium for muscle relaxation, sleep quality, and 300+ enzymatic processes.', 'OTC', 21.99, 'Foundational', 'The mineral 50% are short on'),
  ('Probiotic 50B CFU', 'Multi-strain probiotic with Lactobacillus and Bifidobacterium species for gut barrier integrity and immune balance.', 'OTC', 33.99, 'Foundational', 'Gut-immune axis support'),
  ('B-Complex (Methylated)', 'Pre-methylated B-vitamins (methylfolate, methylcobalamin, P5P) for energy metabolism and homocysteine balance.', 'OTC', 25.99, 'Foundational', 'Energy at the cellular level'),
  ('Zinc + Copper', 'Bisglycinate zinc paired with copper to maintain optimal mineral ratios for immunity and connective tissue.', 'OTC', 17.99, 'Foundational', 'Immune & skin support')
on conflict do nothing;

-- ─── Athletic Performance ─────────────────────────────────────
insert into public.products (name, description, type, price, category, tag_line) values
  ('Whey Protein Isolate', 'Cold-processed grass-fed whey isolate. 25 g protein, 5.5 g BCAAs, no artificial sweeteners.', 'OTC', 58.99, 'Athletic Performance', '25g protein per scoop'),
  ('Plant Protein Blend', 'Pea, rice, and pumpkin protein engineered for a complete amino-acid profile. 24 g protein, gut-friendly.', 'OTC', 53.99, 'Athletic Performance', 'Plant-based, complete amino'),
  ('Pre-Workout Pump Stack', 'L-citrulline, beta-alanine, betaine, and 200 mg caffeine. Clean energy, no jitter crash.', 'OTC', 43.99, 'Athletic Performance', 'Pump without the crash'),
  ('BCAAs (2:1:1)', 'Fermented L-leucine, L-isoleucine, and L-valine in the clinical 2:1:1 ratio for training in a fasted state.', 'OTC', 31.99, 'Athletic Performance', 'Fasted training fuel')
on conflict do nothing;

-- ─── Cognitive ────────────────────────────────────────────────
insert into public.products (name, description, type, price, category, tag_line) values
  ('Caffeine + L-Theanine', '100 mg caffeine paired with 200 mg L-theanine — the cleanest stim stack ever studied.', 'OTC', 23.99, 'Cognitive', 'Smooth, focused energy'),
  ('Bacopa Monnieri', 'Standardized 50% bacosides for memory consolidation and cognitive resilience under stress.', 'OTC', 25.99, 'Cognitive', 'Long-term memory support'),
  ('Rhodiola Rosea', 'Adaptogenic root for mental fatigue resistance, stamina, and serotonin balance under load.', 'OTC', 27.99, 'Cognitive', 'Adaptogen for the mind'),
  ('Modafinil', 'Wakefulness-promoting agent prescribed for narcolepsy, shift-work disorder, and cognitive performance optimization.', 'Rx', 129.00, 'Cognitive', 'Wakefulness on demand')
on conflict do nothing;

-- ─── Sleep & Recovery ─────────────────────────────────────────
insert into public.products (name, description, type, price, category, tag_line) values
  ('TB-500', 'Thymosin Beta-4 fragment. Whole-body recovery support — connective tissue, vasculature, inflammation.', 'Rx', 179.00, 'Sleep & Recovery', 'Whole-body recovery'),
  ('Melatonin (Low-Dose)', '300 mcg micro-dose melatonin — the dose actually shown to support circadian rhythm without grogginess.', 'OTC', 13.99, 'Sleep & Recovery', 'Circadian, not sedation')
on conflict do nothing;

-- ─── Longevity ────────────────────────────────────────────────
insert into public.products (name, description, type, price, category, tag_line) values
  ('NMN (NAD+ precursor)', 'Nicotinamide mononucleotide for cellular energy, sirtuin activation, and longevity pathways.', 'OTC', 78.99, 'Longevity', 'Cellular energy & repair'),
  ('MOTS-c', 'Mitochondrial-derived peptide for metabolic optimization and exercise mimetic effects.', 'Rx', 199.00, 'Longevity', 'Mitochondrial reset'),
  ('Spermidine', 'Wheat-germ-derived polyamine that activates autophagy — your cellular spring-cleaning program.', 'OTC', 53.99, 'Longevity', 'Autophagy on demand'),
  ('Quercetin', 'Bioactive flavonoid for cellular defense, vascular health, and senolytic stack support.', 'OTC', 28.99, 'Longevity', 'Senolytic stack support'),
  ('Rapamycin', 'mTOR inhibitor used in low-dose, intermittent protocols for healthspan extension. Care-team monitored.', 'Rx', 249.00, 'Longevity', 'mTOR modulation')
on conflict do nothing;

-- ─── Hormones ─────────────────────────────────────────────────
insert into public.products (name, description, type, price, category, tag_line) values
  ('CJC-1295 / Ipamorelin', 'Growth hormone secretagogue stack for lean mass, recovery, sleep depth, and skin elasticity.', 'Rx', 219.00, 'Hormones', 'GH support stack'),
  ('Tongkat Ali', 'Standardized eurycomanone extract shown to support free testosterone and reduce SHBG.', 'OTC', 33.99, 'Hormones', 'Natural test, no Rx')
on conflict do nothing;

-- ─── Weight Management ────────────────────────────────────────
insert into public.products (name, description, type, price, category, tag_line) values
  ('Green Tea EGCG', 'Concentrated catechins for thermogenesis and fatty acid oxidation. Decaffeinated.', 'OTC', 23.99, 'Weight Management', 'Thermogenic catechins'),
  ('L-Carnitine', 'Acetyl-L-carnitine for fatty acid transport into mitochondria. Pairs with cardio for metabolic flexibility.', 'OTC', 25.99, 'Weight Management', 'Fat transport, mental edge')
on conflict do nothing;

-- ─── Stress & Mood (Skin & Mood) ──────────────────────────────
insert into public.products (name, description, type, price, category, tag_line) values
  ('GHK-Cu', 'Copper peptide for skin renewal, collagen synthesis, and reversal of UV photo-damage.', 'Rx', 129.00, 'Stress & Mood', 'Skin renewal'),
  ('Tretinoin', 'Prescription retinoic acid — the gold standard for photo-aging, fine lines, and skin texture.', 'Rx', 89.00, 'Stress & Mood', 'The gold-standard retinoid'),
  ('Saffron Extract (Affron)', 'Patented saffron extract with serotonergic effects shown to support mood and emotional balance.', 'OTC', 31.99, 'Stress & Mood', 'Mood & emotional balance'),
  ('Collagen Peptides', 'Hydrolyzed type I + III bovine collagen for skin elasticity, joint comfort, and connective tissue.', 'OTC', 38.99, 'Stress & Mood', 'Skin & joint support'),
  ('Hyaluronic Acid', 'Low-molecular-weight HA for skin hydration from the inside out and joint lubrication.', 'OTC', 28.99, 'Stress & Mood', 'Hydration from within')
on conflict do nothing;
