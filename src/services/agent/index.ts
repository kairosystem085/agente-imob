import { createAdminClient } from "@/lib/supabase/admin";
import { chatCompletion, type ChatMessage } from "@/lib/groq";
import { sendWhatsAppText } from "@/services/evolution";

type AgentInput = { organizationId: string; organizationName: string; instanceName: string; phone: string; message: string };
type PropertyPortfolio = { title: string; property_type: string; purpose: string; price: number; district: string; city: string; bedrooms: number; area: number | null; description: string | null };

function formatPortfolio(properties: PropertyPortfolio[]) {
  if (properties.length === 0) return "Nenhum imovel ativo cadastrado no momento.";
  return properties.map((property, index) => {
    const price = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(Number(property.price));
    return `${index + 1}. ${property.title} - ${property.property_type} para ${property.purpose}, ${property.district}, ${property.city}, ${price}, ${property.bedrooms} quartos, ${property.area ?? "sem info"} m2. ${property.description ?? ""}`;
  }).join("\n");
}

function buildSystemPrompt(organizationName: string, properties: PropertyPortfolio[]) {
  return `Voce e o assistente imobiliario da ${organizationName}.

Objetivo:
- atender o lead pelo WhatsApp
- entender se busca compra ou aluguel
- perguntar regiao, orcamento e quartos
- sugerir apenas imoveis do portfolio
- quando o lead demonstrar interesse real em visita ou atendimento humano, dizer que o corretor vai chamar

Portfolio real:
${formatPortfolio(properties)}

Regras:
- mensagens curtas, naturais e em portugues brasileiro
- no maximo uma pergunta por mensagem
- nao invente imoveis
- se nao houver imovel compativel, seja honesto`;
}

function isQualified(message: string, response: string) {
  const text = `${message} ${response}`.toLowerCase();
  return ["visita", "conhecer", "tenho interesse", "quero ver", "pode marcar", "agendar", "corretor"].some((term) => text.includes(term));
}

function detectInterest(message: string) {
  const text = message.toLowerCase();
  if (text.includes("alug")) return "aluguel";
  if (text.includes("compr") || text.includes("venda")) return "compra";
  return "em qualificacao";
}

async function chooseBroker(organizationId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase.from("profiles").select("id, name, notification_phone, phone").eq("organization_id", organizationId).eq("status", "active").order("created_at", { ascending: true }).limit(1).maybeSingle();
  return data;
}

export async function processInboundMessage({ organizationId, organizationName, instanceName, phone, message }: AgentInput) {
  const supabase = createAdminClient();
  const broker = await chooseBroker(organizationId);
  const { data } = await supabase.from("properties").select("title, property_type, purpose, price, district, city, bedrooms, area, description").eq("organization_id", organizationId).eq("status", "active").order("created_at", { ascending: false }).limit(8);
  const properties = data ?? [];

  const { data: lead } = await supabase.from("leads").upsert({ organization_id: organizationId, broker_id: broker?.id ?? null, name: "Lead WhatsApp", phone, source: "whatsapp", interest: detectInterest(message), temperature: "warm", status: "new", notes: message, updated_at: new Date().toISOString() }, { onConflict: "organization_id,phone" }).select("id, status").single();
  const { data: conversation } = await supabase.from("conversations").upsert({ organization_id: organizationId, lead_id: lead?.id ?? null, broker_id: broker?.id ?? null, phone, last_message: message, last_interaction: new Date().toISOString(), status: "open" }, { onConflict: "organization_id,phone" }).select("id").single();

  if (conversation) await supabase.from("messages").insert({ organization_id: organizationId, conversation_id: conversation.id, sender_type: "lead", content: message });

  const messages: ChatMessage[] = [{ role: "system", content: buildSystemPrompt(organizationName, properties as PropertyPortfolio[]) }, { role: "user", content: message }];
  const response = await chatCompletion(messages);
  const qualified = isQualified(message, response);

  if (conversation) await supabase.from("messages").insert({ organization_id: organizationId, conversation_id: conversation.id, sender_type: "ai", content: response });

  if (lead?.id && qualified) {
    await supabase.from("leads").update({ status: "qualified", temperature: "hot", updated_at: new Date().toISOString() }).eq("id", lead.id);
    const notificationPhone = broker?.notification_phone || broker?.phone;
    if (notificationPhone) await sendWhatsAppText(instanceName, notificationPhone, `Novo lead qualificado:\nTelefone: ${phone}\nInteresse: ${detectInterest(message)}\nResumo: ${message}`);
  }

  await sendWhatsAppText(instanceName, phone, response);
  return { response, qualified };
}
