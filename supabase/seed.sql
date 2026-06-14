insert into organizations (
  id,
  name,
  slug,
  organization_type,
  lead_distribution_strategy,
  phone,
  email,
  business_hours
) values (
  '00000000-0000-0000-0000-000000000001',
  'Joao Corretor',
  'joao-corretor',
  'solo_broker',
  'manual',
  '+5585999990001',
  'joao@imobia.app',
  '{}'::jsonb
) on conflict (slug) do update set
  name = excluded.name,
  phone = excluded.phone,
  updated_at = now();

insert into properties (
  organization_id,
  title,
  description,
  property_type,
  purpose,
  price,
  city,
  district,
  bedrooms,
  bathrooms,
  parking_spaces,
  area,
  status
) values
('00000000-0000-0000-0000-000000000001', 'Apartamento vista mar no Meireles', 'Apartamento pronto para morar.', 'apartment', 'sale', 740000, 'Fortaleza', 'Meireles', 3, 2, 2, 112, 'active'),
('00000000-0000-0000-0000-000000000001', 'Casa duplex em condominio', 'Casa ampla com area gourmet.', 'house', 'sale', 980000, 'Eusebio', 'Centro', 4, 4, 3, 245, 'active'),
('00000000-0000-0000-0000-000000000001', 'Studio mobiliado para aluguel', 'Studio compacto perto de servicos.', 'apartment', 'rent', 2800, 'Fortaleza', 'Aldeota', 1, 1, 1, 42, 'active');
