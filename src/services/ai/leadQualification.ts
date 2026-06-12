import type { LeadTemperature } from "@/lib/types";

export type LeadQualificationInput = {
  budget?: number;
  desiredDistrict?: string;
  desiredBedrooms?: number;
  wantsVisit?: boolean;
};

export function qualifyLead(input: LeadQualificationInput): LeadTemperature {
  if (input.wantsVisit && input.budget && input.desiredDistrict) return "hot";
  if (input.budget || input.desiredDistrict || input.desiredBedrooms) return "warm";
  return "cold";
}
