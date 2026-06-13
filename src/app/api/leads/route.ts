import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError, requireBrokerContext } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { context, response } = await requireBrokerContext();
  if (!context) return response;

  const status = request.nextUrl.searchParams.get("status");
  const supabase = createAdminClient();
  let query = supabase
    .from("leads")
    .select("*")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ leads: data ?? [] });
}
