import type { Lead, Profile } from "@/lib/types";

export function assignLeadManually(lead: Lead, broker: Profile) {
  if (broker.status !== "active") {
    throw new Error("Broker must be active to receive leads.");
  }

  return {
    ...lead,
    brokerId: broker.id
  };
}
