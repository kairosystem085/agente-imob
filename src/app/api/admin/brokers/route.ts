import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError, requireAdminSecret } from "@/lib/api";

const createBrokerSchema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["owner", "manager", "broker"]).default("owner"),
  notification_phone: z.string().optional()
});

function createTempPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export async function POST(request: NextRequest) {
  if (!requireAdminSecret(request)) return jsonError("Unauthorized", 401);

  const body = createBrokerSchema.safeParse(await request.json());
  if (!body.success) return jsonError("Invalid broker data", 422);

  const supabase = createAdminClient();
  const tempPassword = createTempPassword();
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: body.data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name: body.data.name }
  });

  if (userError || !userData.user) return jsonError(userError?.message ?? "Could not create user", 500);

  const { data: broker, error: brokerError } = await supabase
    .from("brokers")
    .insert({
      organization_id: body.data.organization_id,
      user_id: userData.user.id,
      name: body.data.name,
      email: body.data.email,
      role: body.data.role,
      notification_phone: body.data.notification_phone
    })
    .select("*")
    .single();

  if (brokerError) return jsonError(brokerError.message, 500);

  return NextResponse.json({ broker, temp_password: tempPassword });
}
