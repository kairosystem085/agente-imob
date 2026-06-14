import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processInboundMessage } from "@/services/agent";

function getPayloadText(payload: Record<string, unknown>) {
  const data = payload.data as Record<string, unknown> | undefined;
  const message = data?.message as Record<string, unknown> | undefined;
  const conversation = message?.conversation;
  const extended = message?.extendedTextMessage as Record<string, unknown> | undefined;
  return String(conversation || extended?.text || payload.message || "").trim();
}

function getPayloadPhone(payload: Record<string, unknown>) {
  const data = payload.data as Record<string, unknown> | undefined;
  const key = data?.key as Record<string, unknown> | undefined;
  const remoteJid = String(key?.remoteJid || payload.remoteJid || "");
  return remoteJid.replace(/@s\.whatsapp\.net|@c\.us/g, "").replace(/\D/g, "");
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.EVOLUTION_WEBHOOK_SECRET;
  if (webhookSecret && request.headers.get("x-imobia-secret") !== webhookSecret) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const payload = await request.json();
  const payloadData = payload.data as Record<string, unknown> | undefined;
  const instanceName = String(payload.instance || payload.instanceName || payloadData?.instanceId || "");
  const text = getPayloadText(payload);
  const phone = getPayloadPhone(payload);

  if (!instanceName || !text || !phone) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const supabase = createAdminClient();
  const { data: instance } = await supabase
    .from("whatsapp_instances")
    .select("organization_id, instance_name")
    .eq("instance_name", instanceName)
    .maybeSingle();

  if (!instance) {
    return NextResponse.json({ ok: true, ignored: true, reason: "instance_not_found" });
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", instance.organization_id)
    .maybeSingle();

  const result = await processInboundMessage({
    organizationId: instance.organization_id,
    organizationName: organization?.name ?? "ImobIA",
    instanceName: instance.instance_name,
    phone,
    message: text
  });

  return NextResponse.json({ ok: true, ...result });
}
