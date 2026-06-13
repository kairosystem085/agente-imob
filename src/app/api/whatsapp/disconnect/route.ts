import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError, requireBrokerContext } from "@/lib/api";
import { deleteInstance } from "@/lib/evolution";

export async function DELETE() {
  const { context, response } = await requireBrokerContext();
  if (!context) return response;

  const supabase = createAdminClient();
  const { data: organization, error } = await supabase
    .from("organizations")
    .select("id, slug")
    .eq("id", context.organizationId)
    .single();

  if (error || !organization) return jsonError(error?.message ?? "Organization not found", 404);

  await deleteInstance(String(organization.slug));

  await supabase
    .from("organizations")
    .update({ instancia_id: null, instancia_status: null, updated_at: new Date().toISOString() })
    .eq("id", context.organizationId);

  return NextResponse.json({ ok: true });
}
