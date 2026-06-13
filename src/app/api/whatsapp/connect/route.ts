import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError, requireBrokerContext } from "@/lib/api";
import { createInstance, getQRCode, setWebhook } from "@/lib/evolution";

function extractQr(payload: Record<string, unknown>) {
  const qrcode = payload.qrcode;
  if (typeof qrcode === "string") return qrcode;
  if (qrcode && typeof qrcode === "object" && "base64" in qrcode) {
    const base64 = (qrcode as { base64?: unknown }).base64;
    return typeof base64 === "string" ? base64 : null;
  }
  return null;
}

export async function POST() {
  const { context, response } = await requireBrokerContext();
  if (!context) return response;

  const supabase = createAdminClient();
  const { data: organization, error } = await supabase
    .from("organizations")
    .select("id, slug")
    .eq("id", context.organizationId)
    .single();

  if (error || !organization) return jsonError(error?.message ?? "Organization not found", 404);

  const slug = String(organization.slug);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return jsonError("Missing NEXT_PUBLIC_APP_URL", 500);

  await createInstance(slug);
  await setWebhook(slug, `${appUrl.replace(/\/$/, "")}/api/webhook/${slug}`);
  const qrPayload = await getQRCode(slug);
  const qr = extractQr(qrPayload);

  await supabase
    .from("organizations")
    .update({ instancia_id: slug, instancia_status: "connecting", updated_at: new Date().toISOString() })
    .eq("id", context.organizationId);

  return NextResponse.json({ qr });
}
