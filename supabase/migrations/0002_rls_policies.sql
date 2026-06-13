alter table organizations enable row level security;
alter table brokers enable row level security;
alter table properties enable row level security;
alter table leads enable row level security;
alter table conversations enable row level security;

create policy "broker acessa sua organization" on organizations
  for all using (
    id in (select organization_id from brokers where user_id = auth.uid())
  );

create policy "broker acessa equipe da organization" on brokers
  for all using (
    organization_id in (select organization_id from brokers where user_id = auth.uid())
  );

create policy "broker acessa seus imoveis" on properties
  for all using (
    organization_id in (select organization_id from brokers where user_id = auth.uid())
  ) with check (
    organization_id in (select organization_id from brokers where user_id = auth.uid())
  );

create policy "broker acessa seus leads" on leads
  for all using (
    organization_id in (select organization_id from brokers where user_id = auth.uid())
  ) with check (
    organization_id in (select organization_id from brokers where user_id = auth.uid())
  );

create policy "broker acessa suas conversas" on conversations
  for all using (
    organization_id in (select organization_id from brokers where user_id = auth.uid())
  ) with check (
    organization_id in (select organization_id from brokers where user_id = auth.uid())
  );
