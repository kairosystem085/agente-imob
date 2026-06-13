import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError, requireBrokerContext } from "@/lib/api";

const updatePropertySchema = z.object({
  title: z.string().min(3).optional(),
  type: z.enum(["apartamento", "casa", "terreno", "cobertura", "sala_comercial"]).optional(),
  purpose: z.enum(["venda", "aluguel"]).optional(),
  price: z.coerce.number().nonnegative().optional(),
  neighborhood: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  area_m2: z.coerce.number().nonnegative().optional(),
  description: z.string().optional(),
  active: z.boolean().optional()
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { context, response } = await requireBrokerContext();
  if (!context) return response;

  const { id } = await params;
  const body = updatePropertySchema.safeParse(await request.json());
  if (!body.success) return jsonError("Invalid property data", 422);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .update({ ...body.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ property: data });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { context, response } = await requireBrokerContext();
  if (!context) return response;

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id)
    .eq("organization_id", context.organizationId);

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ ok: true });
}
