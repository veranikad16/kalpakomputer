-- Jalankan di Supabase SQL Editor.
-- Menambah kode tracking berbasis text untuk servis on-site.

alter table public.servis_onsite
add column if not exists kode_order text;

-- Isi untuk data lama yang belum punya kode (8 char hex uppercase)
update public.servis_onsite
set kode_order = upper(substring(md5(random()::text) from 1 for 8))
where kode_order is null or length(trim(kode_order)) = 0;

-- Pastikan unik (skip kalau sudah ada)
do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'servis_onsite'
      and indexname = 'servis_onsite_kode_order_key'
  ) then
    create unique index servis_onsite_kode_order_key on public.servis_onsite (kode_order);
  end if;
end $$;

-- Opsional: validasi panjang/format (uncomment kalau mau strict)
-- alter table public.servis_onsite
-- add constraint servis_onsite_kode_order_format
-- check (kode_order ~ '^[0-9A-F]{8}$');

