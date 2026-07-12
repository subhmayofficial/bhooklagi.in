-- Create push_subscriptions table for Web Push subscribers
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text unique not null,
  subscription jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS (service role client bypasses RLS)
alter table public.push_subscriptions enable row level security;
