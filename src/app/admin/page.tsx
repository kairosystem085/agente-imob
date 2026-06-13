import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Home,
  KeyRound,
  MessageCircle,
  PhoneCall,
  Plus,
  ShieldCheck,
  UserRoundPlus,
  Users
} from "lucide-react";

const clients = [
  { name: "Joao Corretor", type: "Corretor", slug: "joao-corretor", status: "Setup", properties: 3, leads: 12, instance: "connecting" },
  { name: "Imobiliaria Alfa", type: "Imobiliaria", slug: "imobiliaria-alfa", status: "Ativo", properties: 18, leads: 47, instance: "open" }
];

const team = [
  { name: "Joao Mendes", role: "Dono", phone: "+55 85 99999-0001" },
  { name: "Marina Lopes", role: "Corretora", phone: "+55 85 99999-0002" },
  { name: "Rafael Lima", role: "Corretor", phone: "+55 85 99999-0003" }
];

function StatusBadge({ status }: { status: string }) {
  const className = status === "Ativo" ? "bg-emerald/15 text-emerald" : status === "Pausado" ? "bg-rose-500/15 text-rose-300" : "bg-amber-500/15 text-amber-200";
  return <span className={`rounded-md px-2 py-1 text-xs font-semibold ${className}`}>{status}</span>;
}

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#0f1117] px-6 py-6 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-emerald text-sm font-bold text-[#0f1117]">IA</div>
            <div>
              <p className="font-semibold">ImobIA</p>
              <p className="text-xs text-slate-400">Modo agencia</p>
            </div>
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
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
              Cadastre corretores e imobiliarias, gere acessos, acompanhe imoveis publicados e conecte o WhatsApp de cada operacao.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Resumo</p>
                <h2 className="mt-2 text-2xl font-semibold">{clients.length} clientes cadastrados</h2>
              </div>
              <ShieldCheck className="size-9 text-emerald" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-md bg-white/5 p-3"><p className="text-slate-400">Imoveis</p><p className="mt-1 text-xl font-semibold">21</p></div>
              <div className="rounded-md bg-white/5 p-3"><p className="text-slate-400">Leads</p><p className="mt-1 text-xl font-semibold">59</p></div>
              <div className="rounded-md bg-white/5 p-3"><p className="text-slate-400">WhatsApp</p><p className="mt-1 text-xl font-semibold">1/2</p></div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Clientes ativos</h2>
            <button type="button" className="rounded-md bg-emerald px-4 py-2 text-sm font-semibold text-[#0f1117]">Atualizar lista</button>
          </div>
          <div className="mt-5 overflow-hidden rounded-md border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Instancia</th>
                  <th className="px-4 py-3 font-semibold">Imoveis</th>
                  <th className="px-4 py-3 font-semibold">Leads</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {clients.map((client) => (
                  <tr key={client.slug}>
                    <td className="px-4 py-4 font-semibold">{client.name}</td>
                    <td className="px-4 py-4 text-slate-300">/{client.slug}</td>
                    <td className="px-4 py-4 text-slate-300">{client.type}</td>
                    <td className="px-4 py-4 text-slate-300">{client.instance}</td>
                    <td className="px-4 py-4 text-slate-300">{client.properties}</td>
                    <td className="px-4 py-4 text-slate-300">{client.leads}</td>
                    <td className="px-4 py-4"><StatusBadge status={client.status} /></td>
                    <td className="px-4 py-4"><button type="button" className="text-emerald">Editar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-sm">
            <div className="flex items-center gap-3"><Building2 className="size-5 text-emerald" /><h2 className="text-lg font-semibold">Cadastrar novo cliente</h2></div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block"><span className="text-sm font-medium text-slate-300">Nome da operacao</span><input placeholder="Ex: Imobiliaria Alfa" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label>
              <label className="block"><span className="text-sm font-medium text-slate-300">Tipo</span><select className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald"><option>Corretor</option><option>Imobiliaria</option><option>Construtora</option></select></label>
              <label className="block"><span className="text-sm font-medium text-slate-300">Slug do catalogo</span><input placeholder="imobiliaria-alfa" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label>
              <label className="block"><span className="text-sm font-medium text-slate-300">CRECI</span><input placeholder="CRECI 00000" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label>
              <label className="block md:col-span-2"><span className="text-sm font-medium text-slate-300">Telefone</span><input placeholder="+55 85 99999-0000" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label>
            </div>
            <button type="button" className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-emerald px-4 text-sm font-semibold text-[#0f1117]"><Plus className="size-4" />Salvar cliente</button>
          </div>

          <div className="rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-sm">
            <div className="flex items-center gap-3"><UserRoundPlus className="size-5 text-emerald" /><h2 className="text-lg font-semibold">Criar acesso para corretor</h2></div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block"><span className="text-sm font-medium text-slate-300">Nome</span><input placeholder="Nome do corretor" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label>
              <label className="block"><span className="text-sm font-medium text-slate-300">Email</span><input placeholder="corretor@email.com" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label>
              <label className="block"><span className="text-sm font-medium text-slate-300">Perfil</span><select className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald"><option>Dono</option><option>Gerente</option><option>Corretor</option></select></label>
              <label className="block"><span className="text-sm font-medium text-slate-300">WhatsApp para receber leads</span><input placeholder="+55 85 99999-0001" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label>
            </div>
            <button type="button" className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-emerald px-4 text-sm font-semibold text-[#0f1117]"><KeyRound className="size-4" />Criar acesso</button>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-sm">
            <div className="flex items-center gap-3"><MessageCircle className="size-5 text-emerald" /><h2 className="text-lg font-semibold">Status das instancias WhatsApp</h2></div>
            <div className="mt-5 space-y-3">
              {clients.map((client) => <div key={client.slug} className="flex items-center justify-between rounded-md bg-white/5 p-4"><div><p className="font-semibold">{client.slug}</p><p className="text-sm text-slate-400">Status: {client.instance}</p></div><button type="button" className="rounded-md border border-white/10 px-3 py-2 text-sm text-emerald">Forcar reconexao</button></div>)}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-sm">
            <div className="flex items-center gap-3"><Users className="size-5 text-emerald" /><h2 className="text-lg font-semibold">Equipe cadastrada</h2></div>
            <div className="mt-5 divide-y divide-white/10">
              {team.map((member) => <div key={member.name} className="flex items-center justify-between py-3"><div><p className="font-medium">{member.name}</p><p className="text-sm text-slate-400">{member.role} · {member.phone}</p></div><CheckCircle2 className="size-5 text-emerald" /></div>)}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-sm">
          <div className="flex items-start gap-3"><PhoneCall className="mt-1 size-5 text-emerald" /><div><h2 className="text-lg font-semibold">Proximas conexoes</h2><p className="mt-2 text-sm leading-6 text-slate-300">Os formularios ja seguem o fluxo real. A proxima etapa e ligar estes campos aos endpoints criados em /api/admin e exibir a senha temporaria gerada para cada corretor.</p></div></div>
        </section>
      </div>
    </main>
  );
}
