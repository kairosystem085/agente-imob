import { supabase } from '../lib/supabase.js'

export async function getHistory(phone, limit = 12) {
  const { data } = await supabase
    .from('conversas')
    .select('role, content')
    .eq('phone', phone)
    .order('criado_em', { ascending: true })
    .limit(limit)

  return data || []
}

export async function saveMessage(phone, role, content) {
  await supabase.from('conversas').insert({ phone, role, content })
}

export async function clearHistory(phone) {
  await supabase.from('conversas').delete().eq('phone', phone)
}
