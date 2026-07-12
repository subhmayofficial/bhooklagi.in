create table if not exists public.freebies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  emoji text not null default '🎁',
  min_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.freebies enable row level security;
create policy "Public can read active freebies" on public.freebies
  for select using (is_active = true);
