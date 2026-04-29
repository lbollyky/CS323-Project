-- Medicine.com MVP Database Schema
-- Run this in your Supabase SQL Editor to set up all tables.

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Custom ENUM types
create type product_type as enum ('OTC', 'Rx');
create type order_status as enum ('pending_rx', 'approved', 'shipped');

-- ============================================================
-- Users table
-- Extends Supabase Auth; stores profile data and intake results
-- ============================================================
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null unique,
  created_at  timestamptz not null default now(),
  goal_profile jsonb
);

alter table public.users enable row level security;

create policy "Users can read own row"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own row"
  on public.users for update
  using (auth.uid() = id);

-- ============================================================
-- Products table
-- Catalog of OTC and Rx compounds
-- ============================================================
create table public.products (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text not null default '',
  type        product_type not null,
  price       numeric(10,2) not null check (price >= 0),
  image_url   text,
  created_at  timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Products are publicly readable"
  on public.products for select
  using (true);

-- ============================================================
-- Orders table
-- Tracks checkout & Rx approval state
-- ============================================================
create table public.orders (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  status        order_status not null default 'pending_rx',
  total_amount  numeric(10,2) not null default 0 check (total_amount >= 0),
  created_at    timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Users can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- Order Items junction table
-- Links products to an order with quantity and snapshot price
-- ============================================================
create table public.order_items (
  id                 uuid primary key default uuid_generate_v4(),
  order_id           uuid not null references public.orders(id) on delete cascade,
  product_id         uuid not null references public.products(id),
  quantity           int not null default 1 check (quantity > 0),
  price_at_purchase  numeric(10,2) not null check (price_at_purchase >= 0)
);

alter table public.order_items enable row level security;

create policy "Users can read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "Users can insert own order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

-- ============================================================
-- Daily Logs table
-- User-entered daily tracking data for the dashboard
-- ============================================================
create table public.daily_logs (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  date            date not null default current_date,
  products_taken  text[] not null default '{}',
  weight          numeric(5,1),
  energy_level    int not null check (energy_level between 1 and 10),
  side_effects    text,
  notes           text,
  created_at      timestamptz not null default now(),

  unique (user_id, date)
);

alter table public.daily_logs enable row level security;

create policy "Users can read own logs"
  on public.daily_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own logs"
  on public.daily_logs for update
  using (auth.uid() = user_id);

-- ============================================================
-- Seed data: starter product catalog
-- ============================================================
insert into public.products (name, description, type, price, image_url) values
  ('Creatine Monohydrate',   'Supports muscle strength and cognitive performance.',                   'OTC', 29.99, null),
  ('NAD+ Precursor (NMN)',   'Nicotinamide mononucleotide for cellular energy and longevity support.','OTC', 49.99, null),
  ('Omega-3 Fish Oil',       'High-potency EPA/DHA for cardiovascular and brain health.',            'OTC', 24.99, null),
  ('Magnesium L-Threonate',  'Bioavailable magnesium for sleep quality and neural function.',        'OTC', 34.99, null),
  ('Vitamin D3 + K2',        'Synergistic combo for bone density and immune support.',               'OTC', 19.99, null),
  ('Ashwagandha KSM-66',     'Adaptogen for stress resilience and hormonal balance.',                'OTC', 27.99, null),
  ('Semaglutide',            'GLP-1 receptor agonist for weight management. Requires Rx approval.',  'Rx',  299.99, null),
  ('Testosterone Cypionate', 'Hormone replacement therapy for clinically low testosterone.',         'Rx',  189.99, null);

-- Indexes for common query patterns
create index idx_orders_user_id on public.orders(user_id);
create index idx_daily_logs_user_date on public.daily_logs(user_id, date);
create index idx_order_items_order_id on public.order_items(order_id);
