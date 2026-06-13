import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError, requireBrokerContext } from "@/lib/api";

const updateLeadSchema = z.object({
  status: z.enum(["novo", "em_qualificacao", "qualificado", "convertido"]).optional(),
  name: z.string().min(2).optional(),
  budget: z.coerce.number().nonnegative().optional(),
  region: z.string().optional(),
  interest: z.enum(["compra", "aluguel"]).optional(),
  bedrooms_wanted: z.coerce.number().int().nonnegative().optional()
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { context, response } = await requireBrokerContext();
  if (!context) return response;

  const { id } = await params;
  const body = updateLeadSchema.safeParse(await request.json());
  if (!body.success) return jsonError("Invalid lead data", 422);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .update({ ...body.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ lead: data });
}
