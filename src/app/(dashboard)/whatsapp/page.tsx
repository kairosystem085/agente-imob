"use client";

import { QrCode } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";

type StatusResponse = { status: string };
type ConnectResponse = { qr: string | null };

async function fetchStatus() {
  const response = await fetch("/api/whatsapp/status");
  if (!response.ok) throw new Error("Could not load status");
  return response.json() as Promise<StatusResponse>;
}

export default function WhatsAppPage() {
  const statusQuery = useQuery({ queryKey: ["whatsapp-status"], queryFn: fetchStatus, refetchInterval: 3000, retry: false });
  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/whatsapp/connect", { method: "POST" });
      if (!response.ok) throw new Error("Could not connect WhatsApp");
      return response.json() as Promise<ConnectResponse>;
    }
  });
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/whatsapp/disconnect", { method: "DELETE" });
      if (!response.ok) throw new Error("Could not disconnect WhatsApp");
      return response.json() as Promise<{ ok: boolean }>;
    },
    onSuccess: () => statusQuery.refetch()
  });

  const status = statusQuery.data?.status ?? "closed";
  const isConnected = status === "open";
  const qr = connectMutation.data?.qr;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Integracao" title="WhatsApp" description="Conecte o WhatsApp para o agente responder clientes e captar leads automaticamente." />
      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Status da instancia</p>
          <p className={`mt-3 text-2xl font-semibold ${isConnected ? "text-emerald" : "text-ink"}`}>{isConnected ? "Conectado" : status === "connecting" ? "Conectando" : "Desconectado"}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Quando conectada, a IA responde clientes e cria leads qualificados no painel.</p>
          <div className="mt-5 flex gap-3">
            {!isConnected ? <button type="button" onClick={() => connectMutation.mutate()} className="rounded-md bg-signal px-4 py-2 text-sm font-semibold text-white">Conectar WhatsApp</button> : null}
            {isConnected ? <button type="button" onClick={() => disconnectMutation.mutate()} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-ink">Desconectar</button> : null}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid h-80 place-items-center rounded-md border border-dashed border-slate-300 bg-slate-50">
            {qr ? <img src={qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`} alt="QR Code do WhatsApp" className="max-h-72 max-w-72" /> : <div className="text-center"><QrCode className="mx-auto size-16 text-slate-400" /><p className="mt-4 text-sm font-semibold text-slate-600">Clique em conectar para exibir o QR Code</p></div>}
          </div>
        </div>
      </section>
    </div>
  );
}
