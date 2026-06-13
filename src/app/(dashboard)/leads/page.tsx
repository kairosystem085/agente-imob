"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";

type Lead = {
  id: string;
  name: string | null;
  phone: string;
  interest: string | null;
  budget: number | null;
  region: string | null;
  status: string;
  created_at: string;
};

type LeadsResponse = { leads: Lead[] };

async function fetchLeads() {
  const response = await fetch("/api/leads");
  if (!response.ok) throw new Error("Could not load leads");
  return response.json() as Promise<LeadsResponse>;
}

const statusClass: Record<string, string> = {
  novo: "bg-slate-100 text-slate-700",
  em_qualificacao: "bg-amber-100 text-amber-800",
  qualificado: "bg-emerald-100 text-emerald-800",
  convertido: "bg-blue-100 text-blue-800"
};

export default function LeadsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["leads"], queryFn: fetchLeads });
  const leads = data?.leads ?? [];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pipeline" title="Leads" description="Acompanhe os contatos captados pelo WhatsApp e atualize o status de cada oportunidade." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["novo", "em_qualificacao", "qualificado", "convertido"].map((status) => (
          <section key={status} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">{status.replace("_", " ")}</h2>
            <div className="mt-4 space-y-3">
              {leads.filter((lead) => lead.status === status).map((lead) => (
                <article key={lead.id} className="rounded-md border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{lead.name ?? "Lead via WhatsApp"}</p>
                      <a href={`https://wa.me/${lead.phone}`} className="text-sm text-signal">{lead.phone}</a>
                    </div>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[lead.status] ?? statusClass.novo}`}>{lead.status}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{lead.interest ?? "Interesse em avaliacao"}</p>
                  <p className="mt-1 text-sm text-slate-500">{lead.region ?? "Regiao nao informada"}</p>
                  {lead.budget ? <p className="mt-2 text-sm font-semibold text-ink">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(lead.budget)}</p> : null}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
      {!isLoading && leads.length === 0 ? <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Nenhum lead captado ainda.</div> : null}
    </div>
  );
}
