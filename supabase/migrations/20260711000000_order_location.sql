alter table public.orders
  add column if not exists delivery_lat double precision,
  add column if not exists delivery_lng double precision,
  add column if not exists delivery_accuracy_m double precision,
  add column if not exists delivery_location_source text,
  add column if not exists delivery_location_captured_at timestamptz;

create index if not exists orders_delivery_location_idx
  on public.orders(delivery_lat, delivery_lng)
  where delivery_lat is not null and delivery_lng is not null;

alter table public.saved_addresses
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists accuracy_m double precision,
  add column if not exists location_source text,
  add column if not exists location_captured_at timestamptz;
