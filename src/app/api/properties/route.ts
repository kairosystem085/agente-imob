import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError, requireBrokerContext } from "@/lib/api";

const createPropertySchema = z.object({
  title: z.string().min(3),
  type: z.enum(["apartamento", "casa", "terreno", "cobertura", "sala_comercial"]).default("apartamento"),
  purpose: z.enum(["venda", "aluguel"]).default("venda"),
  price: z.coerce.number().nonnegative(),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  area_m2: z.coerce.number().nonnegative().optional(),
  description: z.string().optional()
});

export async function GET() {
  const { context, response } = await requireBrokerContext();
  if (!context) return response;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ properties: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { context, response } = await requireBrokerContext();
  if (!context) return response;

  const body = createPropertySchema.safeParse(await request.json());
  if (!body.success) return jsonError("Invalid property data", 422);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .insert({ ...body.data, organization_id: context.organizationId })
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ property: data });
}
