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
  payment_mode text not null check (payment_mode in ('cod', 'online', 'wallet')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  subtotal integer not null,
  delivery_fee integer not null,
  gst integer not null,
  wallet_used integer not null default 0,
  grand_total integer not null,
  status text not null default 'placed' check (status in ('placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_customer_id_idx on public.orders(customer_id);

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
