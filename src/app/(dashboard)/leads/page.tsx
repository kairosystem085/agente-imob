import { revalidatePath } from "next/cache";
import { PageHeader } from "@/components/ui/page-header";
import { getAppContext } from "@/lib/app-context";

const statuses = ["new", "qualified", "scheduled", "negotiation", "closed", "lost"] as const;
const statusLabel: Record<string, string> = { new: "novo", qualified: "qualificado", scheduled: "visita", negotiation: "negociacao", closed: "fechado", lost: "perdido" };
const statusClass: Record<string, string> = { new: "bg-slate-100 text-slate-700", qualified: "bg-emerald-100 text-emerald-800", scheduled: "bg-blue-100 text-blue-800", negotiation: "bg-amber-100 text-amber-800", closed: "bg-emerald/10 text-emerald", lost: "bg-rose-100 text-rose-800" };

async function updateLeadStatus(formData: FormData) {
  "use server";

  const { supabase, organization } = await getAppContext();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));

  const { error } = await supabase
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", organization.id);

  if (error) throw error;
  revalidatePath("/leads");
  revalidatePath("/dashboard");
}

export default async function LeadsPage() {
  const { supabase, profile, organization } = await getAppContext();
  const canSeeAll = profile.role === "owner" || profile.role === "manager";

  let query = supabase
    .from("leads")
    .select("id, name, phone, source, interest, temperature, status, notes, created_at")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  if (!canSeeAll) query = query.eq("broker_id", profile.id);

  const { data, error } = await query;
  if (error) throw error;
  const leads = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pipeline" title="Leads" description="Leads reais captados pelo WhatsApp/catalogo e distribuidos para o corretor responsavel." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statuses.map((status) => (
          <section key={status} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">{statusLabel[status]}</h2>
            <div className="mt-4 space-y-3">
              {leads.filter((lead) => lead.status === status).map((lead) => (
                <article key={lead.id} className="rounded-md border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-ink">{lead.name}</p><a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} className="text-sm text-signal">{lead.phone}</a></div><span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[lead.status]}`}>{statusLabel[lead.status]}</span></div>
                  <p className="mt-3 text-sm text-slate-600">{lead.interest ?? "Interesse em avaliacao"}</p>
                  {lead.notes ? <p className="mt-1 text-sm text-slate-500">{lead.notes}</p> : null}
                  <form action={updateLeadStatus} className="mt-3"><input type="hidden" name="id" value={lead.id} /><select name="status" defaultValue={lead.status} className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm">{statuses.map((item) => <option key={item} value={item}>{statusLabel[item]}</option>)}</select><button type="submit" className="mt-2 h-9 w-full rounded-md bg-ink px-3 text-sm font-semibold text-white">Salvar status</button></form>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
