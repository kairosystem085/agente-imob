export async function processarMensagem(mensagem, historico = [], lead = {}, imovelOrigem = null) {
  const NOME_AGENTE      = process.env.NOME_AGENTE || 'Ana'
  const NOME_IMOBILIARIA = process.env.NOME_IMOBILIARIA || 'Imobiliária'

  const contextoImovel = imovelOrigem
    ? `O lead veio do anúncio: ${imovelOrigem.codigo} — ${imovelOrigem.titulo}, ${imovelOrigem.bairro}, R$ ${Number(imovelOrigem.preco).toLocaleString('pt-BR')}. Apresente esse imóvel com entusiasmo na primeira mensagem antes de qualificar.`
    : 'Lead de busca orgânica.'

  // Estado atual do lead
  const estado = {
    tem_nome:          !!lead.nome,
    tem_tipo:          !!lead.tipo_imovel,
    tem_bairro:        !!(lead.bairros?.length),
    tem_quartos:       !!lead.quartos_min,
    tem_preco:         !!lead.preco_max,
    tem_modelo_compra: !!lead.modelo_compra,
    tem_nome_limpo:    lead.nome_limpo !== null && lead.nome_limpo !== undefined,
    tem_renda:         !!lead.renda_mensal,
    modelo_compra:     lead.modelo_compra,
    nome:              lead.nome,
  }

  const precisaRenda = ['financiado', 'fgts_financiamento'].includes(estado.modelo_compra)

  // Determinar próximo dado a coletar
  let proximoPasso = null
  if (!estado.tem_nome)          proximoPasso = 'nome'
  else if (!estado.tem_tipo)     proximoPasso = 'tipo_imovel'
  else if (!estado.tem_bairro)   proximoPasso = 'bairro'
  else if (!estado.tem_quartos)  proximoPasso = 'quartos'
  else if (!estado.tem_preco)    proximoPasso = 'preco'
  else if (!estado.tem_modelo_compra) proximoPasso = 'modelo_compra'
  else if (precisaRenda && !estado.tem_nome_limpo) proximoPasso = 'nome_limpo'
  else if (precisaRenda && !estado.tem_renda)      proximoPasso = 'renda'
  else proximoPasso = 'buscar'

  const systemPrompt = `Você é ${NOME_AGENTE}, corretora da ${NOME_IMOBILIARIA}.
Converse de forma natural e calorosa. Seja direta e breve.

${contextoImovel}

DADOS JÁ COLETADOS:
${estado.tem_nome ? `- Nome: ${lead.nome}` : '- Nome: não coletado'}
${estado.tem_tipo ? `- Tipo: ${lead.tipo_imovel}` : '- Tipo: não coletado'}
${estado.tem_bairro ? `- Bairro: ${lead.bairros?.join(', ')}` : '- Bairro: não coletado'}
${estado.tem_quartos ? `- Quartos: ${lead.quartos_min}+` : '- Quartos: não coletado'}
${estado.tem_preco ? `- Orçamento: R$ ${Number(lead.preco_max).toLocaleString('pt-BR')}` : '- Orçamento: não coletado'}
${estado.tem_modelo_compra ? `- Compra: ${lead.modelo_compra}` : '- Compra: não coletado'}
${estado.tem_nome_limpo ? `- Nome limpo: ${lead.nome_limpo ? 'sim' : 'não'}` : ''}
${estado.tem_renda ? `- Renda: R$ ${Number(lead.renda_mensal).toLocaleString('pt-BR')}` : ''}

PRÓXIMO DADO A COLETAR: ${proximoPasso}

INSTRUÇÕES PARA ESTE TURNO:
${proximoPasso === 'nome' ? `- Se for a primeira mensagem, se apresente: "Olá! Sou a ${NOME_AGENTE} da ${NOME_IMOBILIARIA}. 😊" e pergunte o nome.
- Se não for primeira mensagem, só pergunte o nome naturalmente.` : ''}
${proximoPasso === 'tipo_imovel' ? '- Pergunte se busca casa ou apartamento. 1 frase curta.' : ''}
${proximoPasso === 'bairro' ? '- Pergunte qual bairro ou região prefere. 1 frase.' : ''}
${proximoPasso === 'quartos' ? '- Pergunte quantos quartos no mínimo. 1 frase.' : ''}
${proximoPasso === 'preco' ? '- Pergunte o orçamento máximo. 1 frase.' : ''}
${proximoPasso === 'modelo_compra' ? '- Pergunte se vai financiar, pagar à vista ou usar FGTS. 1 frase.' : ''}
${proximoPasso === 'nome_limpo' ? '- Pergunte se o nome está limpo no SPC/Serasa. 1 frase discreta.' : ''}
${proximoPasso === 'renda' ? '- Pergunte a renda familiar mensal. 1 frase.' : ''}
${proximoPasso === 'buscar' ? `- Diga que vai buscar os melhores imóveis agora. Responda com exatamente: {"acao":"BUSCAR_IMOVEIS"}` : ''}

REGRAS:
- NUNCA use o nome do lead dentro da pergunta (não diga "Natan?" ou "João, qual...")
- NUNCA confirme o que o lead disse ("Entendi que você quer X...")  
- NUNCA faça mais de uma pergunta por mensagem
- Seja calorosa mas direta — máximo 2 frases
- Quando o próximo passo for "buscar", responda SOMENTE: {"acao":"BUSCAR_IMOVEIS"}`

  const messages = [
    ...historico.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: mensagem }
  ]

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 256,
      temperature: 0.3
    })
  })

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content?.trim() || ''
  console.log('Groq:', text.slice(0, 200))

  // Detectar ação JSON
  try {
    const start = text.indexOf('{')
    const end   = text.lastIndexOf('}')
    if (start !== -1 && end !== -1) {
      const parsed = JSON.parse(text.slice(start, end + 1))
      if (parsed.acao) return { tipo: 'acao', dados: parsed, texto: text }
    }
  } catch (e) {}

  return { tipo: 'texto', texto: text, proximoPasso }
}

