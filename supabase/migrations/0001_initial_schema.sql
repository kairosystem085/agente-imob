create extension if not exists "pgcrypto";

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  type text default 'broker' check (type in ('broker', 'agency', 'developer')),
  creci text,
  phone text,
  whatsapp_number text,
  instancia_id text,
  instancia_status text check (instancia_status is null or instancia_status in ('connecting', 'open', 'closed')),
  plan text default 'active' check (plan in ('active', 'setup', 'paused')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table brokers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text default 'owner' check (role in ('owner', 'manager', 'broker')),
  notification_phone text,
  created_at timestamptz default now(),
  unique(user_id),
  unique(organization_id, email)
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  type text default 'apartamento' check (type in ('apartamento', 'casa', 'terreno', 'cobertura', 'sala_comercial')),
  purpose text default 'venda' check (purpose in ('venda', 'aluguel')),
  price numeric(12,2) not null,
  neighborhood text not null,
  city text not null,
  bedrooms int,
  area_m2 numeric(8,2),
  description text,
  photos text[] default '{}',
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  phone text not null,
  name text,
  interest text check (interest is null or interest in ('compra', 'aluguel')),
  budget numeric(12,2),
  region text,
  bedrooms_wanted int,
  status text default 'novo' check (status in ('novo', 'em_qualificacao', 'qualificado', 'convertido')),
  source text default 'whatsapp',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(organization_id, phone)
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  phone text not null,
  history jsonb default '[]',
  stage text default 'inicio',
  updated_at timestamptz default now(),
  unique(organization_id, phone)
);

create index brokers_organization_idx on brokers(organization_id);
create index brokers_user_idx on brokers(user_id);
create index properties_organization_idx on properties(organization_id);
create index properties_active_idx on properties(organization_id, active);
create index leads_organization_idx on leads(organization_id);
create index leads_status_idx on leads(organization_id, status);
create index conversations_organization_phone_idx on conversations(organization_id, phone);
