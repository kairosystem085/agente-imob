export type OrganizationType = "solo_broker" | "agency" | "developer" | "enterprise";
export type Role = "owner" | "manager" | "broker";
export type LeadTemperature = "cold" | "warm" | "hot";
export type LeadStatus = "new" | "qualified" | "scheduled" | "negotiation" | "closed" | "lost";
export type PropertyStatus = "active" | "reserved" | "sold" | "rented" | "inactive";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  organizationType: OrganizationType;
  leadDistributionStrategy: "manual" | "round_robin" | "fixed_broker";
};

export type Profile = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  notificationPhone: string;
  role: Role;
  status: "active" | "inactive";
};

export type Property = {
  id: string;
  organizationId: string;
  brokerId: string;
  title: string;
  propertyType: "house" | "apartment" | "land" | "commercial";
  purpose: "sale" | "rent";
  price: number;
  city: string;
  district: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  area: number;
  featured: boolean;
  status: PropertyStatus;
};

export type Lead = {
  id: string;
  organizationId: string;
  brokerId: string;
  name: string;
  phone: string;
  source: string;
  interest: string;
  temperature: LeadTemperature;
  status: LeadStatus;
};
