export async function repassarParaCorretor(phone, lead, obs) {
  try {
    const CHATWOOT_URL   = process.env.CHATWOOT_URL
    const CHATWOOT_TOKEN = process.env.CHATWOOT_TOKEN
    const INBOX_ID       = process.env.CHATWOOT_INBOX_ID

    if (!CHATWOOT_URL || !CHATWOOT_TOKEN) {
      console.log('Chatwoot não configurado — repasse via WhatsApp direto')
      return false
    }

    // Criar ou buscar contato no Chatwoot
    const contactRes = await fetch(`${CHATWOOT_URL}/api/v1/accounts/1/contacts/search?q=${phone}`, {
      headers: { 'api_access_token': CHATWOOT_TOKEN }
    })
    const contactData = await contactRes.json()

    let contactId
    if (contactData.payload?.length > 0) {
      contactId = contactData.payload[0].id
    } else {
      const newContact = await fetch(`${CHATWOOT_URL}/api/v1/accounts/1/contacts`, {
        method: 'POST',
        headers: { 'api_access_token': CHATWOOT_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:  lead.nome || phone,
          phone_number: `+${phone.replace('@s.whatsapp.net', '')}`
        })
      })
      const nc = await newContact.json()
      contactId = nc.id
    }

    // Criar conversa
    const convRes = await fetch(`${CHATWOOT_URL}/api/v1/accounts/1/conversations`, {
      method: 'POST',
      headers: { 'api_access_token': CHATWOOT_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inbox_id:   Number(INBOX_ID),
        contact_id: contactId,
        additional_attributes: {
          obs_agente: obs
        }
      })
    })
    const conv = await convRes.json()

    // Enviar resumo do lead como mensagem interna
    const resumo = montarResumoLead(lead, obs)
    await fetch(`${CHATWOOT_URL}/api/v1/accounts/1/conversations/${conv.id}/messages`, {
      method: 'POST',
      headers: { 'api_access_token': CHATWOOT_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content:      resumo,
        message_type: 'activity',
        private:      true
      })
    })

    return true
  } catch (e) {
    console.error('Erro ao repassar para Chatwoot:', e)
    return false
  }
}

function montarResumoLead(lead, obs) {
  return `🔔 LEAD REPASSADO PELO AGENTE\n\n` +
    `👤 Nome: ${lead.nome || 'Não informado'}\n` +
    `📱 Telefone: ${lead.phone}\n` +
    `🏠 Interesse: ${lead.tipo_imovel || 'Não informado'}\n` +
    `📍 Bairro: ${lead.bairros?.join(', ') || 'Não informado'}\n` +
    `🛏️ Quartos: ${lead.quartos_min || 'Não informado'}+\n` +
    `💰 Orçamento: ${lead.preco_max ? 'até R$ ' + Number(lead.preco_max).toLocaleString('pt-BR') : 'Não informado'}\n` +
    `💳 Compra: ${lead.modelo_compra || 'Não informado'}\n` +
    `✅ Nome limpo: ${lead.nome_limpo === true ? 'Sim' : lead.nome_limpo === false ? 'Não' : 'Não informado'}\n` +
    `💵 Renda: ${lead.renda_mensal ? 'R$ ' + Number(lead.renda_mensal).toLocaleString('pt-BR') : 'Não informado'}\n` +
    `📌 Imóvel de origem: ${lead.imovel_origem || 'Busca orgânica'}\n\n` +
    `⚠️ Motivo do repasse: ${obs}`
}
