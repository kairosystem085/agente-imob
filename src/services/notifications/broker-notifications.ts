import type { Lead, Profile } from "@/lib/types";

export function buildNewLeadNotification(lead: Lead, broker: Profile) {
  return {
    to: broker.notificationPhone,
    type: lead.temperature === "hot" ? "hot_lead" : "new_lead",
    title: lead.temperature === "hot" ? "Lead quente recebido" : "Novo lead recebido",
    message: `${lead.name} demonstrou interesse: ${lead.interest}`
  };
}
