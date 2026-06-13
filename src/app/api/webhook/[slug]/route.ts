import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendText } from "@/lib/evolution";
import { processMessage } from "@/services/agent";

type EvolutionPayload = Record<string, unknown>;

function getNestedRecord(value: unknown, key: string): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  const nested = (value as Record<string, unknown>)[key];
  return nested && typeof nested === "object" ? (nested as Record<string, unknown>) : null;
}

function extractText(payload: EvolutionPayload) {
  const data = getNestedRecord(payload, "data") ?? payload;
  const message = getNestedRecord(data, "message");
  const conversation = message?.conversation;
  if (typeof conversation === "string") return conversation;

  const extendedTextMessage = getNestedRecord(message, "extendedTextMessage");
  const text = extendedTextMessage?.text;
  if (typeof text === "string") return text;

  return null;
}

function extractPhone(payload: EvolutionPayload) {
  const data = getNestedRecord(payload, "data") ?? payload;
  const key = getNestedRecord(data, "key");
  const remoteJid = key?.remoteJid ?? data.remoteJid ?? data.from;
  if (typeof remoteJid !== "string") return null;
  return remoteJid.replace(/@s\.whatsapp\.net|@c\.us/g, "");
}

function isFromMe(payload: EvolutionPayload) {
  const data = getNestedRecord(payload, "data") ?? payload;
  const key = getNestedRecord(data, "key");
  return key?.fromMe === true || data.fromMe === true;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const payload = (await request.json()) as EvolutionPayload;

    if (isFromMe(payload)) return NextResponse.json({ ok: true });

    const text = extractText(payload);
    const phone = extractPhone(payload);

    if (!text || !phone) return NextResponse.json({ ok: true });

    const supabase = createAdminClient();
    const { data: organization } = await supabase
      .from("organizations")
      .select("id, name, slug")
      .eq("slug", slug)
      .single();

    if (!organization) return NextResponse.json({ ok: true });

    const response = await processMessage({
      organizationId: String(organization.id),
      organizationName: String(organization.name),
      phone,
      message: text,
      slug
    });

    await sendText(slug, phone, response);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Evolution webhook failed", error);
    return NextResponse.json({ ok: true });
  }
}
