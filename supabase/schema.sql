-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,          -- E.164-ish without '+', e.g. 919999999999
  name text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz not null default now()
);

alter table public.customers add column if not exists wallet_balance integer not null default 0;

-- All access to this table goes through the server using the service-role key
-- (see src/lib/supabase/admin.ts), so RLS stays on with no public policies.
alter table public.customers enable row level security;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers(id),   -- null for guest checkout
  items jsonb not null,                                -- [{itemId, name, unitPrice, qty, emoji}]
  delivery_name text not null,
  delivery_phone text not null,
  delivery_address text not null,
  delivery_landmark text,
  delivery_lat double precision,
  delivery_lng double precision,
  delivery_accuracy_m double precision,
  delivery_location_source text,
  delivery_location_captured_at timestamptz,
  payment_mode text not null check (payment_mode in ('cod', 'online', 'wallet')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  subtotal integer not null,
  delivery_fee integer not null,
  gst integer not null,
  wallet_used integer not null default 0,
  grand_total integer not null,
  status text not null default 'placed' check (status in ('placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  food_rating smallint check (food_rating between 1 and 5),
  delivery_rating smallint check (delivery_rating between 1 and 5),
  rating_comment text,
  rated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_delivery_location_idx on public.orders(delivery_lat, delivery_lng) where delivery_lat is not null and delivery_lng is not null;

alter table public.orders enable row level security;

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  order_id uuid references public.orders(id),
  type text not null check (type in ('credit', 'debit')),
  amount integer not null,
  balance_after integer not null,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists wallet_transactions_customer_id_idx on public.wallet_transactions(customer_id);

alter table public.wallet_transactions enable row level security;

create table if not exists public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text,                          -- Home, Work, etc.
  address text not null,
  landmark text,
  lat double precision,
  lng double precision,
  accuracy_m double precision,
  location_source text,
  location_captured_at timestamptz,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists saved_addresses_customer_id_idx on public.saved_addresses(customer_id);

alter table public.saved_addresses enable row level security;

-- Status timeline for each order (one row per status change).
create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_id_idx on public.order_events(order_id);

alter table public.order_events enable row level security;
