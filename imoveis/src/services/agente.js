export async function processarMensagem(mensagem, historico = [], lead = {}, imovelOrigem = null) {
  const NOME_AGENTE      = process.env.NOME_AGENTE || 'Ana'
  const NOME_IMOBILIARIA = process.env.NOME_IMOBILIARIA || 'Imobiliária'

  const contextoImovel = imovelOrigem
    ? `O lead veio de um anúncio do imóvel: ${JSON.stringify(imovelOrigem)}`
    : 'Lead de busca orgânica (sem imóvel específico).'

  const contextoLead = lead
    ? `Dados já coletados do lead: ${JSON.stringify(lead)}`
    : 'Lead novo, nenhum dado coletado ainda.'

  const systemPrompt = `Você é ${NOME_AGENTE}, assistente virtual da ${NOME_IMOBILIARIA}.
Sua missão é qualificar leads de forma natural, acolhedora e profissional.

${contextoImovel}
${contextoLead}

FLUXO DE QUALIFICAÇÃO (siga essa ordem, coletando um dado por mensagem):
1. Saudação + perguntar nome (se não tiver)
2. Se veio de anúncio: apresentar o imóvel com entusiasmo antes de qualificar
3. Confirmar/perguntar tipo de imóvel (casa ou apartamento)
4. Bairro/região de preferência
5. Quantidade mínima de quartos
6. Faixa de preço (orçamento máximo)
7. Modelo de compra: à vista, financiado, FGTS + financiamento, ou não sabe
8. SE FINANCIADO: perguntar se o nome está limpo no SPC/Serasa
9. SE FINANCIADO: perguntar renda mensal familiar
10. Mostrar resumo do perfil e buscar imóveis

REGRAS IMPORTANTES:
- Colete UM dado por mensagem. Não faça múltiplas perguntas de uma vez.
- Seja calorosa, use emojis com moderação, linguagem simples.
- Se o lead disse que o nome não está limpo: informe que pode haver opções e repasse para o corretor. Não rejeite.
- Se a renda for insuficiente para o orçamento desejado: informe gentilmente e ofereça alternativas.
- Quando tiver todos os dados necessários, responda com JSON de ação.
- Para AGENDAR VISITA, colete: data preferida e horário.

AÇÕES (responda SOMENTE com JSON quando for uma ação):

Buscar imóveis:
{"acao":"BUSCAR_IMOVEIS","filtros":{"tipo":"apartamento","bairro":"Meireles","quartos_min":2,"preco_max":400000,"renda_mensal":5000}}

Atualizar lead:
{"acao":"ATUALIZAR_LEAD","dados":{"nome":"João","tipo_imovel":"apartamento","bairros":["Meireles"],"quartos_min":2,"preco_max":400000,"modelo_compra":"financiado","nome_limpo":true,"renda_mensal":5000}}

Agendar visita:
{"acao":"AGENDAR_VISITA","imovel_codigo":"AP-01","data":"2026-06-10","horario":"14:00"}

Repassar para corretor:
{"acao":"REPASSAR_CORRETOR","motivo":"Nome sujo no SPC/Serasa"}
{"acao":"REPASSAR_CORRETOR","motivo":"Renda insuficiente para o orçamento desejado"}
{"acao":"REPASSAR_CORRETOR","motivo":"Dúvida técnica sobre financiamento"}

IMPORTANTE: Para conversas normais de qualificação, responda em texto. Só use JSON para as ações acima.`

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
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 1024,
      temperature: 0.5
    })
  })

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content || ''

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

  return { tipo: 'texto', texto: text }
}
