alter table organizations enable row level security;
alter table profiles enable row level security;
alter table properties enable row level security;
alter table property_images enable row level security;
alter table leads enable row level security;
alter table appointments enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table whatsapp_instances enable row level security;
alter table notifications enable row level security;
alter table integrations enable row level security;

create or replace function public.current_organization_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select organization_id from profiles where id = auth.uid() limit 1
$$;

create or replace function public.current_role()
returns organization_role
language sql
security definer
set search_path = public
stable
as $$
  select role from profiles where id = auth.uid() limit 1
$$;

create policy "members can view their organization"
on organizations for select
using (id = public.current_organization_id());

create policy "owners can update their organization"
on organizations for update
using (id = public.current_organization_id() and public.current_role() = 'owner');

create policy "members can view profiles in organization"
on profiles for select
using (organization_id = public.current_organization_id());

create policy "owners and managers can manage profiles"
on profiles for all
using (organization_id = public.current_organization_id() and public.current_role() in ('owner', 'manager'))
with check (organization_id = public.current_organization_id() and public.current_role() in ('owner', 'manager'));

create policy "members can view organization properties"
on properties for select
using (organization_id = public.current_organization_id());

create policy "brokers can manage their own properties"
on properties for all
using (
  organization_id = public.current_organization_id()
  and (public.current_role() in ('owner', 'manager') or broker_id = auth.uid())
)
with check (
  organization_id = public.current_organization_id()
  and (public.current_role() in ('owner', 'manager') or broker_id = auth.uid())
);

create policy "members can view property images"
on property_images for select
using (organization_id = public.current_organization_id());

create policy "members can manage property images"
on property_images for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "members see leads by role"
on leads for select
using (
  organization_id = public.current_organization_id()
  and (public.current_role() in ('owner', 'manager') or broker_id = auth.uid())
);

create policy "members manage leads by role"
on leads for all
using (
  organization_id = public.current_organization_id()
  and (public.current_role() in ('owner', 'manager') or broker_id = auth.uid())
)
with check (organization_id = public.current_organization_id());

create policy "members see appointments by role"
on appointments for select
using (
  organization_id = public.current_organization_id()
  and (public.current_role() in ('owner', 'manager') or broker_id = auth.uid())
);

create policy "members manage appointments by role"
on appointments for all
using (
  organization_id = public.current_organization_id()
  and (public.current_role() in ('owner', 'manager') or broker_id = auth.uid())
)
with check (organization_id = public.current_organization_id());

create policy "members see conversations by role"
on conversations for select
using (
  organization_id = public.current_organization_id()
  and (public.current_role() in ('owner', 'manager') or broker_id = auth.uid())
);

create policy "members see messages in organization"
on messages for select
using (organization_id = public.current_organization_id());

create policy "owners and managers manage whatsapp"
on whatsapp_instances for all
using (organization_id = public.current_organization_id() and public.current_role() in ('owner', 'manager'))
with check (organization_id = public.current_organization_id() and public.current_role() in ('owner', 'manager'));

create policy "users see own notifications"
on notifications for select
using (organization_id = public.current_organization_id() and user_id = auth.uid());

create policy "users update own notifications"
on notifications for update
using (organization_id = public.current_organization_id() and user_id = auth.uid());

create policy "owners and managers manage integrations"
on integrations for all
using (organization_id = public.current_organization_id() and public.current_role() in ('owner', 'manager'))
with check (organization_id = public.current_organization_id() and public.current_role() in ('owner', 'manager'));
