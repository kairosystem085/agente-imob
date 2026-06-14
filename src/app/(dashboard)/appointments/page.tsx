import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getAppContext } from "@/lib/app-context";
import { formatDate } from "@/lib/formatters";

export default async function AppointmentsPage() {
  const { supabase, profile, organization } = await getAppContext();
  const canSeeAll = profile.role === "owner" || profile.role === "manager";

  let query = supabase
    .from("appointments")
    .select("id, date, time, status, notes, leads(name, phone), properties(title), profiles(name)")
    .eq("organization_id", organization.id)
    .order("date", { ascending: true });

  if (!canSeeAll) query = query.eq("broker_id", profile.id);

  const { data, error } = await query;
  if (error) throw error;
  const appointments = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Agenda interna" title="Visitas" description="Visitas reais registradas no Supabase para a operacao." />
      <div className="grid gap-4 lg:grid-cols-2">
        {appointments.map((appointment) => {
          const lead = Array.isArray(appointment.leads) ? appointment.leads[0] : appointment.leads;
          const property = Array.isArray(appointment.properties) ? appointment.properties[0] : appointment.properties;
          const broker = Array.isArray(appointment.profiles) ? appointment.profiles[0] : appointment.profiles;

          return (
            <article key={appointment.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4"><div className="grid size-11 place-items-center rounded-md bg-signal/10 text-signal"><CalendarDays className="size-5" /></div><div><h2 className="font-semibold text-ink">{lead?.name ?? "Lead"}</h2><p className="mt-1 text-sm text-slate-600">{property?.title ?? "Imovel nao informado"}</p><p className="mt-3 text-sm font-semibold text-ink">{formatDate(appointment.date)} as {appointment.time}</p><p className="mt-1 text-sm text-slate-500">Corretor: {broker?.name ?? "Nao definido"}</p><p className="mt-1 text-sm text-slate-500">Status: {appointment.status}</p></div></div>
            </article>
          );
        })}
        {appointments.length === 0 ? <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">Nenhuma visita marcada ainda.</p> : null}
      </div>
    </div>
  );
}
