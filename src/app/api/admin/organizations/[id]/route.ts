import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError, requireAdminSecret } from "@/lib/api";

const updateOrganizationSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/).optional(),
  plan: z.enum(["active", "setup", "paused"]).optional()
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdminSecret(request)) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const body = updateOrganizationSchema.safeParse(await request.json());
  if (!body.success) return jsonError("Invalid organization data", 422);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("organizations")
    .update({ ...body.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ organization: data });
}
