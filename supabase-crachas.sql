create extension if not exists pgcrypto;

create table if not exists public.crachas_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.crachas_volunteers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area_id uuid not null references public.crachas_areas(id) on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.crachas_checkins (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.crachas_volunteers(id) on delete cascade,
  service_type text not null check (service_type in ('DOMINGO_1030', 'DOMINGO_1830')),
  checked_in_at timestamptz not null default now(),
  checked_out_at timestamptz,
  date date not null
);

create index if not exists crachas_volunteers_area_id_idx
  on public.crachas_volunteers(area_id);

create index if not exists crachas_checkins_lookup_idx
  on public.crachas_checkins(date, service_type, volunteer_id);

insert into public.crachas_areas (name)
values
  ('Louvor'),
  ('Midia'),
  ('Recepcao'),
  ('Kids'),
  ('Estacionamento'),
  ('Intercessao'),
  ('Diaconia'),
  ('Som'),
  ('Transmissao'),
  ('Limpeza')
on conflict (name) do nothing;
