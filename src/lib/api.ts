import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type BrokerContext = {
  userId: string;
  organizationId: string;
  role: "owner" | "manager" | "broker";
};

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function requireAdminSecret(request: NextRequest) {
  const expectedSecret = process.env.ADMIN_SECRET;
  const receivedSecret = request.headers.get("x-admin-secret") ?? request.cookies.get("admin_auth")?.value;

  if (!expectedSecret || receivedSecret !== expectedSecret) {
    return false;
  }

  return true;
}

export async function getBrokerContext(): Promise<BrokerContext | null> {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) return null;

  const { data: broker } = await admin
    .from("brokers")
    .select("organization_id, role")
    .eq("user_id", userData.user.id)
    .single();

  if (!broker) return null;

  const role = String(broker.role) as BrokerContext["role"];

  return {
    userId: userData.user.id,
    organizationId: String(broker.organization_id),
    role
  };
}

export async function requireBrokerContext() {
  const context = await getBrokerContext();

  if (!context) {
    return { context: null, response: jsonError("Unauthorized", 401) };
  }

  return { context, response: null };
}
