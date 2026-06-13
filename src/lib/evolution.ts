type JsonRecord = Record<string, unknown>;

type EvolutionResponse<T> = Promise<T>;

function getEvolutionConfig() {
  const baseUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("Missing Evolution API environment variables.");
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    apiKey
  };
}

async function evolutionFetch<T>(path: string, init: RequestInit = {}): EvolutionResponse<T> {
  const { baseUrl, apiKey } = getEvolutionConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
      ...(init.headers ?? {})
    }
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : ({} as T);

  if (!response.ok) {
    throw new Error(`Evolution API error ${response.status}: ${text}`);
  }

  return data;
}

export function createInstance(slug: string) {
  return evolutionFetch<JsonRecord>("/instance/create", {
    method: "POST",
    body: JSON.stringify({ instanceName: slug, qrcode: true })
  });
}

export function getQRCode(slug: string) {
  return evolutionFetch<JsonRecord>(`/instance/connect/${slug}`);
}

export function getConnectionState(slug: string) {
  return evolutionFetch<JsonRecord>(`/instance/connectionState/${slug}`);
}

export function deleteInstance(slug: string) {
  return evolutionFetch<JsonRecord>(`/instance/delete/${slug}`, { method: "DELETE" });
}

export function setWebhook(slug: string, url: string) {
  return evolutionFetch<JsonRecord>(`/webhook/set/${slug}`, {
    method: "POST",
    body: JSON.stringify({
      url,
      webhook_by_events: false,
      events: ["MESSAGES_UPSERT"]
    })
  });
}

export function sendText(slug: string, number: string, text: string) {
  return evolutionFetch<JsonRecord>(`/message/sendText/${slug}`, {
    method: "POST",
    body: JSON.stringify({ number, text })
  });
}
