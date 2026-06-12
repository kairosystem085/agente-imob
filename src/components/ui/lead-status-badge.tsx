import type { LeadStatus, LeadTemperature } from "@/lib/types";

const statusLabel: Record<LeadStatus, string> = {
  new: "Novo",
  qualified: "Qualificado",
  scheduled: "Agendado",
  negotiation: "Negociacao",
  closed: "Fechado",
  lost: "Perdido"
};

const tempClass: Record<LeadTemperature, string> = {
  cold: "bg-slate-100 text-slate-700",
  warm: "bg-amber-100 text-amber-800",
  hot: "bg-rose-100 text-rose-800"
};

export function LeadStatusBadge({
  status,
  temperature
}: {
  status: LeadStatus;
  temperature: LeadTemperature;
}) {
  return (
    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${tempClass[temperature]}`}>
      {statusLabel[status]}
    </span>
  );
}
