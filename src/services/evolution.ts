type EvolutionInstance = { instanceName: string; phoneNumber?: string | null };

function getEvolutionConfig() {
  const baseUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  if (!baseUrl || !apiKey) return null;
  return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey };
}

async function evolutionRequest(path: string, init?: RequestInit) {
  const config = getEvolutionConfig();
  if (!config) return { ok: false, skipped: true, data: null };
  const response = await fetch(`${config.baseUrl}${path}`, { ...init, headers: { "Content-Type": "application/json", apikey: config.apiKey, ...(init?.headers ?? {}) } });
  const data = await response.json().catch(() => null);
  return { ok: response.ok, skipped: false, data };
}

export async function createOrConnectInstance({ instanceName, phoneNumber }: EvolutionInstance) {
  const create = await evolutionRequest("/instance/create", { method: "POST", body: JSON.stringify({ instanceName, qrcode: true, number: phoneNumber?.replace(/\D/g, "") || undefined, integration: "WHATSAPP-BAILEYS" }) });
  if (create.skipped) return create;
  const qrCode = create.data?.qrcode?.base64 ?? create.data?.base64 ?? create.data?.qrcode ?? null;
  return { ...create, qrCode };
}

export async function logoutInstance(instanceName: string) {
  return evolutionRequest(`/instance/logout/${instanceName}`, { method: "DELETE" });
}

export async function sendWhatsAppText(instanceName: string, to: string, text: string) {
  return evolutionRequest(`/message/sendText/${instanceName}`, { method: "POST", body: JSON.stringify({ number: to.replace(/\D/g, ""), text }) });
}
