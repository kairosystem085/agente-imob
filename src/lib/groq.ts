import Groq from "groq-sdk";

type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

function createGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY.");
  }

  return new Groq({ apiKey });
}

export async function chatCompletion(messages: ChatMessage[], systemPrompt: string): Promise<string> {
  const groq = createGroqClient();
  const completion = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    temperature: 0.4,
    messages: [{ role: "system", content: systemPrompt }, ...messages]
  });

  return completion.choices[0]?.message?.content?.trim() ?? "Posso te ajudar a encontrar o imovel ideal. Me conta o que voce procura?";
}
