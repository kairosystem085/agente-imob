import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError, requireAdminSecret } from "@/lib/api";

const createOrganizationSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  type: z.enum(["broker", "agency", "developer"]).default("broker"),
  creci: z.string().optional(),
  phone: z.string().optional()
});

export async function GET(request: NextRequest) {
  if (!requireAdminSecret(request)) return jsonError("Unauthorized", 401);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("*, brokers(id), properties(id), leads(id)")
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message, 500);

  const organizations = (data ?? []).map((organization) => ({
    ...organization,
    brokers_count: Array.isArray(organization.brokers) ? organization.brokers.length : 0,
    properties_count: Array.isArray(organization.properties) ? organization.properties.length : 0,
    leads_count: Array.isArray(organization.leads) ? organization.leads.length : 0
  }));

  return NextResponse.json({ organizations });
}

export async function POST(request: NextRequest) {
  if (!requireAdminSecret(request)) return jsonError("Unauthorized", 401);

  const body = createOrganizationSchema.safeParse(await request.json());
  if (!body.success) return jsonError("Invalid organization data", 422);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("organizations")
    .insert(body.data)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ organization: data });
}
