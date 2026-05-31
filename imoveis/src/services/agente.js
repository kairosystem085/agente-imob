export async function processarMensagem(mensagem, historico = [], lead = {}, imovelOrigem = null) {
  const NOME_AGENTE      = process.env.NOME_AGENTE || 'Ana'
  const NOME_IMOBILIARIA = process.env.NOME_IMOBILIARIA || 'Imobiliária'

  const contextoImovel = imovelOrigem
    ? `O lead veio do anúncio: ${imovelOrigem.codigo} — ${imovelOrigem.titulo}, ${imovelOrigem.bairro}, R$ ${Number(imovelOrigem.preco).toLocaleString('pt-BR')}. Na primeira mensagem, apresente esse imóvel com entusiasmo antes de qualificar.`
    : 'Lead de busca orgânica.'

  const precisaRenda = ['financiado', 'fgts_financiamento'].includes(lead.modelo_compra)

  // Determinar próximo passo
  let proximoPasso = null
  if (!lead.nome)                                          proximoPasso = 'nome'
  else if (!lead.bairros?.length)                          proximoPasso = 'bairro'
  else if (!lead.modelo_compra)                            proximoPasso = 'modelo_compra'
  else if (precisaRenda && lead.nome_limpo === null && lead.nome_limpo === undefined) proximoPasso = 'nome_limpo'
  else if (precisaRenda && lead.nome_limpo === null)       proximoPasso = 'nome_limpo'
  else                                                     proximoPasso = 'buscar'

  // Corrigir lógica de nome_limpo
  const nomeLimpoColetado = lead.nome_limpo !== null && lead.nome_limpo !== undefined
  if (!lead.nome)                                          proximoPasso = 'nome'
  else if (!lead.bairros?.length)                          proximoPasso = 'bairro'
  else if (!lead.modelo_compra)                            proximoPasso = 'modelo_compra'
  else if (precisaRenda && !nomeLimpoColetado)             proximoPasso = 'nome_limpo'
  else                                                     proximoPasso = 'buscar'

  const systemPrompt = `Você é ${NOME_AGENTE}, corretora da ${NOME_IMOBILIARIA}.
Converse de forma natural, calorosa e direta. Seja breve.

${contextoImovel}

DADOS JÁ COLETADOS:
- Nome: ${lead.nome || 'não coletado'}
- Região/bairro: ${lead.bairros?.join(', ') || 'não coletado'}
- Modelo de compra: ${lead.modelo_compra || 'não coletado'}
- Nome limpo: ${nomeLimpoColetado ? (lead.nome_limpo ? 'sim' : 'não') : 'não coletado'}

PRÓXIMO PASSO: ${proximoPasso}

${proximoPasso === 'nome' ? `INSTRUÇÃO: ${historico.length === 0 ? `Se apresente brevemente: "Olá! Sou a ${NOME_AGENTE} da ${NOME_IMOBILIARIA} 😊" e pergunte o nome.` : 'Pergunte o nome de forma natural.'}` : ''}
${proximoPasso === 'bairro' ? 'INSTRUÇÃO: Pergunte qual bairro ou região prefere. 1 frase curta.' : ''}
${proximoPasso === 'modelo_compra' ? 'INSTRUÇÃO: Pergunte se vai financiar ou pagar à vista. Pode mencionar FGTS também. 1 frase.' : ''}
${proximoPasso === 'nome_limpo' ? 'INSTRUÇÃO: Pergunte discretamente se o nome está limpo no SPC/Serasa. 1 frase.' : ''}
${proximoPasso === 'buscar' ? 'INSTRUÇÃO: Diga que vai buscar as opções disponíveis agora. Responda SOMENTE: {"acao":"BUSCAR_IMOVEIS"}' : ''}

REGRAS ABSOLUTAS:
- NUNCA mencione o nome do lead nas perguntas
- NUNCA confirme o que o lead disse
- NUNCA faça mais de uma pergunta por mensagem
- Se o lead disser "não sei", "sem ideia", "tanto faz" para qualquer pergunta que não seja nome_limpo: aceite e avance para o próximo passo respondendo SOMENTE: {"acao":"AVANCAR"}
- Se o lead quiser ver opções sem responder tudo: aceite e responda SOMENTE: {"acao":"BUSCAR_IMOVEIS"}
- Máximo 2 frases por resposta`

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
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 200,
      temperature: 0.3
    })
  })

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content?.trim() || ''
  console.log('Groq:', text)

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

export function extrairDados(mensagem, proximoPasso) {
  const msg = mensagem.trim().toLowerCase()

  switch (proximoPasso) {
    case 'nome':
      return { nome: mensagem.trim().replace(/\b\w/g, c => c.toUpperCase()) }

    case 'bairro':
      // Se não sabe, retorna null mas avança
      if (msg.includes('não sei') || msg.includes('nao sei') || msg.includes('qualquer') || msg.includes('tanto faz')) {
        return { bairros: ['Qualquer região'] }
      }
      return { bairros: [mensagem.trim()] }

    case 'modelo_compra':
      if (msg.includes('vista') || msg.includes('avista')) return { modelo_compra: 'a_vista' }
      if (msg.includes('fgts') && msg.includes('financ'))  return { modelo_compra: 'fgts_financiamento' }
      if (msg.includes('fgts'))                            return { modelo_compra: 'fgts_financiamento' }
      if (msg.includes('financ') || msg.includes('banco') || msg.includes('provavel') || msg.includes('parcel')) {
        return { modelo_compra: 'financiado' }
      }
      if (msg.includes('não sei') || msg.includes('nao sei') || msg.includes('talvez')) {
        return { modelo_compra: 'nao_sabe' }
      }
      return null

    case 'nome_limpo':
      if (msg.includes('sim') || msg.includes('limpo') || msg.includes('está') || msg.includes('ta limpo') || msg.includes('yes') || msg.includes('tá')) {
        return { nome_limpo: true }
      }
      if (msg.includes('não') || msg.includes('nao') || msg.includes('sujo') || msg.includes('restri') || msg.includes('negativ')) {
        return { nome_limpo: false }
      }
      return null

    default:
      return null
  }
}
