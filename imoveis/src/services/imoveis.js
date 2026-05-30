import { supabase } from '../lib/supabase.js'

export async function buscarImoveis(filtros = {}) {
  let query = supabase
    .from('imoveis')
    .select('*')
    .eq('disponivel', true)

  if (filtros.tipo)        query = query.eq('tipo', filtros.tipo)
  if (filtros.bairro)      query = query.ilike('bairro', `%${filtros.bairro}%`)
  if (filtros.quartos_min) query = query.gte('quartos', filtros.quartos_min)
  if (filtros.preco_max)   query = query.lte('preco', filtros.preco_max)
  if (filtros.preco_min)   query = query.gte('preco', filtros.preco_min)
  if (filtros.aceita_fgts) query = query.eq('aceita_fgts', true)

  // Filtro de renda: se lead informou renda, filtra por renda_minima compatível
  if (filtros.renda_mensal) {
    const rendaMax = filtros.renda_mensal / 0.3 * 100 // inverso: preco <= renda/30% * 100
    // Regra simples: parcela ≤ 30% da renda, prazo 360 meses, taxa ~0.8%/mês
    // Estimativa do valor financiável: renda * 0.3 / 0.008 * (1-(1.008^-360))
    const valorFinanciavel = filtros.renda_mensal * 0.3 / 0.008 * (1 - Math.pow(1.008, -360))
    query = query.lte('preco', valorFinanciavel * 1.2) // 20% de margem para entrada
  }

  query = query.order('destaque', { ascending: false }).limit(3)

  const { data } = await query
  return data || []
}

export async function buscarImovelPorCodigo(codigo) {
  const { data } = await supabase
    .from('imoveis')
    .select('*')
    .eq('codigo', codigo.toUpperCase())
    .single()
  return data
}

export async function formatarImovel(imovel) {
  const diferenciais = imovel.diferenciais?.join(', ') || ''
  const suites = imovel.suites > 0 ? ` (${imovel.suites} suíte${imovel.suites > 1 ? 's' : ''})` : ''

  return (
    `🏠 *${imovel.titulo}* — \`${imovel.codigo}\`\n` +
    `📍 ${imovel.bairro}, ${imovel.cidade}\n` +
    `🛏️ ${imovel.quartos} quartos${suites} | 🚿 ${imovel.banheiros} banheiros | 🚗 ${imovel.vagas} vaga${imovel.vagas !== 1 ? 's' : ''}\n` +
    `📐 ${imovel.area_m2}m²\n` +
    `✨ ${diferenciais}\n` +
    `💰 *R$ ${Number(imovel.preco).toLocaleString('pt-BR')}*\n` +
    `\n_${imovel.descricao_curta}_`
  )
}
