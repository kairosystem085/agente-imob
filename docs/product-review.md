# Product Review

## Verdict

The original specification is strong, but it is not 100% ready for a commercial launch. It defines the right product direction, but several details need to be explicit so the same product can serve both an autonomous broker and a real estate company.

## What Is Already Strong

- Multi-tenant architecture using `organization` instead of `real_estate_agency`.
- Roles are clear enough for the first version: owner, manager, broker.
- Internal agenda is the correct decision. Google Calendar should be an integration, not the system of record.
- The table list covers the main operating flow: properties, leads, appointments, conversations, messages, WhatsApp instances, notifications, and integrations.
- Public catalog by slug is a strong acquisition surface.
- AI responsibilities are correctly separated into qualification, matching, scheduling, and human handoff.

## Main Gaps To Fix

### 1. Organization Type

The platform needs to know whether an organization is a solo broker, agency, developer, or enterprise. The UI, onboarding, limits, dashboard copy, and lead routing rules change depending on this.

Added field:

- `organization_type`

### 2. Broker Notification Phone

The broker must receive new leads on their own number. This means `profiles.notification_phone` cannot be optional in real sales flows. The system also needs notification preferences later.

Added operational rule:

- Lead notifications should target `broker.notification_phone` when a broker is assigned.

### 3. Lead Routing

The spec says manual first, but the database should preserve the selected strategy per organization.

Added field:

- `organizations.lead_distribution_strategy`

Prepared strategies:

- `manual`
- `round_robin`
- `fixed_broker`

### 4. RLS Detail

"Prepare for RLS" is not enough for a SaaS handling leads and phone numbers. Every table needs organization isolation. Brokers also need ownership-level access for their own leads, appointments, conversations, and properties.

### 5. Billing And Limits

Before commercialization, the product needs pricing limits such as:

- number of brokers
- number of active properties
- number of WhatsApp instances
- AI message volume
- public catalog availability

### 6. LGPD And Consent

The product stores names, phones, interests, messages, appointments, and lead notes. The commercial version needs consent, data deletion, audit logs, and privacy terms.

### 7. Property Intake

For agencies, manual CRUD is not enough. Later versions should support CSV import, portal import, and media bulk handling.

## Recommended MVP Scope

Build the first sellable version around:

- Auth
- Organization onboarding
- Dashboard by role
- Property CRUD
- Lead CRUD
- Internal agenda
- Public catalog
- Manual lead assignment
- Broker WhatsApp notification preparation
- WhatsApp status screen
- AI service interfaces with mock execution

## Do Not Launch Without

- Tested RLS policies
- Backup and recovery plan
- Clear organization onboarding
- Lead ownership rules
- Notification delivery logs
- Error tracking
- Terms and privacy policy
