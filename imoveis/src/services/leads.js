import { supabase } from '../lib/supabase.js'

export async function getOrCreateLead(phone) {
  const { data } = await supabase
    .from('leads')
    .select('*')
    .eq('phone', phone)
    .single()

  if (data) return data

  const { data: created } = await supabase
    .from('leads')
    .insert({ phone, status: 'novo' })
    .select()
    .single()

  return created
}

export async function updateLead(phone, updates) {
  const { data } = await supabase
    .from('leads')
    .update({ ...updates, atualizado_em: new Date().toISOString() })
    .eq('phone', phone)
    .select()
    .single()
  return data
}

export async function getLead(phone) {
  const { data } = await supabase
    .from('leads')
    .select('*')
    .eq('phone', phone)
    .single()
  return data
}
