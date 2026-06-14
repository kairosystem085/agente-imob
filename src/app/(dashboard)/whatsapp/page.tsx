import { revalidatePath } from "next/cache";
import { QrCode } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getAppContext } from "@/lib/app-context";
import { createOrConnectInstance, logoutInstance } from "@/services/evolution";

async function connectWhatsApp() {
  "use server";

  const { supabase, organization } = await getAppContext();
  const instanceName = `imobia-${organization.slug}`;
  const result = await createOrConnectInstance({ instanceName, phoneNumber: organization.phone });

  const { error } = await supabase.from("whatsapp_instances").upsert({ organization_id: organization.id, instance_name: instanceName, phone_number: organization.phone, status: "connecting", qr_code: "qrCode" in result ? result.qrCode : null }, { onConflict: "organization_id" });

  if (error) throw error;
  revalidatePath("/whatsapp");
  revalidatePath("/dashboard");
}

async function disconnectWhatsApp() {
  "use server";

  const { supabase, organization } = await getAppContext();
  const instanceName = `imobia-${organization.slug}`;
  await logoutInstance(instanceName);

  const { error } = await supabase.from("whatsapp_instances").update({ status: "disconnected", qr_code: null }).eq("organization_id", organization.id);
  if (error) throw error;
  revalidatePath("/whatsapp");
  revalidatePath("/dashboard");
}

export default async function WhatsAppPage() {
  const { supabase, organization } = await getAppContext();
  const { data: instance } = await supabase.from("whatsapp_instances").select("*").eq("organization_id", organization.id).maybeSingle();
  const status = instance?.status ?? "disconnected";
  const isConnected = status === "connected";

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Integracao" title="WhatsApp" description="Conecte o numero que o agente usara para atender leads e notificar corretores." />
      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">Status da instancia</p><p className={`mt-3 text-2xl font-semibold ${isConnected ? "text-emerald" : "text-ink"}`}>{isConnected ? "Conectado" : status === "connecting" ? "Conectando" : "Desconectado"}</p><p className="mt-2 text-sm leading-6 text-slate-600">O agente responde usando o numero conectado. Quando um lead qualifica, o corretor responsavel recebe aviso no notification_phone cadastrado.</p><div className="mt-5 flex gap-3">{!isConnected ? <form action={connectWhatsApp}><button type="submit" className="rounded-md bg-signal px-4 py-2 text-sm font-semibold text-white">Conectar WhatsApp</button></form> : <form action={disconnectWhatsApp}><button type="submit" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-ink">Desconectar</button></form>}</div>{!process.env.EVOLUTION_API_URL || !process.env.EVOLUTION_API_KEY ? <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">Configure EVOLUTION_API_URL e EVOLUTION_API_KEY no Railway para gerar QR Code real.</p> : null}</div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="grid h-80 place-items-center rounded-md border border-dashed border-slate-300 bg-slate-50">{instance?.qr_code ? <img src={instance.qr_code} alt="QR Code do WhatsApp" className="max-h-64 max-w-64 rounded-md bg-white p-2 shadow-sm" /> : <div className="text-center"><QrCode className="mx-auto size-16 text-slate-400" /><p className="mt-4 text-sm font-semibold text-slate-600">{isConnected ? "WhatsApp conectado" : "Clique em conectar para solicitar o QR Code"}</p></div>}</div></div>
      </section>
    </div>
  );
}
