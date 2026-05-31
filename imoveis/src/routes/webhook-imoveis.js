import { processarMensagem }                    from '../services/agente.js'
import { getOrCreateLead, updateLead, getLead } from '../services/leads.js'
import { buscarImoveis, buscarImovelPorCodigo,
         formatarImovel }                        from '../services/imoveis.js'
import { agendarVisita }                         from '../services/visitas.js'
import { repassarParaCorretor }                  from '../services/chatwoot.js'
import { getHistory, saveMessage }               from '../services/memory.js'
import { sendMessage, sendImage }                from '../services/whatsapp.js'

export async function webhookRoute(fastify) {
  fastify.post('/webhook', async (request, reply) => {
    reply.send({ ok: true })

    try {
      const body    = request.body
      const data    = body?.data
      const phone   = data?.key?.remoteJid
      const name    = data?.pushName || ''
      const message = data?.message?.conversation || data?.message?.extendedTextMessage?.text

      if (!phone || !message) return
      if (data?.key?.fromMe) return

      console.log(`📩 ${phone} (${name}): ${message}`)

      // Buscar/criar lead e histórico
      const lead     = await getOrCreateLead(phone)
      const historico = await getHistory(phone)

      // Detectar se veio de anúncio (código de imóvel na mensagem)
      // Ex: "Tenho interesse no AP-04" ou "AP-04"
      let imovelOrigem = null
      if (!lead.imovel_origem) {
        const codigoMatch = message.match(/\b([A-Z]{2}-\d{2,4})\b/i)
        if (codigoMatch) {
          imovelOrigem = await buscarImovelPorCodigo(codigoMatch[1])
          if (imovelOrigem) {
            await updateLead(phone, { imovel_origem: imovelOrigem.codigo })
          }
        }
      } else {
        imovelOrigem = await buscarImovelPorCodigo(lead.imovel_origem)
      }

      // Atualizar nome se não tiver
      if (!lead.nome && name) {
        await updateLead(phone, { nome: name })
      }

      // Salvar mensagem do usuário
      await saveMessage(phone, 'user', message)

      // Processar com o agente
      const resultado = await processarMensagem(message, historico, lead, imovelOrigem)

      // Processar ação
      if (resultado.tipo === 'acao') {
        const { acao, filtros, dados, imovel_codigo, data: dataVisita, horario, motivo } = resultado.dados

        // Buscar imóveis compatíveis
        if (acao === 'BUSCAR_IMOVEIS') {
          const imoveis = await buscarImoveis(filtros)

          if (imoveis.length === 0) {
            const resposta =
              `😔 Não encontrei imóveis com essas características no momento.\n\n` +
              `Mas não se preocupe! Vou cadastrar seu perfil e assim que surgir algo compatível, te aviso. 😊\n\n` +
              `Posso te ajudar com mais alguma coisa?`
            await sendMessage(phone, resposta)
            await saveMessage(phone, 'assistant', resposta)
            await updateLead(phone, { status: 'sem_match' })
            return
          }

          // Enviar resumo do perfil + imóveis encontrados
          const nome = lead.nome || 'Olá'
          let intro =
            `✅ *Perfeito, ${nome}!* Aqui está o seu perfil:\n\n` +
            `🏠 Tipo: ${filtros.tipo || lead.tipo_imovel || 'A definir'}\n` +
            `📍 Bairro: ${filtros.bairro || lead.bairros?.join(', ') || 'Flexível'}\n` +
            `🛏️ Quartos: ${filtros.quartos_min || lead.quartos_min || 1}+\n` +
            `💰 Orçamento: até R$ ${Number(filtros.preco_max || lead.preco_max).toLocaleString('pt-BR')}\n` +
            `💳 Compra: ${lead.modelo_compra || 'A definir'}\n\n` +
            `🔍 Encontrei *${imoveis.length} imóvel(is)* para você:`

          await sendMessage(phone, intro)
          await saveMessage(phone, 'assistant', intro)

          // Enviar cada imóvel
          for (const imovel of imoveis) {
            const texto = await formatarImovel(imovel)
            await sendMessage(phone, texto)

            // Enviar foto se tiver
            if (imovel.fotos?.length > 0) {
              await sendImage(phone, imovel.fotos[0], imovel.titulo)
            }

            await new Promise(r => setTimeout(r, 800)) // pequena pausa entre imóveis
          }

          const pergunta =
            `\nGostou de algum? Me diga o código do imóvel (ex: *AP-01*) e agendamos uma visita! 😊\n\n` +
            `Ou se preferir, me conta o que não te agradou e busco outras opções.`
          await sendMessage(phone, pergunta)
          await saveMessage(phone, 'assistant', pergunta)
          await updateLead(phone, { status: 'qualificado' })
          return
        }

        // Atualizar dados do lead
        if (acao === 'ATUALIZAR_LEAD') {
          await updateLead(phone, { ...dados, status: 'em_qualificacao' })

          // Extrair só o texto após o JSON (a próxima pergunta)
          const textoLimpo = resultado.texto
            ?.replace(/\{[\s\S]*\}/g, '')  // remove qualquer JSON
            ?.trim()

          if (textoLimpo) {
            await sendMessage(phone, textoLimpo)
            await saveMessage(phone, 'assistant', textoLimpo)
          }
          return
        }

        // Agendar visita
        if (acao === 'AGENDAR_VISITA') {
          const imovel = await buscarImovelPorCodigo(imovel_codigo)
          if (!imovel) {
            await sendMessage(phone, `Não encontrei o imóvel com esse código. Pode confirmar?`)
            return
          }

          await agendarVisita({
            leadId:    lead.id,
            imovelId:  imovel.id,
            phone,
            dataVisita,
            horario,
          })

          await updateLead(phone, { status: 'visita_agendada' })

          const confirmacao =
            `✅ *Visita agendada com sucesso!*\n\n` +
            `🏠 *${imovel.titulo}* — ${imovel.bairro}\n` +
            `📅 Data: ${new Date(dataVisita).toLocaleDateString('pt-BR')}\n` +
            `🕐 Horário: ${horario}\n\n` +
            `Um de nossos corretores entrará em contato para confirmar. 😊\n` +
            `Até lá!`

          await sendMessage(phone, confirmacao)
          await saveMessage(phone, 'assistant', confirmacao)

          // Notificar corretor
          const notif =
            `🔔 *Nova visita agendada!*\n\n` +
            `👤 Lead: ${lead.nome || phone}\n` +
            `📱 Tel: ${phone}\n` +
            `🏠 Imóvel: ${imovel.titulo} (${imovel.codigo})\n` +
            `📅 ${new Date(dataVisita).toLocaleDateString('pt-BR')} às ${horario}`

          await sendMessage(`${process.env.TELEFONE_CORRETOR}@s.whatsapp.net`, notif)
          return
        }

        // Repassar para corretor
        if (acao === 'REPASSAR_CORRETOR') {
          const leadAtual = await getLead(phone)
          await updateLead(phone, {
            status: 'repassar_corretor',
            obs_corretor: motivo
          })

          const repassado = await repassarParaCorretor(phone, leadAtual, motivo)

          const msg =
            `Entendido! 😊 Vou conectar você com um de nossos especialistas que poderá te ajudar melhor.\n\n` +
            `Em breve um corretor entrará em contato. Até já! 🏠`

          await sendMessage(phone, msg)
          await saveMessage(phone, 'assistant', msg)

          // Notificar corretor via WhatsApp também
          const leadFinal = await getLead(phone)
          const resumo =
            `🔔 *Lead repassado pelo agente*\n\n` +
            `👤 ${leadFinal.nome || 'Sem nome'} — ${phone}\n` +
            `⚠️ Motivo: ${motivo}\n` +
            `💰 Orçamento: R$ ${Number(leadFinal.preco_max || 0).toLocaleString('pt-BR')}\n` +
            `🏠 Interesse: ${leadFinal.tipo_imovel || 'A definir'} — ${leadFinal.bairros?.join(', ') || ''}`

          await sendMessage(`${process.env.TELEFONE_CORRETOR}@s.whatsapp.net`, resumo)
          return
        }
      }

      // Resposta de texto normal
      if (resultado.texto) {
        await sendMessage(phone, resultado.texto)
        await saveMessage(phone, 'assistant', resultado.texto)
      }

    } catch (err) {
      console.error('Erro no webhook:', err)
    }
  })

  fastify.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }))
}
