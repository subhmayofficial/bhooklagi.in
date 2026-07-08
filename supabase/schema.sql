-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,          -- E.164-ish without '+', e.g. 919999999999
  name text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz not null default now()
);

-- All access to this table goes through the server using the service-role key
-- (see src/lib/supabase/admin.ts), so RLS stays on with no public policies.
alter table public.customers enable row level security;
