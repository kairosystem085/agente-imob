import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError } from "@/lib/api";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("id, name, slug, type, creci, phone, whatsapp_number")
    .eq("slug", slug)
    .single();

  if (organizationError || !organization) return jsonError("Catalog not found", 404);

  const { data: properties, error: propertiesError } = await supabase
    .from("properties")
    .select("*")
    .eq("organization_id", organization.id)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (propertiesError) return jsonError(propertiesError.message, 500);

  return NextResponse.json({ organization, properties: properties ?? [] });
}
