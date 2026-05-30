const BASE_URL = process.env.EVOLUTION_URL
const API_KEY  = process.env.EVOLUTION_KEY
const INSTANCE = encodeURIComponent(process.env.EVOLUTION_INSTANCE)

export async function sendMessage(phone, text) {
  try {
    const res = await fetch(`${BASE_URL}/message/sendText/${INSTANCE}`, {
      method: 'POST',
      headers: { 'apikey': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: phone, text })
    })
    if (!res.ok) console.error('Erro ao enviar:', await res.text())
  } catch (e) {
    console.error('sendMessage error:', e)
  }
}

export async function sendImage(phone, imageUrl, caption = '') {
  try {
    await fetch(`${BASE_URL}/message/sendMedia/${INSTANCE}`, {
      method: 'POST',
      headers: { 'apikey': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number: phone,
        mediatype: 'image',
        media: imageUrl,
        caption
      })
    })
  } catch (e) {
    console.error('sendImage error:', e)
  }
}
