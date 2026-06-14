import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function isAuthorized(request: NextRequest) {
  const expectedSecret = process.env.ADMIN_SECRET;
  const secretFromCookie = request.cookies.get("admin_auth")?.value;
  return Boolean(expectedSecret && secretFromCookie === expectedSecret);
}

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = String(body.phone ?? "").trim();
  const slug = slugify(String(body.slug || name));
  const organizationType = body.organization_type === "solo_broker" ? "solo_broker" : "agency";
  const ownerName = String(body.owner_name || name).trim();
  const password = String(body.password ?? "").trim();

  if (!name || !email || !slug || password.length < 6) return NextResponse.json({ error: "Preencha nome, email, slug e senha com pelo menos 6 caracteres." }, { status: 400 });

  const supabase = createAdminClient();
  const { data: organization, error: organizationError } = await supabase.from("organizations").insert({ name, slug, organization_type: organizationType, phone, email, business_hours: {}, lead_distribution_strategy: "manual" }).select("id, name, slug").single();
  if (organizationError) return NextResponse.json({ error: organizationError.message }, { status: 400 });

  const { data: createdUser, error: userError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name: ownerName, organization_id: organization.id } });
  if (userError || !createdUser.user) { await supabase.from("organizations").delete().eq("id", organization.id); return NextResponse.json({ error: userError?.message ?? "Nao foi possivel criar o usuario." }, { status: 400 }); }

  const { error: profileError } = await supabase.from("profiles").insert({ id: createdUser.user.id, organization_id: organization.id, name: ownerName, email, phone, notification_phone: phone, role: "owner", status: "active" });
  if (profileError) { await supabase.auth.admin.deleteUser(createdUser.user.id); await supabase.from("organizations").delete().eq("id", organization.id); return NextResponse.json({ error: profileError.message }, { status: 400 }); }

  return NextResponse.json({ organization, user: { id: createdUser.user.id, email }, login_url: "/login" });
}
