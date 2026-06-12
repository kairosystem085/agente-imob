import { AreaChart, Building2, CalendarDays, MessageCircle, TrendingUp, Users } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { brokers, dashboardSeries, leads, properties } from "@/lib/mock-data";

const metrics = [
  { title: "Leads novos", value: "24", change: "+18% esta semana", icon: Users },
  { title: "Qualificados", value: "13", change: "+7 oportunidades", icon: TrendingUp },
  { title: "Visitas", value: "8", change: "5 nos proximos dias", icon: CalendarDays },
  { title: "Imoveis ativos", value: "42", change: "3 destaques", icon: Building2 },
  { title: "Conversas ativas", value: "19", change: "6 aguardando corretor", icon: MessageCircle },
  { title: "Conversao", value: "31%", change: "+4 pts no mes", icon: AreaChart }
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Visao geral" title="Operacao comercial" description="Indicadores principais para corretor autonomo ou equipe imobiliaria, com foco em leads, visitas e conversas." />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => <MetricCard key={metric.title} {...metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Leads por dia</h2>
            <span className="text-sm text-slate-500">Mock inicial</span>
          </div>
          <div className="flex h-72 items-end gap-3">
            {dashboardSeries.map((point) => (
              <div key={point.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-md bg-signal" style={{ height: `${point.leads * 10}px` }} title={`${point.leads} leads`} />
                <span className="text-xs font-medium text-slate-500">{point.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Ranking de corretores</h2>
          <div className="mt-5 space-y-4">
            {brokers.map((broker, index) => (
              <div key={broker.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink">{broker.name}</p>
                  <p className="text-sm text-slate-500">{broker.notificationPhone}</p>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold">{index === 0 ? "12" : index === 1 ? "8" : "5"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Leads recentes</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-ink">{lead.name}</p>
                  <p className="text-sm text-slate-500">{lead.interest}</p>
                </div>
                <span className="text-sm font-semibold text-signal">{lead.temperature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Imoveis em destaque</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {properties.map((property) => (
              <div key={property.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-ink">{property.title}</p>
                  <p className="text-sm text-slate-500">{property.district}, {property.city}</p>
                </div>
                <span className="text-sm font-semibold text-ink">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(property.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
