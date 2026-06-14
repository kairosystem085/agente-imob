"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { getActiveOrganization, loadDemoState, saveDemoState, type DemoLead, type DemoState } from "@/lib/demo-store";

const statuses: DemoLead["status"][] = ["novo", "em_qualificacao", "qualificado", "convertido"];
const statusClass: Record<string, string> = { novo: "bg-slate-100 text-slate-700", em_qualificacao: "bg-amber-100 text-amber-800", qualificado: "bg-emerald-100 text-emerald-800", convertido: "bg-blue-100 text-blue-800" };

export default function LeadsPage() {
  const [state, setState] = useState<DemoState | null>(null);
  useEffect(() => setState(loadDemoState()), []);
  if (!state) return <div className="p-6">Carregando...</div>;

  const organization = getActiveOrganization(state);
  const leads = state.leads.filter((lead) => lead.organization_id === organization.id);

  function updateStatus(id: string, status: DemoLead["status"]) {
    const nextState = { ...state, leads: state.leads.map((lead) => lead.id === id ? { ...lead, status } : lead) };
    setState(nextState);
    saveDemoState(nextState);
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pipeline" title="Leads" description="Acompanhe os contatos captados pelo WhatsApp e mova cada oportunidade pelo funil." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{statuses.map((status) => <section key={status} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">{status.replace("_", " ")}</h2><div className="mt-4 space-y-3">{leads.filter((lead) => lead.status === status).map((lead) => <article key={lead.id} className="rounded-md border border-slate-200 p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-ink">{lead.name ?? "Lead via WhatsApp"}</p><a href={`https://wa.me/${lead.phone}`} className="text-sm text-signal">{lead.phone}</a></div><span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[lead.status]}`}>{lead.status}</span></div><p className="mt-3 text-sm text-slate-600">{lead.interest ?? "Interesse em avaliacao"}</p><p className="mt-1 text-sm text-slate-500">{lead.region ?? "Regiao nao informada"}</p>{lead.budget ? <p className="mt-2 text-sm font-semibold text-ink">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(lead.budget)}</p> : null}<select value={lead.status} onChange={(event) => updateStatus(lead.id, event.target.value as DemoLead["status"])} className="mt-3 h-9 w-full rounded-md border border-slate-200 px-2 text-sm"><option value="novo">novo</option><option value="em_qualificacao">em qualificacao</option><option value="qualificado">qualificado</option><option value="convertido">convertido</option></select></article>)}</div></section>)}</div>
    </div>
  );
}
