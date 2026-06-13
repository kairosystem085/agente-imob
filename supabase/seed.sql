insert into organizations (
  id,
  name,
  slug,
  type,
  creci,
  phone,
  whatsapp_number,
  plan
) values (
  '00000000-0000-0000-0000-000000000001',
  'Joao Corretor',
  'joao-corretor',
  'broker',
  'CRECI 00000',
  '+5585999990001',
  '+5585999990001',
  'active'
) on conflict (slug) do update set
  name = excluded.name,
  whatsapp_number = excluded.whatsapp_number,
  updated_at = now();

insert into properties (
  organization_id,
  title,
  description,
  type,
  purpose,
  price,
  city,
  neighborhood,
  bedrooms,
  area_m2,
  active
) values
('00000000-0000-0000-0000-000000000001', 'Apartamento vista mar no Meireles', 'Apartamento pronto para morar.', 'apartamento', 'venda', 740000, 'Fortaleza', 'Meireles', 3, 112, true),
('00000000-0000-0000-0000-000000000001', 'Casa duplex em condominio', 'Casa ampla com area gourmet.', 'casa', 'venda', 980000, 'Eusebio', 'Centro', 4, 245, true),
('00000000-0000-0000-0000-000000000001', 'Studio mobiliado para aluguel', 'Studio compacto perto de servicos.', 'apartamento', 'aluguel', 2800, 'Fortaleza', 'Aldeota', 1, 42, true);
