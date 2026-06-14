export type OrganizationType = "solo_broker" | "agency" | "developer" | "enterprise";
export type Role = "owner" | "manager" | "broker";
export type LeadTemperature = "cold" | "warm" | "hot";
export type LeadStatus = "new" | "qualified" | "scheduled" | "negotiation" | "closed" | "lost";
export type PropertyStatus = "active" | "reserved" | "sold" | "rented" | "inactive";
export type WhatsappStatus = "disconnected" | "connecting" | "connected";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  organization_type: OrganizationType;
  lead_distribution_strategy: "manual" | "round_robin" | "fixed_broker";
  phone: string | null;
  email: string | null;
};

export type Profile = {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  phone: string | null;
  notification_phone: string | null;
  role: Role;
  status: "active" | "inactive";
};

export type Property = {
  id: string;
  organization_id: string;
  broker_id: string | null;
  title: string;
  property_type: "house" | "apartment" | "land" | "commercial";
  purpose: "sale" | "rent";
  price: number;
  city: string;
  district: string;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  area: number | null;
  featured: boolean;
  status: PropertyStatus;
};

export type Lead = {
  id: string;
  organization_id: string;
  broker_id: string | null;
  name: string;
  phone: string;
  source: string | null;
  interest: string | null;
  temperature: LeadTemperature;
  status: LeadStatus;
};
