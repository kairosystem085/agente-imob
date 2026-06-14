"use client";

import { QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { getActiveOrganization, loadDemoState, saveDemoState, type DemoState } from "@/lib/demo-store";

type InstanceStatus = "open" | "connecting" | "closed";

export default function WhatsAppPage() {
  const [state, setState] = useState<DemoState | null>(null);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => setState(loadDemoState()), []);

  if (!state) return <div className="p-6">Carregando...</div>;

  const organization = getActiveOrganization(state);
  const isConnected = organization.instancia_status === "open";

  function updateInstanceStatus(status: InstanceStatus) {
    setState((previousState) => {
      if (!previousState) return previousState;

      const activeOrganization = getActiveOrganization(previousState);
      const nextState: DemoState = {
        ...previousState,
        organizations: previousState.organizations.map((item) =>
          item.id === activeOrganization.id ? { ...item, instancia_status: status } : item
        )
      };

      saveDemoState(nextState);
      return nextState;
    });
  }

  function connect() {
    setShowQr(true);
    updateInstanceStatus("connecting");

    window.setTimeout(() => {
      setState((previousState) => {
        const baseState = previousState ?? loadDemoState();
        const activeOrganization = getActiveOrganization(baseState);
        const nextState: DemoState = {
          ...baseState,
          organizations: baseState.organizations.map((item) =>
            item.id === activeOrganization.id ? { ...item, instancia_status: "open" } : item
          )
        };

        saveDemoState(nextState);
        return nextState;
      });
      setShowQr(false);
    }, 1200);
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Integracao" title="WhatsApp" description="Simule a conexao do WhatsApp para validar o fluxo do agente antes da Evolution API real." />
      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Status da instancia</p>
          <p className={`mt-3 text-2xl font-semibold ${isConnected ? "text-emerald" : "text-ink"}`}>
            {isConnected ? "Conectado" : organization.instancia_status === "connecting" ? "Conectando" : "Desconectado"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">No modo demo, a conexao simula o QR Code e atualiza o painel sem depender da Evolution API.</p>
          <div className="mt-5 flex gap-3">
            {!isConnected ? (
              <button type="button" onClick={connect} className="rounded-md bg-signal px-4 py-2 text-sm font-semibold text-white">Conectar WhatsApp</button>
            ) : (
              <button type="button" onClick={() => updateInstanceStatus("closed")} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-ink">Desconectar</button>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid h-80 place-items-center rounded-md border border-dashed border-slate-300 bg-slate-50">
            {showQr ? (
              <div className="grid size-56 place-items-center rounded-md bg-white shadow-sm"><QrCode className="size-32 text-ink" /></div>
            ) : (
              <div className="text-center"><QrCode className="mx-auto size-16 text-slate-400" /><p className="mt-4 text-sm font-semibold text-slate-600">{isConnected ? "WhatsApp conectado" : "Clique em conectar para simular o QR Code"}</p></div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
