create extension if not exists "pgcrypto";

create type organization_type as enum ('solo_broker', 'agency', 'developer', 'enterprise');
create type organization_role as enum ('owner', 'manager', 'broker');
create type lead_distribution_strategy as enum ('manual', 'round_robin', 'fixed_broker');
create type property_type as enum ('house', 'apartment', 'land', 'commercial');
create type property_purpose as enum ('sale', 'rent');
create type property_status as enum ('active', 'reserved', 'sold', 'rented', 'inactive');
create type lead_temperature as enum ('cold', 'warm', 'hot');
create type lead_status as enum ('new', 'qualified', 'scheduled', 'negotiation', 'closed', 'lost');
create type appointment_status as enum ('scheduled', 'completed', 'cancelled', 'rescheduled');
create type whatsapp_status as enum ('disconnected', 'connecting', 'connected');
create type notification_type as enum ('new_lead', 'hot_lead', 'appointment_created', 'appointment_cancelled', 'system');
create type integration_provider as enum ('google_calendar', 'google_meet', 'whatsapp', 'openai', 'groq');
create type integration_status as enum ('connected', 'disconnected', 'pending');

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  organization_type organization_type not null default 'agency',
  lead_distribution_strategy lead_distribution_strategy not null default 'manual',
  logo_url text,
  phone text,
  email text,
  business_hours jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  notification_phone text,
  role organization_role not null default 'broker',
  avatar_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  broker_id uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  property_type property_type not null,
  purpose property_purpose not null,
  price numeric(14,2) not null check (price >= 0),
  city text not null,
  district text not null,
  address text,
  bedrooms integer not null default 0,
  bathrooms integer not null default 0,
  parking_spaces integer not null default 0,
  area numeric(10,2),
  featured boolean not null default false,
  status property_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table property_images (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  broker_id uuid references profiles(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  source text,
  interest text,
  temperature lead_temperature not null default 'cold',
  status lead_status not null default 'new',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  broker_id uuid references profiles(id) on delete set null,
  lead_id uuid references leads(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  date date not null,
  time time not null,
  status appointment_status not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  broker_id uuid references profiles(id) on delete set null,
  phone text not null,
  status text not null default 'open',
  last_message text,
  last_interaction timestamptz,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('lead', 'ai', 'broker', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create table whatsapp_instances (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  instance_name text not null,
  phone_number text,
  status whatsapp_status not null default 'disconnected',
  qr_code text,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  provider integration_provider not null,
  status integration_status not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index profiles_organization_idx on profiles(organization_id);
create index properties_organization_idx on properties(organization_id);
create index leads_organization_idx on leads(organization_id);
create index leads_broker_idx on leads(broker_id);
create index appointments_organization_idx on appointments(organization_id);
create index conversations_organization_idx on conversations(organization_id);
create index notifications_user_unread_idx on notifications(user_id, read);
