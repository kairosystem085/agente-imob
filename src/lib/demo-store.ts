export type DemoOrganization = {
  id: string;
  name: string;
  slug: string;
  type: "broker" | "agency" | "developer";
  creci: string;
  phone: string;
  whatsapp_number: string;
  plan: "active" | "setup" | "paused";
  instancia_status: "open" | "connecting" | "closed";
};

export type DemoBroker = {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "broker";
  notification_phone: string;
  temp_password: string;
};

export type DemoProperty = {
  id: string;
  organization_id: string;
  title: string;
  type: string;
  purpose: string;
  price: number;
  neighborhood: string;
  city: string;
  bedrooms: number | null;
  area_m2: number | null;
  description: string;
  photos: string[];
  active: boolean;
  created_at: string;
};

export type DemoLead = {
  id: string;
  organization_id: string;
  name: string | null;
  phone: string;
  interest: "compra" | "aluguel" | null;
  budget: number | null;
  region: string | null;
  bedrooms_wanted: number | null;
  status: "novo" | "em_qualificacao" | "qualificado" | "convertido";
  source: string;
  created_at: string;
};

export type DemoState = {
  organizations: DemoOrganization[];
  brokers: DemoBroker[];
  properties: DemoProperty[];
  leads: DemoLead[];
  activeOrganizationId: string;
};

const key = "imobia-demo-state-v1";
const now = new Date().toISOString();

export const initialDemoState: DemoState = {
  activeOrganizationId: "org-joao",
  organizations: [
    {
      id: "org-joao",
      name: "Joao Corretor",
      slug: "joao-corretor",
      type: "broker",
      creci: "CRECI 00000",
      phone: "+55 85 99999-0001",
      whatsapp_number: "+55 85 99999-0001",
      plan: "active",
      instancia_status: "open"
    },
    {
      id: "org-alfa",
      name: "Imobiliaria Alfa",
      slug: "imobiliaria-alfa",
      type: "agency",
      creci: "CRECI 12345-J",
      phone: "+55 85 99999-0000",
      whatsapp_number: "+55 85 99999-0000",
      plan: "setup",
      instancia_status: "connecting"
    }
  ],
  brokers: [
    { id: "broker-1", organization_id: "org-joao", name: "Joao Mendes", email: "joao@imobia.app", role: "owner", notification_phone: "+55 85 99999-0001", temp_password: "demo1234" },
    { id: "broker-2", organization_id: "org-alfa", name: "Marina Lopes", email: "marina@imobia.app", role: "owner", notification_phone: "+55 85 99999-0002", temp_password: "demo1234" }
  ],
  properties: [
    { id: "prop-1", organization_id: "org-joao", title: "Apartamento vista mar no Meireles", type: "apartamento", purpose: "venda", price: 740000, neighborhood: "Meireles", city: "Fortaleza", bedrooms: 3, area_m2: 112, description: "Apartamento pronto para morar, com varanda e vista mar.", photos: [], active: true, created_at: now },
    { id: "prop-2", organization_id: "org-joao", title: "Studio mobiliado na Aldeota", type: "apartamento", purpose: "aluguel", price: 2800, neighborhood: "Aldeota", city: "Fortaleza", bedrooms: 1, area_m2: 42, description: "Studio compacto perto de servicos e restaurantes.", photos: [], active: true, created_at: now },
    { id: "prop-3", organization_id: "org-alfa", title: "Casa duplex em condominio", type: "casa", purpose: "venda", price: 980000, neighborhood: "Centro", city: "Eusebio", bedrooms: 4, area_m2: 245, description: "Casa ampla com area gourmet e quatro suites.", photos: [], active: true, created_at: now }
  ],
  leads: [
    { id: "lead-1", organization_id: "org-joao", name: "Ana Paula", phone: "5585988880001", interest: "compra", budget: 750000, region: "Meireles", bedrooms_wanted: 3, status: "qualificado", source: "whatsapp", created_at: now },
    { id: "lead-2", organization_id: "org-joao", name: "Carlos Henrique", phone: "5585988880002", interest: "aluguel", budget: 3200, region: "Aldeota", bedrooms_wanted: 1, status: "em_qualificacao", source: "catalogo", created_at: now },
    { id: "lead-3", organization_id: "org-alfa", name: null, phone: "5585988880003", interest: "compra", budget: 1000000, region: "Eusebio", bedrooms_wanted: 4, status: "novo", source: "whatsapp", created_at: now }
  ]
};

function cloneState(state: DemoState): DemoState {
  return JSON.parse(JSON.stringify(state)) as DemoState;
}

export function loadDemoState(): DemoState {
  if (typeof window === "undefined") return cloneState(initialDemoState);

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    saveDemoState(initialDemoState);
    return cloneState(initialDemoState);
  }

  try {
    return JSON.parse(raw) as DemoState;
  } catch {
    saveDemoState(initialDemoState);
    return cloneState(initialDemoState);
  }
}

export function saveDemoState(state: DemoState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(state));
  window.dispatchEvent(new Event("imobia-demo-updated"));
}

export function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createTempPassword() {
  return Math.random().toString(36).slice(2, 10);
}

export function getActiveOrganization(state: DemoState) {
  return state.organizations.find((organization) => organization.id === state.activeOrganizationId) ?? state.organizations[0];
}
