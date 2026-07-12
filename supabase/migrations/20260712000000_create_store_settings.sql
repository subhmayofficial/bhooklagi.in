create table if not exists store_settings (
  id text primary key,
  delivery_charge integer not null default 49,
  free_delivery_threshold integer not null default 299,
  tax_percent integer not null default 5,
  upi_discount_enabled boolean not null default false,
  upi_discount_percent integer not null default 0
);

insert into store_settings (id, delivery_charge, free_delivery_threshold, tax_percent, upi_discount_enabled, upi_discount_percent) 
values ('default', 49, 299, 5, false, 0)
on conflict (id) do nothing;
