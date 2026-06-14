export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export async function chatCompletion(messages: ChatMessage[]) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return "Recebi sua mensagem. Vou te fazer algumas perguntas para entender melhor o imovel ideal.";
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL ?? "llama-3.1-8b-instant",
      messages,
      temperature: 0.4,
      max_tokens: 450
    })
  });

  if (!response.ok) {
    return "Recebi sua mensagem. Vou organizar as informacoes e um corretor vai te chamar em breve.";
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "Certo, vou continuar seu atendimento por aqui.";
}
