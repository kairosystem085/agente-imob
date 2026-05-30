import Fastify    from 'fastify'
import cors       from '@fastify/cors'
import { webhookRoute } from './routes/webhook.js'

// Carregar .env em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  try {
    const { readFileSync } = await import('fs')
    const env = readFileSync('.env', 'utf8')
    env.split('\n').forEach(line => {
      const [key, ...rest] = line.split('=')
      if (key && !key.startsWith('#') && rest.length) {
        process.env[key.trim()] = rest.join('=').trim()
      }
    })
  } catch(e) {}
}

const fastify = Fastify({ logger: true })

await fastify.register(cors, { origin: true })
await fastify.register(webhookRoute)

const port = Number(process.env.PORT) || 3000

fastify.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) { console.error(err); process.exit(1) }
  console.log(`🏠 Agente imobiliário rodando na porta ${port}`)
})
