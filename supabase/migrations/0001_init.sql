-- Cafe Verde — initial schema
-- Paste this entire file into Supabase → SQL Editor → New query → Run.

-- =========================
-- menu_items
-- =========================
create table if not exists public.menu_items (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  price       numeric(10,3) not null check (price >= 0),
  category    text not null,
  image_url   text not null default '',
  available   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists menu_items_category_idx on public.menu_items (category);
create index if not exists menu_items_available_idx on public.menu_items (available);

-- =========================
-- orders
-- =========================
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  customer_name  text not null,
  phone          text not null,
  order_type     text not null check (order_type in ('pickup', 'delivery')),
  address        text,
  items          jsonb not null,
  subtotal       numeric(10,3) not null check (subtotal >= 0),
  delivery_fee   numeric(10,3) not null default 0 check (delivery_fee >= 0),
  total          numeric(10,3) not null check (total >= 0),
  notes          text,
  status         text not null default 'new' check (status in ('new','preparing','ready','delivered')),
  created_at     timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- =========================
-- Row Level Security
-- =========================
alter table public.menu_items enable row level security;
alter table public.orders     enable row level security;

-- Public can read available menu items
drop policy if exists "menu_items public read available" on public.menu_items;
create policy "menu_items public read available"
  on public.menu_items for select
  to anon, authenticated
  using (available = true);

-- Public can place orders (insert only)
drop policy if exists "orders public insert" on public.orders;
create policy "orders public insert"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- All other writes (menu CRUD, order updates/reads) go through the server
-- using the service role key, which bypasses RLS.
