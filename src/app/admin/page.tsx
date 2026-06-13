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

const setupSteps = [
  "Criar cliente",
  "Cadastrar equipe",
  "Adicionar imoveis",
  "Conectar WhatsApp"
];

const clients = [
  {
    name: "Joao Corretor",
    type: "Corretor autonomo",
    slug: "joao-corretor",
    status: "Em configuracao"
  },
  {
    name: "Imobiliaria Alfa",
    type: "Imobiliaria",
    slug: "imobiliaria-alfa",
    status: "Pronta para ativar"
  }
];

const team = [
  { name: "Joao Mendes", role: "Dono", phone: "+55 85 99999-0001" },
  { name: "Marina Lopes", role: "Corretora", phone: "+55 85 99999-0002" },
  { name: "Rafael Lima", role: "Corretor", phone: "+55 85 99999-0003" }
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-mist px-6 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-ink text-white">IA</div>
            <div>
              <p className="font-semibold text-ink">ImobIA</p>
              <p className="text-xs text-slate-500">Modo agencia</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink">
              Ver painel
            </Link>
            <Link href="/catalogo/joao-corretor" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white shadow-soft">
              Ver catalogo
            </Link>
          </div>
        </nav>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-signal">Configuracao inicial</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal text-ink">Painel da agencia</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
              Cadastre clientes, equipes, imoveis e canais de atendimento. No primeiro momento, a agencia controla
              quem entra na plataforma e prepara cada operacao antes de liberar para o corretor ou imobiliaria.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {setupSteps.map((step, index) => (
                <div key={step} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3 grid size-7 place-items-center rounded-md bg-signal text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm font-semibold text-ink">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-ink p-6 text-white shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Operacao ativa</p>
                <h2 className="mt-2 text-2xl font-semibold">2 clientes em setup</h2>
              </div>
              <ShieldCheck className="size-9 text-emerald" />
            </div>
            <div className="mt-6 space-y-3">
              {clients.map((client) => (
                <div key={client.slug} className="rounded-md bg-white/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{client.name}</p>
                      <p className="mt-1 text-sm text-slate-300">{client.type} · /catalogo/{client.slug}</p>
                    </div>
                    <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold">{client.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Building2 className="size-5 text-signal" />
              <h2 className="text-lg font-semibold text-ink">Cadastrar cliente</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Nome da operacao</span>
                <input placeholder="Ex: Imobiliaria Alfa" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Tipo</span>
                <select className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal">
                  <option>Corretor autonomo</option>
                  <option>Imobiliaria</option>
                  <option>Construtora</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Slug do catalogo</span>
                <input placeholder="imobiliaria-alfa" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Telefone principal</span>
                <input placeholder="+55 85 99999-0000" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
              </label>
            </div>
            <button type="button" className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-signal px-4 text-sm font-semibold text-white">
              <Plus className="size-4" />
              Salvar cliente
            </button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <UserRoundPlus className="size-5 text-signal" />
              <h2 className="text-lg font-semibold text-ink">Cadastrar acesso e corretor</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Nome</span>
                <input placeholder="Nome do corretor" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email de acesso</span>
                <input placeholder="corretor@email.com" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Perfil</span>
                <select className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal">
                  <option>Dono</option>
                  <option>Gerente</option>
                  <option>Corretor</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">WhatsApp para receber leads</span>
                <input placeholder="+55 85 99999-0001" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
              </label>
            </div>
            <button type="button" className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-signal px-4 text-sm font-semibold text-white">
              <KeyRound className="size-4" />
              Criar acesso
            </button>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Home className="size-5 text-signal" />
              <h2 className="text-lg font-semibold text-ink">Adicionar imovel</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Titulo</span>
                <input placeholder="Apartamento vista mar no Meireles" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Cidade</span>
                <input placeholder="Fortaleza" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Bairro</span>
                <input placeholder="Meireles" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Finalidade</span>
                <select className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal">
                  <option>Venda</option>
                  <option>Aluguel</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Preco</span>
                <input placeholder="740000" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
              </label>
            </div>
            <button type="button" className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-signal px-4 text-sm font-semibold text-white">
              <Plus className="size-4" />
              Salvar imovel
            </button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <MessageCircle className="size-5 text-signal" />
              <h2 className="text-lg font-semibold text-ink">WhatsApp da operacao</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Nome da instancia</span>
                <input placeholder="imobiliaria-alfa" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Numero conectado</span>
                <input placeholder="+55 85 99999-0000" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
              </label>
            </div>
            <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <PhoneCall className="mt-1 size-5 text-signal" />
                <div>
                  <p className="font-semibold text-ink">Conexao preparada</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Quando a Evolution API for conectada, esta area exibira o QR Code e o status do atendimento.
                  </p>
                </div>
              </div>
            </div>
            <button type="button" className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white">
              <MessageCircle className="size-4" />
              Preparar conexao
            </button>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Users className="size-5 text-signal" />
              <h2 className="text-lg font-semibold text-ink">Equipe cadastrada</h2>
            </div>
            <div className="mt-5 divide-y divide-slate-100">
              {team.map((member) => (
                <div key={member.name} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-ink">{member.name}</p>
                    <p className="text-sm text-slate-500">{member.role} · {member.phone}</p>
                  </div>
                  <CheckCircle2 className="size-5 text-emerald" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Proximas conexoes</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p>1. Ligar este painel ao Supabase para salvar clientes, usuarios e imoveis.</p>
              <p>2. Criar convite ou senha temporaria para cada usuario cadastrado.</p>
              <p>3. Conectar Evolution API para receber mensagens e avisar corretores.</p>
              <p>4. Ativar IA para qualificar leads e sugerir imoveis automaticamente.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
