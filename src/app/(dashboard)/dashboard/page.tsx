"use client";

import Link from "next/link";
import { Building2, CalendarDays, MessageCircle, TrendingUp, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";

type Lead = {
  id: string;
  name: string | null;
  phone: string;
  interest: string | null;
  status: string;
  created_at: string;
};

type Property = {
  id: string;
  title: string;
  neighborhood: string;
  city: string;
  price: number;
  active: boolean;
};

type LeadsResponse = { leads: Lead[] };
type PropertiesResponse = { properties: Property[] };
type WhatsappStatusResponse = { status: string };

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Request failed");
  return response.json() as Promise<T>;
}

function thisWeekCount(leads: Lead[]) {
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return leads.filter((lead) => new Date(lead.created_at) >= start).length;
}

export default function DashboardPage() {
  const leadsQuery = useQuery({ queryKey: ["leads"], queryFn: () => fetchJson<LeadsResponse>("/api/leads") });
  const propertiesQuery = useQuery({ queryKey: ["properties"], queryFn: () => fetchJson<PropertiesResponse>("/api/properties") });
  const whatsappQuery = useQuery({ queryKey: ["whatsapp-status"], queryFn: () => fetchJson<WhatsappStatusResponse>("/api/whatsapp/status"), retry: false });

  const leads = leadsQuery.data?.leads ?? [];
  const properties = propertiesQuery.data?.properties ?? [];
  const activeProperties = properties.filter((property) => property.active);
  const newLeads = leads.filter((lead) => lead.status === "novo");
  const qualifiedLeads = leads.filter((lead) => lead.status === "qualificado" || lead.status === "convertido");
  const whatsappStatus = whatsappQuery.data?.status ?? "closed";

  const metrics = [
    { title: "Imoveis cadastrados", value: String(properties.length), change: `${activeProperties.length} ativos`, icon: Building2 },
    { title: "Leads captados", value: String(leads.length), change: `${qualifiedLeads.length} qualificados`, icon: Users },
    { title: "Status do WhatsApp", value: whatsappStatus === "open" ? "Conectado" : "Desconectado", change: whatsappStatus === "open" ? "Agente em atendimento" : "Conecte para iniciar", icon: MessageCircle },
    { title: "Novos esta semana", value: String(thisWeekCount(leads)), change: `${newLeads.length} aguardando contato`, icon: TrendingUp },
    { title: "Visitas marcadas", value: "0", change: "Agenda interna preparada", icon: CalendarDays }
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Painel da operacao" title="Atendimento imobiliario" description="Acompanhe imoveis, leads e conexao do WhatsApp da sua operacao." />

      {whatsappStatus !== "open" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Conecte seu WhatsApp para o agente comecar a responder clientes.
          <Link href="/whatsapp" className="ml-2 font-semibold underline">Conectar agora</Link>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => <MetricCard key={metric.title} {...metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Atendimentos recentes</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {leads.slice(0, 6).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-ink">{lead.name ?? "Lead via WhatsApp"}</p>
                  <p className="text-sm text-slate-500">{lead.interest ?? "Interesse em avaliacao"} · {lead.phone}</p>
                </div>
                <span className="text-sm font-semibold text-signal">{lead.status}</span>
              </div>
            ))}
            {leads.length === 0 ? <p className="py-8 text-sm text-slate-500">Nenhum lead captado ainda.</p> : null}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Imoveis ativos</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {activeProperties.slice(0, 6).map((property) => (
              <div key={property.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-ink">{property.title}</p>
                  <p className="text-sm text-slate-500">{property.neighborhood}, {property.city}</p>
                </div>
                <span className="text-sm font-semibold text-ink">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(property.price)}
                </span>
              </div>
            ))}
            {activeProperties.length === 0 ? <p className="py-8 text-sm text-slate-500">Nenhum imovel ativo cadastrado.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
