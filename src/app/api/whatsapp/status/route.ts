import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError, requireBrokerContext } from "@/lib/api";
import { getConnectionState } from "@/lib/evolution";

function normalizeStatus(payload: Record<string, unknown>) {
  const state = payload.state ?? payload.instance;
  if (typeof state === "string") return state === "open" ? "open" : state === "connecting" ? "connecting" : "closed";
  if (state && typeof state === "object" && "state" in state) {
    const nestedState = (state as { state?: unknown }).state;
    if (nestedState === "open") return "open";
    if (nestedState === "connecting") return "connecting";
  }
  return "closed";
}

export async function GET() {
  const { context, response } = await requireBrokerContext();
  if (!context) return response;

  const supabase = createAdminClient();
  const { data: organization, error } = await supabase
    .from("organizations")
    .select("id, slug")
    .eq("id", context.organizationId)
    .single();

  if (error || !organization) return jsonError(error?.message ?? "Organization not found", 404);

  const payload = await getConnectionState(String(organization.slug));
  const status = normalizeStatus(payload);

  await supabase
    .from("organizations")
    .update({ instancia_status: status, updated_at: new Date().toISOString() })
    .eq("id", context.organizationId);

  return NextResponse.json({ status });
}
