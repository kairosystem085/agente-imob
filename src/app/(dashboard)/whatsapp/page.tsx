import { QrCode } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export default function WhatsAppPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Integracao" title="WhatsApp" description="Tela preparada para Evolution API, status de instancia e QR Code." />
      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Status da instancia</p>
          <p className="mt-3 text-2xl font-semibold text-ink">Conectando</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Quando conectada, novos leads poderao ser notificados no numero do corretor responsavel.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid h-80 place-items-center rounded-md border border-dashed border-slate-300 bg-slate-50">
            <div className="text-center">
              <QrCode className="mx-auto size-16 text-slate-400" />
              <p className="mt-4 text-sm font-semibold text-slate-600">QR Code mockado</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
