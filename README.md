# ImobIA

ImobIA is a multi-tenant real estate service platform with AI-assisted WhatsApp flows for autonomous brokers, small agencies, large agencies, and developers.

The product is not only a CRM. It is designed to capture, qualify, match, schedule, notify, and route real estate leads.

## Current Status

This repository is the first commercial scaffold for the platform. It includes:

- Next.js app structure
- Multi-tenant data model
- Supabase-ready migrations
- Premium SaaS dashboard screens
- Role-aware dashboard concepts
- Public catalog route
- WhatsApp and AI service foundations
- Mock seed data for product review

## Audiences

The platform must serve two core audiences from day one:

- Autonomous broker: one-person operation, personal notification phone, simple catalog, direct lead ownership.
- Real estate company: multiple brokers, managers, routing rules, team performance, shared inventory.

The `organization` entity is intentionally neutral. It can represent an autonomous broker, a real estate agency, a developer, or a larger operation.

## Key Improvements Added To The Original Spec

- `organization_type` to distinguish solo brokers, agencies, developers, and enterprise teams.
- `lead_distribution_strategy` to prepare manual, round-robin, and fixed-broker flows.
- `notification_phone` per broker, so leads can be sent to each broker's own WhatsApp number.
- Supabase RLS policies prepared around organization membership and broker ownership.
- Public catalog support by organization slug.
- Internal agenda as the source of truth, with calendar integration left for later.
- AI service boundaries for qualification, property matching, and scheduling.
- Product risks documented before launch.

## Stack

- Next.js 15+
- TypeScript
- TailwindCSS
- shadcn/ui compatible structure
- Supabase
- PostgreSQL
- React Query
- Zod
- React Hook Form
- Railway

## Setup

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example`.

## Repository Structure

```text
src/
  app/
    (dashboard)/
    catalogo/[slug]/
  components/
  lib/
  services/
    ai/
    notifications/
    lead-distribution/
supabase/
  migrations/
  seed.sql
docs/
  product-review.md
```

## Launch Readiness

This scaffold is not production-complete yet. The highest-priority next steps are:

1. Connect Supabase Auth and session middleware.
2. Apply and test database migrations in Supabase.
3. Implement RLS tests before exposing real customer data.
4. Wire CRUD screens to Supabase.
5. Connect WhatsApp provider, starting with Evolution API.
6. Add billing and plan limits before selling publicly.
