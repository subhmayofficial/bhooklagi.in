create table if not exists promotional_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  coupon_code text,
  theme_color text not null default 'orange',
  is_active boolean not null default true,
  created_at timestamp with time zone default now()
);
