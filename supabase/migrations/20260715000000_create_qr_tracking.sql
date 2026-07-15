create table if not exists public.qr_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  destination_url text not null,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists qr_campaigns_slug_idx on public.qr_campaigns(slug);
create index if not exists qr_campaigns_created_at_idx on public.qr_campaigns(created_at desc);

alter table public.qr_campaigns enable row level security;

create table if not exists public.qr_scans (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.qr_campaigns(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  referrer text,
  device_type text,
  browser text,
  os text,
  country text,
  city text
);

create index if not exists qr_scans_campaign_id_idx on public.qr_scans(campaign_id);
create index if not exists qr_scans_scanned_at_idx on public.qr_scans(scanned_at desc);

alter table public.qr_scans enable row level security;
