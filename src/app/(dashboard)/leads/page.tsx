import { LeadStatusBadge } from "@/components/ui/lead-status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { leads } from "@/lib/mock-data";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pipeline" title="Leads" description="Gestao de leads com status, temperatura, corretor responsavel e origem." />
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">Interesse</th>
              <th className="px-4 py-3 font-semibold">Origem</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-4 py-4">
                  <p className="font-semibold text-ink">{lead.name}</p>
                  <p className="text-slate-500">{lead.phone}</p>
                </td>
                <td className="px-4 py-4 text-slate-600">{lead.interest}</td>
                <td className="px-4 py-4 text-slate-600">{lead.source}</td>
                <td className="px-4 py-4"><LeadStatusBadge status={lead.status} temperature={lead.temperature} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
