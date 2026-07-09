create extension if not exists "pgcrypto";

create table if not exists public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text,
  address text not null,
  landmark text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists saved_addresses_customer_id_idx on public.saved_addresses(customer_id);
alter table public.saved_addresses enable row level security;

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_id_idx on public.order_events(order_id);
alter table public.order_events enable row level security;
