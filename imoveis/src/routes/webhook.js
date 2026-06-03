import { processarMensagem, extrairDados }       from '../services/agente.js'
import { getOrCreateLead, updateLead, getLead } from '../services/leads.js'
import { buscarImoveis, buscarImovelPorCodigo,
         formatarImovel, buscarRegioes }        from '../services/imoveis.js'
import { agendarVisita }                        from '../services/visitas.js'
import { repassarParaCorretor }                 from '../services/chatwoot.js'
import { getHistory, saveMessage }              from '../services/memory.js'
import { sendMessage, sendImage }               from '../services/whatsapp.js'

function normalizarTexto(texto = '') {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

async function detectarRegiaoNaMensagem(message) {
  const regioes = await buscarRegioes()
  const mensagemNormalizada = normalizarTexto(message)

  return regioes.find(r => {
    const bairro = normalizarTexto(r.bairro)
    return mensagemNormalizada === bairro || mensagemNormalizada.includes(bairro)
  })
}

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

      let lead = await getOrCreateLead(phone)
      const historico = await getHistory(phone)

      let imovelOrigem = null
      if (!lead.imovel_origem) {
        const codigoMatch = message.match(/\b([A-Z]{2}-\d{2,4})\b/i)
        if (codigoMatch) {
          imovelOrigem = await buscarImovelPorCodigo(codigoMatch[1])
          if (imovelOrigem) {
            await updateLead(phone, { imovel_origem: imovelOrigem.codigo })
            lead = await getLead(phone)
          }
        }
      } else {
        imovelOrigem = await buscarImovelPorCodigo(lead.imovel_origem)
      }

      if (!lead.nome && name) {
        await updateLead(phone, { nome: name })
        lead = await getLead(phone)
      }

      const regiaoEscolhida = await detectarRegiaoNaMensagem(message)
      if (regiaoEscolhida) {
        await updateLead(phone, {
          bairros: [regiaoEscolhida.bairro],
          status: 'em_qualificacao'
        })
        lead = await getLead(phone)
      }

      await saveMessage(phone, 'user', message)

      const resultado = await processarMensagem(message, historico, lead, imovelOrigem)

      if (resultado.proximoPasso && resultado.tipo === 'texto') {
        const dadosExtraidos = extrairDados(message, resultado.proximoPasso)
        if (dadosExtraidos) {
          await updateLead(phone, { ...dadosExtraidos, status: 'em_qualificacao' })
          lead = await getLead(phone)
        }
      }

      if (resultado.tipo === 'acao') {
        const {
          acao,
          imovel_codigo,
          data: dataVisita,
          horario,
          motivo,
          dados
        } = resultado.dados || {}

        if (acao === 'AVANCAR') {
          const leadAtual = await getLead(phone)
          const novoResultado = await processarMensagem(message, historico, leadAtual, imovelOrigem)

          if (novoResultado.tipo === 'texto' && novoResultado.texto) {
            await sendMessage(phone, novoResultado.texto)
            await saveMessage(phone, 'assistant', novoResultado.texto)
          }
          return
        }

        if (acao === 'LISTAR_REGIOES') {
          const regioes = await buscarRegioes()
          let msg = `🏘️ Temos imóveis disponíveis nas seguintes regiões:\n\n`

          regioes.forEach(r => {
            const tipos = r.tipos
              .map(t => t === 'apartamento' ? 'apartamentos' : 'casas')
              .join(' e ')

            msg += `📍 *${r.bairro}* — ${r.cidade} (${tipos})\n`
          })

          msg += `\nQual dessas regiões te interessa?`

          await sendMessage(phone, msg)
          await saveMessage(phone, 'assistant', msg)
          return
        }

        if (acao === 'BUSCAR_IMOVEIS') {
          let leadAtual = await getLead(phone)

          const regiaoConfirmada = await detectarRegiaoNaMensagem(message)
          if (regiaoConfirmada) {
            await updateLead(phone, {
              bairros: [regiaoConfirmada.bairro],
              status: 'em_qualificacao'
            })
            leadAtual = await getLead(phone)
          }

          const bairroSelecionado = leadAtual.bairros?.[0]

          const filtros = {
            bairro: bairroSelecionado && bairroSelecionado !== 'Qualquer região'
              ? bairroSelecionado
              : null,
            aceita_fgts: leadAtual.modelo_compra === 'fgts_financiamento',
          }

          const imoveis = await buscarImoveis(filtros)

          if (imoveis.length === 0) {
            await updateLead(phone, {
              status: 'repassar_corretor',
              obs_corretor: `Nenhum imóvel disponível na região: ${leadAtual.bairros?.join(', ') || 'não informada'}`
            })

            await repassarParaCorretor(
              phone,
              leadAtual,
              `Nenhum imóvel disponível na região informada (${leadAtual.bairros?.join(', ') || 'não informada'})`
            )

            const regioes = await buscarRegioes()
            let msg = `Ainda não temos imóveis disponíveis nessa região. 😔\n\n`

            if (regioes.length > 0) {
              msg += `Mas temos opções incríveis em:\n`
              regioes.forEach(r => {
                msg += `📍 *${r.bairro}* — ${r.cidade}\n`
              })
              msg += `\nAlguma dessas regiões te interessaria?`
            } else {
              msg += `Um de nossos corretores vai entrar em contato com as melhores opções para você! 😊`
            }

            await sendMessage(phone, msg)
            await saveMessage(phone, 'assistant', msg)
            return
          }

          const intro = `🔍 Encontrei *${imoveis.length} imóvel(is)* disponível(is)${filtros.bairro ? ` em *${filtros.bairro}*` : ''}:\n`

          await sendMessage(phone, intro)
          await saveMessage(phone, 'assistant', intro)

          for (const imovel of imoveis) {
            const texto = await formatarImovel(imovel)
            await sendMessage(phone, texto)

            if (imovel.fotos?.length > 0) {
              await sendImage(phone, imovel.fotos[0], imovel.titulo)
            }

            await new Promise(r => setTimeout(r, 800))
          }

          const pergunta = `Gostou de algum? Me informe o código (ex: *AP-01*) para agendarmos uma visita! 😊`

          await sendMessage(phone, pergunta)
          await saveMessage(phone, 'assistant', pergunta)
          await updateLead(phone, { status: 'qualificado' })
          return
        }

        if (acao === 'ATUALIZAR_LEAD') {
          if (dados) {
            await updateLead(phone, { ...dados, status: 'em_qualificacao' })
          }

          const textoLimpo = resultado.texto?.replace(/\{[\s\S]*\}/g, '').trim()

          if (textoLimpo) {
            await sendMessage(phone, textoLimpo)
            await saveMessage(phone, 'assistant', textoLimpo)
          }
          return
        }

        if (acao === 'AGENDAR_VISITA') {
          const imovel = await buscarImovelPorCodigo(imovel_codigo)

          if (!imovel) {
            await sendMessage(phone, `Não encontrei o imóvel com esse código. Pode confirmar?`)
            return
          }

          await agendarVisita({
            leadId:   lead.id,
            imovelId: imovel.id,
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

          const notif =
            `🔔 *Nova visita agendada!*\n\n` +
            `👤 Lead: ${lead.nome || phone}\n` +
            `📱 Tel: ${phone}\n` +
            `🏠 Imóvel: ${imovel.titulo} (${imovel.codigo})\n` +
            `📅 ${new Date(dataVisita).toLocaleDateString('pt-BR')} às ${horario}`

          await sendMessage(`${process.env.TELEFONE_CORRETOR}@s.whatsapp.net`, notif)
          return
        }

        if (acao === 'REPASSAR_CORRETOR') {
          const leadAtual = await getLead(phone)

          await updateLead(phone, {
            status: 'repassar_corretor',
            obs_corretor: motivo
          })

          await repassarParaCorretor(phone, leadAtual, motivo)

          const msg =
            `Entendido! 😊 Vou conectar você com um de nossos especialistas que poderá te ajudar melhor.\n\n` +
            `Em breve um corretor entrará em contato. Até já! 🏠`

          await sendMessage(phone, msg)
          await saveMessage(phone, 'assistant', msg)

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

      if (resultado.texto) {
        await sendMessage(phone, resultado.texto)
        await saveMessage(phone, 'assistant', resultado.texto)
      }

    } catch (err) {
      console.error('Erro no webhook:', err)
    }
  })

  fastify.get('/health', async () => ({
    status: 'ok',
    ts: new Date().toISOString()
  }))
}
