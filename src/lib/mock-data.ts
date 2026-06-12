import type { Lead, Organization, Profile, Property } from "./types";

export const organization: Organization = {
  id: "org_001",
  name: "Joao Corretor",
  slug: "joao-corretor",
  organizationType: "solo_broker",
  leadDistributionStrategy: "manual"
};

export const brokers: Profile[] = [
  {
    id: "broker_001",
    organizationId: organization.id,
    name: "Joao Mendes",
    email: "joao@imobia.app",
    phone: "+5585999990001",
    notificationPhone: "+5585999990001",
    role: "owner",
    status: "active"
  },
  {
    id: "broker_002",
    organizationId: organization.id,
    name: "Marina Lopes",
    email: "marina@imobia.app",
    phone: "+5585999990002",
    notificationPhone: "+5585999990002",
    role: "broker",
    status: "active"
  },
  {
    id: "broker_003",
    organizationId: organization.id,
    name: "Rafael Lima",
    email: "rafael@imobia.app",
    phone: "+5585999990003",
    notificationPhone: "+5585999990003",
    role: "broker",
    status: "active"
  }
];

export const properties: Property[] = [
  {
    id: "property_001",
    organizationId: organization.id,
    brokerId: "broker_001",
    title: "Apartamento vista mar no Meireles",
    propertyType: "apartment",
    purpose: "sale",
    price: 740000,
    city: "Fortaleza",
    district: "Meireles",
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    area: 112,
    featured: true,
    status: "active"
  },
  {
    id: "property_002",
    organizationId: organization.id,
    brokerId: "broker_002",
    title: "Casa duplex em condominio",
    propertyType: "house",
    purpose: "sale",
    price: 980000,
    city: "Eusebio",
    district: "Centro",
    bedrooms: 4,
    bathrooms: 5,
    parkingSpaces: 4,
    area: 245,
    featured: true,
    status: "active"
  },
  {
    id: "property_003",
    organizationId: organization.id,
    brokerId: "broker_003",
    title: "Studio mobiliado para aluguel",
    propertyType: "apartment",
    purpose: "rent",
    price: 2800,
    city: "Fortaleza",
    district: "Aldeota",
    bedrooms: 1,
    bathrooms: 1,
    parkingSpaces: 1,
    area: 42,
    featured: false,
    status: "active"
  }
];

export const leads: Lead[] = [
  {
    id: "lead_001",
    organizationId: organization.id,
    brokerId: "broker_001",
    name: "Ana Paula",
    phone: "+5585988880001",
    source: "WhatsApp",
    interest: "Apartamento ate R$ 750 mil no Meireles",
    temperature: "hot",
    status: "qualified"
  },
  {
    id: "lead_002",
    organizationId: organization.id,
    brokerId: "broker_002",
    name: "Carlos Henrique",
    phone: "+5585988880002",
    source: "Catalogo publico",
    interest: "Casa em condominio no Eusebio",
    temperature: "warm",
    status: "scheduled"
  },
  {
    id: "lead_003",
    organizationId: organization.id,
    brokerId: "broker_003",
    name: "Beatriz Rocha",
    phone: "+5585988880003",
    source: "Instagram",
    interest: "Aluguel mobiliado na Aldeota",
    temperature: "cold",
    status: "new"
  }
];

export const dashboardSeries = [
  { day: "Seg", leads: 8, visits: 2 },
  { day: "Ter", leads: 12, visits: 4 },
  { day: "Qua", leads: 15, visits: 5 },
  { day: "Qui", leads: 11, visits: 3 },
  { day: "Sex", leads: 18, visits: 6 },
  { day: "Sab", leads: 10, visits: 4 }
];
