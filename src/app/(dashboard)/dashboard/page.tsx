import Link from "next/link";
import { Building2, CalendarDays, MessageCircle, TrendingUp, Users } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { getAppContext } from "@/lib/app-context";
import { formatCurrency } from "@/lib/formatters";

export default async function DashboardPage() {
  const { supabase, profile, organization } = await getAppContext();
  const canSeeAll = profile.role === "owner" || profile.role === "manager";

  let propertiesQuery = supabase
    .from("properties")
    .select("id, title, price, city, district, status")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  let leadsQuery = supabase
    .from("leads")
    .select("id, name, phone, interest, temperature, status, created_at")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  if (!canSeeAll) {
    propertiesQuery = propertiesQuery.eq("broker_id", profile.id);
    leadsQuery = leadsQuery.eq("broker_id", profile.id);
  }

  const [propertiesResult, leadsResult, appointmentsResult, instanceResult] = await Promise.all([
    propertiesQuery,
    leadsQuery,
    supabase.from("appointments").select("id").eq("organization_id", organization.id).eq("status", "scheduled"),
    supabase.from("whatsapp_instances").select("status, phone_number").eq("organization_id", organization.id).maybeSingle()
  ]);

  const properties = propertiesResult.data ?? [];
  const leads = leadsResult.data ?? [];
  const appointments = appointmentsResult.data ?? [];
  const instance = instanceResult.data;

  const activeProperties = properties.filter((property) => property.status === "active");
  const qualifiedLeads = leads.filter((lead) => lead.status === "qualified" || lead.status === "scheduled" || lead.temperature === "hot");
  const newLeads = leads.filter((lead) => lead.status === "new");
  const whatsappStatus = instance?.status ?? "disconnected";
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const leadsThisWeek = leads.filter((lead) => new Date(lead.created_at) >= weekStart).length;

  const metrics = [
    { title: "Imoveis cadastrados", value: String(properties.length), change: `${activeProperties.length} ativos`, icon: Building2 },
    { title: "Leads captados", value: String(leads.length), change: `${qualifiedLeads.length} qualificados`, icon: Users },
    { title: "Status do WhatsApp", value: whatsappStatus === "connected" ? "Conectado" : "Desconectado", change: instance?.phone_number ?? "Conecte para iniciar", icon: MessageCircle },
    { title: "Novos esta semana", value: String(leadsThisWeek), change: `${newLeads.length} aguardando contato`, icon: TrendingUp },
    { title: "Visitas marcadas", value: String(appointments.length), change: "Agenda interna", icon: CalendarDays }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Painel da operacao"
        title={organization.name}
        description="Acompanhe imoveis, leads, visitas e conexao do WhatsApp com dados reais do Supabase."
      />
      {whatsappStatus !== "connected" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Conecte o WhatsApp para o agente comecar a responder clientes.
          <Link href="/whatsapp" className="ml-2 font-semibold underline">Conectar agora</Link>
        </div>
      ) : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => <MetricCard key={metric.title} {...metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Leads recentes</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {leads.slice(0, 8).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-ink">{lead.name}</p>
                  <p className="text-sm text-slate-500">{lead.interest ?? "Interesse em qualificacao"} · {lead.phone}</p>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{lead.status}</span>
              </div>
            ))}
            {leads.length === 0 ? <p className="py-8 text-sm text-slate-500">Nenhum lead cadastrado ainda.</p> : null}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Imoveis ativos</h2>
          <div className="mt-4 space-y-3">
            {activeProperties.slice(0, 6).map((property) => (
              <div key={property.id} className="rounded-md bg-slate-50 p-3">
                <p className="font-medium text-ink">{property.title}</p>
                <p className="text-sm text-slate-500">{property.district}, {property.city}</p>
                <p className="mt-2 text-sm font-semibold text-ink">{formatCurrency(property.price)}</p>
              </div>
            ))}
            {activeProperties.length === 0 ? <p className="py-8 text-sm text-slate-500">Nenhum imovel ativo ainda.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
