import { supabase } from '../lib/supabase.js'

export async function agendarVisita({ leadId, imovelId, phone, dataVisita, horario, corretor }) {
  const { data } = await supabase
    .from('visitas')
    .insert({
      lead_id:     leadId,
      imovel_id:   imovelId,
      phone,
      data_visita: dataVisita,
      horario,
      corretor:    corretor || process.env.TELEFONE_CORRETOR,
      status:      'agendada'
    })
    .select()
    .single()

  return data
}