// Extrai dados da mensagem do lead baseado no contexto
export async function extrairDados(mensagem, proximoPasso, lead) {
  const msg = mensagem.trim().toLowerCase()

  switch (proximoPasso) {
    case 'nome':
      // Capitaliza o nome
      return { nome: mensagem.trim().replace(/\b\w/g, c => c.toUpperCase()) }

    case 'tipo_imovel':
      if (msg.includes('casa') || msg.includes('sobrado')) return { tipo_imovel: 'casa' }
      if (msg.includes('apart') || msg.includes('apto')) return { tipo_imovel: 'apartamento' }
      return null

    case 'bairro':
      return { bairros: [mensagem.trim()] }

    case 'quartos': {
      const num = mensagem.match(/\d+/)
      if (num) return { quartos_min: parseInt(num[0]) }
      if (msg.includes('um') || msg.includes('1')) return { quartos_min: 1 }
      if (msg.includes('dois') || msg.includes('2')) return { quartos_min: 2 }
      if (msg.includes('três') || msg.includes('tres') || msg.includes('3')) return { quartos_min: 3 }
      return null
    }

    case 'preco': {
      // Extrai número da mensagem (ex: "200.000", "200000", "200k", "200 mil")
      const clean = msg.replace(/\./g, '').replace(',', '.')
      const milMatch = clean.match(/(\d+(?:\.\d+)?)\s*mil/)
      const kMatch   = clean.match(/(\d+(?:\.\d+)?)\s*k/)
      const numMatch = clean.match(/(\d{4,})/)
      if (milMatch) return { preco_max: parseFloat(milMatch[1]) * 1000 }
      if (kMatch)   return { preco_max: parseFloat(kMatch[1]) * 1000 }
      if (numMatch) return { preco_max: parseFloat(numMatch[1]) }
      return null
    }

    case 'modelo_compra':
      if (msg.includes('vista') || msg.includes('avista')) return { modelo_compra: 'a_vista' }
      if (msg.includes('fgts') && msg.includes('financ')) return { modelo_compra: 'fgts_financiamento' }
      if (msg.includes('fgts')) return { modelo_compra: 'fgts_financiamento' }
      if (msg.includes('financ') || msg.includes('banco') || msg.includes('provavelmente')) return { modelo_compra: 'financiado' }
      if (msg.includes('não sei') || msg.includes('nao sei')) return { modelo_compra: 'nao_sabe' }
      return null

    case 'nome_limpo':
      if (msg.includes('sim') || msg.includes('limpo') || msg.includes('está') || msg.includes('ta') || msg.includes('yes')) return { nome_limpo: true }
      if (msg.includes('não') || msg.includes('nao') || msg.includes('sujo') || msg.includes('restri')) return { nome_limpo: false }
      return null

    case 'renda': {
      const clean2 = msg.replace(/\./g, '').replace(',', '.')
      const milMatch2 = clean2.match(/(\d+(?:\.\d+)?)\s*mil/)
      const kMatch2   = clean2.match(/(\d+(?:\.\d+)?)\s*k/)
      const numMatch2 = clean2.match(/(\d{3,})/)
      if (milMatch2) return { renda_mensal: parseFloat(milMatch2[1]) * 1000 }
      if (kMatch2)   return { renda_mensal: parseFloat(kMatch2[1]) * 1000 }
      if (numMatch2) return { renda_mensal: parseFloat(numMatch2[1]) }
      return null
    }

    default:
      return null
  }
}
