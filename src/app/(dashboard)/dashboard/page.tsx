"use client";

import Link from "next/link";
import { Building2, CalendarDays, MessageCircle, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { getActiveOrganization, loadDemoState, type DemoState } from "@/lib/demo-store";

function thisWeekCount(leads: DemoState["leads"]) {
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return leads.filter((lead) => new Date(lead.created_at) >= start).length;
}

export default function DashboardPage() {
  const [state, setState] = useState<DemoState | null>(null);

  useEffect(() => {
    setState(loadDemoState());
  }, []);

  if (!state) return <div className="p-6">Carregando...</div>;

  const organization = getActiveOrganization(state);
  const leads = state.leads.filter((lead) => lead.organization_id === organization.id);
  const properties = state.properties.filter((property) => property.organization_id === organization.id);
  const activeProperties = properties.filter((property) => property.active);
  const newLeads = leads.filter((lead) => lead.status === "novo");
  const qualifiedLeads = leads.filter((lead) => lead.status === "qualificado" || lead.status === "convertido");
  const whatsappStatus = organization.instancia_status;

  const metrics = [
    { title: "Imoveis cadastrados", value: String(properties.length), change: `${activeProperties.length} ativos`, icon: Building2 },
    { title: "Leads captados", value: String(leads.length), change: `${qualifiedLeads.length} qualificados`, icon: Users },
    { title: "Status do WhatsApp", value: whatsappStatus === "open" ? "Conectado" : "Desconectado", change: whatsappStatus === "open" ? "Agente em atendimento" : "Conecte para iniciar", icon: MessageCircle },
    { title: "Novos esta semana", value: String(thisWeekCount(leads)), change: `${newLeads.length} aguardando contato`, icon: TrendingUp },
    { title: "Visitas marcadas", value: "3", change: "Agenda interna preparada", icon: CalendarDays }
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Painel da operacao" title={organization.name} description="Acompanhe imoveis, leads e conexao do WhatsApp da sua operacao." />
      {whatsappStatus !== "open" ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Conecte seu WhatsApp para o agente comecar a responder clientes.<Link href="/whatsapp" className="ml-2 font-semibold underline">Conectar agora</Link></div> : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{metrics.map((metric) => <MetricCard key={metric.title} {...metric} />)}</section>
      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-ink">Atendimentos recentes</h2><div className="mt-4 divide-y divide-slate-100">{leads.slice(0, 6).map((lead) => <div key={lead.id} className="flex items-center justify-between py-3"><div><p className="font-medium text-ink">{lead.name ?? "Lead via WhatsApp"}</p><p className="text-sm text-slate-500">{lead.interest ?? "Interesse em avaliacao"} · {lead.phone}</p></div><span className="text-sm font-semibold text-signal">{lead.status}</span></div>)}</div></div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-ink">Imoveis ativos</h2><div className="mt-4 divide-y divide-slate-100">{activeProperties.slice(0, 6).map((property) => <div key={property.id} className="flex items-center justify-between py-3"><div><p className="font-medium text-ink">{property.title}</p><p className="text-sm text-slate-500">{property.neighborhood}, {property.city}</p></div><span className="text-sm font-semibold text-ink">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(property.price)}</span></div>)}</div></div>
      </section>
    </div>
  );
}
