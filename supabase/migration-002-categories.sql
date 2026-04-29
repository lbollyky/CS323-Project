-- Migration: Add category and tag_line columns to products, expand catalog
-- Run AFTER schema.sql in your Supabase SQL Editor

alter table public.products add column if not exists category text not null default 'General';
alter table public.products add column if not exists tag_line text not null default '';

-- Update existing products with categories
update public.products set category = 'Foundational', tag_line = 'Strength & cognition support' where name = 'Creatine Monohydrate';
update public.products set category = 'Longevity', tag_line = 'Cellular energy & repair' where name = 'NAD+ Precursor (NMN)';
update public.products set category = 'Foundational', tag_line = 'Heart & brain health' where name = 'Omega-3 Fish Oil';
update public.products set category = 'Sleep & Recovery', tag_line = 'Deep sleep & neural repair' where name = 'Magnesium L-Threonate';
update public.products set category = 'Foundational', tag_line = 'Bone & immune support' where name = 'Vitamin D3 + K2';
update public.products set category = 'Stress & Mood', tag_line = 'Adaptogenic stress support' where name = 'Ashwagandha KSM-66';
update public.products set category = 'Weight Management', tag_line = 'GLP-1 receptor agonist' where name = 'Semaglutide';
update public.products set category = 'Hormones', tag_line = 'Hormone replacement therapy' where name = 'Testosterone Cypionate';

-- Athletic Performance
insert into public.products (name, description, type, price, category, tag_line) values
  ('Beta-Alanine', 'Buffers lactic acid for sustained high-intensity output. Clinically dosed at 3.2g.', 'OTC', 22.99, 'Athletic Performance', 'Endurance & power output'),
  ('Citrulline Malate', 'Enhances nitric oxide production for improved blood flow, pump, and exercise capacity.', 'OTC', 27.99, 'Athletic Performance', 'Blood flow & performance'),
  ('HMB (β-Hydroxy β-Methylbutyrate)', 'Reduces muscle protein breakdown during intense training and caloric deficits.', 'OTC', 34.99, 'Athletic Performance', 'Muscle preservation'),
  ('Electrolyte Complex', 'Pharmaceutical-grade sodium, potassium, and magnesium for optimal hydration.', 'OTC', 18.99, 'Athletic Performance', 'Hydration & cramping'),
  ('Tart Cherry Extract', 'Concentrated anthocyanins to reduce exercise-induced inflammation and accelerate recovery.', 'OTC', 24.99, 'Athletic Performance', 'Recovery & inflammation');

-- Cognitive Performance
insert into public.products (name, description, type, price, category, tag_line) values
  ('Lion''s Mane Extract', 'Standardized to hericenones and erinacines for nerve growth factor support.', 'OTC', 32.99, 'Cognitive', 'Focus & neuroplasticity'),
  ('Alpha-GPC', 'Bioavailable choline source for acetylcholine synthesis and mental clarity.', 'OTC', 29.99, 'Cognitive', 'Memory & mental clarity'),
  ('L-Theanine', 'Amino acid from green tea that promotes calm focus without sedation.', 'OTC', 16.99, 'Cognitive', 'Calm focus'),
  ('Phosphatidylserine', 'Phospholipid critical for cell membrane integrity and cognitive processing speed.', 'OTC', 36.99, 'Cognitive', 'Processing speed');

-- Sleep & Recovery
insert into public.products (name, description, type, price, category, tag_line) values
  ('Apigenin', 'Chamomile-derived flavonoid that supports GABA receptor activity for natural sleep onset.', 'OTC', 19.99, 'Sleep & Recovery', 'Natural sleep support'),
  ('Glycine', 'Inhibitory amino acid that lowers core body temperature and improves sleep architecture.', 'OTC', 14.99, 'Sleep & Recovery', 'Sleep quality'),
  ('BPC-157', 'Body Protection Compound peptide for accelerated tissue repair and gut healing.', 'Rx', 149.99, 'Sleep & Recovery', 'Tissue & gut repair');

-- Longevity
insert into public.products (name, description, type, price, category, tag_line) values
  ('Resveratrol', 'Polyphenol activator of sirtuins for cellular defense and metabolic health.', 'OTC', 39.99, 'Longevity', 'Sirtuin activation'),
  ('CoQ10 (Ubiquinol)', 'Reduced form of CoQ10 for mitochondrial energy production and cardiovascular support.', 'OTC', 44.99, 'Longevity', 'Mitochondrial support'),
  ('Fisetin', 'Senolytic flavonoid that targets damaged senescent cells to support healthy aging.', 'OTC', 34.99, 'Longevity', 'Senolytic support');

-- Hormones
insert into public.products (name, description, type, price, category, tag_line) values
  ('Enclomiphene', 'Selective estrogen receptor modulator for endogenous testosterone optimization.', 'Rx', 129.99, 'Hormones', 'Natural testosterone support'),
  ('DHEA (Micronized)', 'Precursor hormone for testosterone and estrogen synthesis. Pharmaceutical grade.', 'OTC', 22.99, 'Hormones', 'Hormone precursor'),
  ('Pregnenolone', 'Master precursor hormone supporting cognition, mood, and downstream hormone production.', 'OTC', 24.99, 'Hormones', 'Cognitive & hormonal support');

-- Weight Management
insert into public.products (name, description, type, price, category, tag_line) values
  ('Berberine HCl', 'Plant alkaloid that activates AMPK for glucose metabolism and body composition support.', 'OTC', 29.99, 'Weight Management', 'Glucose & metabolism'),
  ('Tirzepatide', 'Dual GIP/GLP-1 receptor agonist for advanced weight management. Requires physician approval.', 'Rx', 399.99, 'Weight Management', 'Dual-action weight loss');

-- Indexes
create index if not exists idx_products_category on public.products(category);
