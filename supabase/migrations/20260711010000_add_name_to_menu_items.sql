-- Add missing name column to menu_items table
alter table public.menu_items add column if not exists name text;
