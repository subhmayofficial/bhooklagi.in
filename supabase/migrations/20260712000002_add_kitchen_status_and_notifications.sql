-- Alter store_settings to support kitchen open status
alter table public.store_settings add column if not exists kitchen_open boolean not null default true;

-- Create kitchen_notifications table
create table if not exists public.kitchen_notifications (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
