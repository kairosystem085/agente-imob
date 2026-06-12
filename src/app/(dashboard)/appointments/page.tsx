import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

const appointments = [
  { lead: "Ana Paula", property: "Apartamento vista mar no Meireles", date: "Hoje", time: "15:30", broker: "Joao Mendes" },
  { lead: "Carlos Henrique", property: "Casa duplex em condominio", date: "Amanha", time: "10:00", broker: "Marina Lopes" }
];

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Agenda interna" title="Visitas" description="A agenda do ImobIA e a fonte oficial. Google Calendar fica como integracao futura." />
      <div className="grid gap-4 lg:grid-cols-2">
        {appointments.map((appointment) => (
          <article key={`${appointment.lead}-${appointment.time}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="grid size-11 place-items-center rounded-md bg-signal/10 text-signal"><CalendarDays className="size-5" /></div>
              <div>
                <h2 className="font-semibold text-ink">{appointment.lead}</h2>
                <p className="mt-1 text-sm text-slate-600">{appointment.property}</p>
                <p className="mt-3 text-sm font-semibold text-ink">{appointment.date} as {appointment.time}</p>
                <p className="mt-1 text-sm text-slate-500">Corretor: {appointment.broker}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
