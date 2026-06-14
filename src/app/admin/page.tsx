"use client";

import Link from "next/link";
import { Building2, KeyRound, MessageCircle, Plus, ShieldCheck, UserRoundPlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { createTempPassword, loadDemoState, makeId, saveDemoState, type DemoState } from "@/lib/demo-store";

type OrganizationForm = { name: string; slug: string; type: "broker" | "agency" | "developer"; creci: string; phone: string };
type BrokerForm = { organization_id: string; name: string; email: string; role: "owner" | "manager" | "broker"; notification_phone: string };

const emptyOrganization: OrganizationForm = { name: "", slug: "", type: "broker", creci: "", phone: "" };
const emptyBroker: BrokerForm = { organization_id: "", name: "", email: "", role: "owner", notification_phone: "" };

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function StatusBadge({ status }: { status: string }) {
  const label = status === "active" ? "Ativo" : status === "paused" ? "Pausado" : "Setup";
  const className = status === "active" ? "bg-emerald/15 text-emerald" : status === "paused" ? "bg-rose-500/15 text-rose-300" : "bg-amber-500/15 text-amber-200";
  return <span className={`rounded-md px-2 py-1 text-xs font-semibold ${className}`}>{label}</span>;
}

export default function AdminPage() {
  const [state, setState] = useState<DemoState | null>(null);
  const [organizationForm, setOrganizationForm] = useState<OrganizationForm>(emptyOrganization);
  const [brokerForm, setBrokerForm] = useState<BrokerForm>(emptyBroker);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadDemoState();
    setState(loaded);
    setBrokerForm((current) => ({ ...current, organization_id: loaded.organizations[0]?.id ?? "" }));
  }, []);

  function updateDemoState(updater: (current: DemoState) => DemoState) {
    setState((previousState) => {
      const currentState = previousState ?? loadDemoState();
      const nextState = updater(currentState);
      saveDemoState(nextState);
      return nextState;
    });
  }

  function createOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = makeId("org");

    updateDemoState((currentState) => ({
      ...currentState,
      activeOrganizationId: id,
      organizations: [
        ...currentState.organizations,
        {
          id,
          name: organizationForm.name,
          slug: organizationForm.slug || slugify(organizationForm.name),
          type: organizationForm.type,
          creci: organizationForm.creci,
          phone: organizationForm.phone,
          whatsapp_number: organizationForm.phone,
          plan: "setup",
          instancia_status: "closed"
        }
      ]
    }));

    setOrganizationForm(emptyOrganization);
    setBrokerForm((current) => ({ ...current, organization_id: id }));
    setMessage("Cliente criado no modo demo.");
  }

  function createBroker(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const temp_password = createTempPassword();

    updateDemoState((currentState) => ({
      ...currentState,
      brokers: [...currentState.brokers, { id: makeId("broker"), ...brokerForm, temp_password }]
    }));

    setTempPassword(temp_password);
    setBrokerForm((current) => ({ ...emptyBroker, organization_id: current.organization_id }));
    setMessage("Acesso criado no modo demo.");
  }

  function toggleInstanceStatus(organizationId: string) {
    updateDemoState((currentState) => ({
      ...currentState,
      organizations: currentState.organizations.map((item) =>
        item.id === organizationId ? { ...item, instancia_status: item.instancia_status === "open" ? "closed" : "open" } : item
      )
    }));
  }

  if (!state) return <main className="min-h-screen bg-[#0f1117] p-6 text-white">Carregando...</main>;

  const organizations = state.organizations;
  const totalProperties = state.properties.length;
  const totalLeads = state.leads.length;
  const connectedInstances = organizations.filter((organization) => organization.instancia_status === "open").length;

  return (
    <main className="min-h-screen bg-[#0f1117] px-6 py-6 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-emerald text-sm font-bold text-[#0f1117]">IA</div>
            <div><p className="font-semibold">ImobIA</p><p className="text-xs text-slate-400">Modo agencia demo</p></div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">Ver painel</Link>
            <Link href="/catalogo/joao-corretor" className="rounded-md bg-emerald px-4 py-2 text-sm font-semibold text-[#0f1117] shadow-soft">Ver catalogo</Link>
          </div>
        </nav>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald">Operacao da agencia</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal">Clientes e automacoes</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">Cadastre corretores e imobiliarias, gere acessos, acompanhe imoveis publicados e simule a conexao WhatsApp.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-sm">
            <div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Resumo</p><h2 className="mt-2 text-2xl font-semibold">{organizations.length} clientes cadastrados</h2></div><ShieldCheck className="size-9 text-emerald" /></div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm"><div className="rounded-md bg-white/5 p-3"><p className="text-slate-400">Imoveis</p><p className="mt-1 text-xl font-semibold">{totalProperties}</p></div><div className="rounded-md bg-white/5 p-3"><p className="text-slate-400">Leads</p><p className="mt-1 text-xl font-semibold">{totalLeads}</p></div><div className="rounded-md bg-white/5 p-3"><p className="text-slate-400">WhatsApp</p><p className="mt-1 text-xl font-semibold">{connectedInstances}/{organizations.length}</p></div></div>
          </div>
        </section>

        {message ? <div className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">{message}</div> : null}
        {tempPassword ? <div className="rounded-md border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-emerald">Senha temporaria do corretor: <strong>{tempPassword}</strong></div> : null}

        <section className="rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Clientes ativos</h2>
          <div className="mt-5 overflow-hidden rounded-md border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-400"><tr><th className="px-4 py-3 font-semibold">Nome</th><th className="px-4 py-3 font-semibold">Slug</th><th className="px-4 py-3 font-semibold">Tipo</th><th className="px-4 py-3 font-semibold">Instancia</th><th className="px-4 py-3 font-semibold">Imoveis</th><th className="px-4 py-3 font-semibold">Leads</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Acoes</th></tr></thead>
              <tbody className="divide-y divide-white/10">
                {organizations.map((organization) => (
                  <tr key={organization.id}>
                    <td className="px-4 py-4 font-semibold">{organization.name}</td>
                    <td className="px-4 py-4 text-slate-300">/{organization.slug}</td>
                    <td className="px-4 py-4 text-slate-300">{organization.type}</td>
                    <td className="px-4 py-4 text-slate-300">{organization.instancia_status}</td>
                    <td className="px-4 py-4 text-slate-300">{state.properties.filter((property) => property.organization_id === organization.id).length}</td>
                    <td className="px-4 py-4 text-slate-300">{state.leads.filter((lead) => lead.organization_id === organization.id).length}</td>
                    <td className="px-4 py-4"><StatusBadge status={organization.plan} /></td>
                    <td className="px-4 py-4"><Link href={`/catalogo/${organization.slug}`} className="text-emerald">Catalogo</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <form onSubmit={createOrganization} className="rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-sm">
            <div className="flex items-center gap-3"><Building2 className="size-5 text-emerald" /><h2 className="text-lg font-semibold">Cadastrar novo cliente</h2></div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block"><span className="text-sm font-medium text-slate-300">Nome da operacao</span><input value={organizationForm.name} onChange={(event) => setOrganizationForm((current) => ({ ...current, name: event.target.value, slug: current.slug || slugify(event.target.value) }))} placeholder="Ex: Imobiliaria Alfa" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label>
              <label className="block"><span className="text-sm font-medium text-slate-300">Tipo</span><select value={organizationForm.type} onChange={(event) => setOrganizationForm((current) => ({ ...current, type: event.target.value as OrganizationForm["type"] }))} className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald"><option value="broker">Corretor</option><option value="agency">Imobiliaria</option><option value="developer">Construtora</option></select></label>
              <label className="block"><span className="text-sm font-medium text-slate-300">Slug do catalogo</span><input value={organizationForm.slug} onChange={(event) => setOrganizationForm((current) => ({ ...current, slug: slugify(event.target.value) }))} placeholder="imobiliaria-alfa" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label>
              <label className="block"><span className="text-sm font-medium text-slate-300">CRECI</span><input value={organizationForm.creci} onChange={(event) => setOrganizationForm((current) => ({ ...current, creci: event.target.value }))} placeholder="CRECI 00000" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label>
              <label className="block md:col-span-2"><span className="text-sm font-medium text-slate-300">Telefone</span><input value={organizationForm.phone} onChange={(event) => setOrganizationForm((current) => ({ ...current, phone: event.target.value }))} placeholder="+55 85 99999-0000" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label>
            </div>
            <button type="submit" className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-emerald px-4 text-sm font-semibold text-[#0f1117]"><Plus className="size-4" />Salvar cliente</button>
          </form>

          <form onSubmit={createBroker} className="rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-sm">
            <div className="flex items-center gap-3"><UserRoundPlus className="size-5 text-emerald" /><h2 className="text-lg font-semibold">Criar acesso para corretor</h2></div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2"><span className="text-sm font-medium text-slate-300">Cliente</span><select value={brokerForm.organization_id} onChange={(event) => setBrokerForm((current) => ({ ...current, organization_id: event.target.value }))} className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald">{organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select></label>
              <label className="block"><span className="text-sm font-medium text-slate-300">Nome</span><input value={brokerForm.name} onChange={(event) => setBrokerForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nome do corretor" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label>
              <label className="block"><span className="text-sm font-medium text-slate-300">Email</span><input value={brokerForm.email} onChange={(event) => setBrokerForm((current) => ({ ...current, email: event.target.value }))} placeholder="corretor@email.com" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label>
              <label className="block"><span className="text-sm font-medium text-slate-300">Perfil</span><select value={brokerForm.role} onChange={(event) => setBrokerForm((current) => ({ ...current, role: event.target.value as BrokerForm["role"] }))} className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald"><option value="owner">Dono</option><option value="manager">Gerente</option><option value="broker">Corretor</option></select></label>
              <label className="block"><span className="text-sm font-medium text-slate-300">WhatsApp para receber leads</span><input value={brokerForm.notification_phone} onChange={(event) => setBrokerForm((current) => ({ ...current, notification_phone: event.target.value }))} placeholder="+55 85 99999-0001" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label>
            </div>
            <button type="submit" className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-emerald px-4 text-sm font-semibold text-[#0f1117]"><KeyRound className="size-4" />Criar acesso</button>
          </form>
        </section>

        <section className="rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-sm">
          <div className="flex items-center gap-3"><MessageCircle className="size-5 text-emerald" /><h2 className="text-lg font-semibold">Status das instancias WhatsApp</h2></div>
          <div className="mt-5 space-y-3">
            {organizations.map((organization) => (
              <div key={organization.id} className="flex items-center justify-between rounded-md bg-white/5 p-4">
                <div><p className="font-semibold">{organization.slug}</p><p className="text-sm text-slate-400">Status: {organization.instancia_status}</p></div>
                <button type="button" onClick={() => toggleInstanceStatus(organization.id)} className="rounded-md border border-white/10 px-3 py-2 text-sm text-emerald">Alternar status</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
