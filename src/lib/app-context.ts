import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppProfile = {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  phone: string | null;
  notification_phone: string | null;
  role: "owner" | "manager" | "broker";
  status: string;
};

export type AppOrganization = {
  id: string;
  name: string;
  slug: string;
  organization_type: "solo_broker" | "agency" | "developer" | "enterprise";
  lead_distribution_strategy: "manual" | "round_robin" | "fixed_broker";
  phone: string | null;
  email: string | null;
};

export async function getAppContext() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profileData) redirect("/login?missingProfile=1");

  const profile = profileData as AppProfile;
  const { data: organizationData, error: organizationError } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.organization_id)
    .single();

  if (organizationError) throw organizationError;
  const organization = organizationData as AppOrganization;

  return { supabase, user, profile, organization };
}
