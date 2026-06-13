import { createAdminClient } from "@/lib/supabase/admin";
import { chatCompletion, type ChatMessage } from "@/lib/groq";

export type AgentInput = {
  organizationId: string;
  organizationName: string;
  phone: string;
  message: string;
  slug: string;
};

type PropertyPortfolio = {
  title: string;
  type: string;
  purpose: string;
  price: number;
  neighborhood: string;
  city: string;
  bedrooms: number | null;
  area_m2: number | null;
  description: string | null;
};

type ConversationEntry = ChatMessage & {
  created_at: string;
};

function asConversationHistory(value: unknown): ConversationEntry[] {
  if (!Array.isArray(value)) return [];

  return value.filter((entry): entry is ConversationEntry => {
    if (!entry || typeof entry !== "object") return false;
    const candidate = entry as Partial<ConversationEntry>;
    return (
      (candidate.role === "user" || candidate.role === "assistant") &&
      typeof candidate.content === "string" &&
      typeof candidate.created_at === "string"
    );
  });
}

function formatPortfolio(properties: PropertyPortfolio[]) {
  if (properties.length === 0) return "Nenhum imovel ativo cadastrado no momento.";

  return properties
    .map((property, index) => {
      const price = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0
      }).format(Number(property.price));

      return `${index + 1}. ${property.title} - ${property.type} para ${property.purpose}, ${property.neighborhood}, ${property.city}, ${price}, ${property.bedrooms ?? "sem info"} quartos, ${property.area_m2 ?? "sem info"} m2. ${property.description ?? ""}`;
    })
    .join("\n");
}

function buildSystemPrompt(organizationName: string, properties: PropertyPortfolio[]) {
  return `Voce e um assistente imobiliario inteligente do corretor/imobiliaria ${organizationName}.

Seu objetivo e qualificar o cliente e apresentar imoveis do portfolio de forma natural.

PORTFOLIO DISPONIVEL:
${formatPortfolio(properties)}

ETAPAS:
1. Cumprimente e pergunte o nome
2. Entenda: compra ou aluguel?
3. Orcamento disponivel?
4. Regiao/bairro preferido?
5. Quantidade de quartos?
6. Apresente os imoveis mais compativeis
7. Se demonstrar interesse em visita, diga que o corretor vai entrar em contato em breve

REGRAS:
- Maximo 1 pergunta por mensagem
- Mensagens curtas no estilo WhatsApp
- Nunca invente imoveis que nao estao no portfolio
- Sempre em portugues brasileiro
- Se nao houver imoveis compativeis, seja honesto`;
}

function detectQualifiedLead(message: string, response: string) {
  const text = `${message} ${response}`.toLowerCase();
  return ["visita", "conhecer", "tenho interesse", "quero ver", "pode marcar", "agendar"].some((term) => text.includes(term));
}

function detectInterest(message: string) {
  const text = message.toLowerCase();
  if (text.includes("alug")) return "aluguel";
  if (text.includes("compr") || text.includes("venda")) return "compra";
  return null;
}

function extractBudget(message: string) {
  const match = message.match(/(?:r\$\s*)?(\d{2,3}(?:[\.,]?\d{3})+|\d{4,})/i);
  if (!match) return null;
  return Number(match[1].replace(/\./g, "").replace(",", "."));
}

export async function processMessage({ organizationId, organizationName, phone, message }: AgentInput): Promise<string> {
  const supabase = createAdminClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("history")
    .eq("organization_id", organizationId)
    .eq("phone", phone)
    .maybeSingle();

  const { data: properties } = await supabase
    .from("properties")
    .select("title, type, purpose, price, neighborhood, city, bedrooms, area_m2, description")
    .eq("organization_id", organizationId)
    .eq("active", true)
    .order("created_at", { ascending: false });

  const history = asConversationHistory(conversation?.history);
  const now = new Date().toISOString();
  const userEntry: ConversationEntry = { role: "user", content: message, created_at: now };
  const updatedHistory: ConversationEntry[] = [...history, userEntry].slice(-20);

  const systemPrompt = buildSystemPrompt(organizationName, (properties ?? []) as PropertyPortfolio[]);
  const response = await chatCompletion(
    updatedHistory.map(({ role, content }) => ({ role, content })),
    systemPrompt
  );

  const assistantEntry: ConversationEntry = {
    role: "assistant",
    content: response,
    created_at: new Date().toISOString()
  };
  const finalHistory: ConversationEntry[] = [...updatedHistory, assistantEntry].slice(-20);

  await supabase.from("conversations").upsert({
    organization_id: organizationId,
    phone,
    history: finalHistory,
    stage: detectQualifiedLead(message, response) ? "qualificado" : "em_qualificacao",
    updated_at: new Date().toISOString()
  }, { onConflict: "organization_id,phone" });

  if (detectQualifiedLead(message, response)) {
    await supabase.from("leads").upsert({
      organization_id: organizationId,
      phone,
      interest: detectInterest(message),
      budget: extractBudget(message),
      status: "qualificado",
      source: "whatsapp",
      updated_at: new Date().toISOString()
    }, { onConflict: "organization_id,phone" });
  }

  return response;
}
