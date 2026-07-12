-- Ensure push_subscriptions exists with customer_id for targeted notifications
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text unique not null,
  subscription jsonb not null,
  customer_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add customer_id if table already existed without it
alter table public.push_subscriptions
  add column if not exists customer_id uuid;

-- FK to customers (silently skip if already exists)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'push_subscriptions_customer_id_fkey'
  ) then
    alter table public.push_subscriptions
      add constraint push_subscriptions_customer_id_fkey
      foreign key (customer_id) references public.customers(id) on delete set null;
  end if;
end $$;

create index if not exists idx_push_subs_customer on public.push_subscriptions(customer_id);

alter table public.push_subscriptions enable row level security;
