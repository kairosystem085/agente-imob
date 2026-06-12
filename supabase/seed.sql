insert into organizations (
  id,
  name,
  slug,
  organization_type,
  lead_distribution_strategy,
  phone,
  email
) values (
  '00000000-0000-0000-0000-000000000001',
  'Joao Corretor',
  'joao-corretor',
  'solo_broker',
  'manual',
  '+5585999990001',
  'contato@joaocorretor.com'
);

-- User rows in auth.users must be created by Supabase Auth before inserting real profiles.
-- Use these rows as reference data after creating matching auth users.

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
  featured,
  status
) values
('00000000-0000-0000-0000-000000000001', 'Apartamento vista mar no Meireles', 'Apartamento pronto para morar.', 'apartment', 'sale', 740000, 'Fortaleza', 'Meireles', 3, 3, 2, 112, true, 'active'),
('00000000-0000-0000-0000-000000000001', 'Casa duplex em condominio', 'Casa ampla com area gourmet.', 'house', 'sale', 980000, 'Eusebio', 'Centro', 4, 5, 4, 245, true, 'active'),
('00000000-0000-0000-0000-000000000001', 'Studio mobiliado para aluguel', 'Studio compacto perto de servicos.', 'apartment', 'rent', 2800, 'Fortaleza', 'Aldeota', 1, 1, 1, 42, false, 'active');
