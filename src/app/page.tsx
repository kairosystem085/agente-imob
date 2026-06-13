import Link from "next/link";
import { Building2, MessageCircle, Sparkles } from "lucide-react";

const highlights = [
  {
    title: "Respostas no WhatsApp",
    text: "O lead recebe atendimento inicial, tira duvidas e segue para o corretor certo sem ficar esperando.",
    icon: MessageCircle
  },
  {
    title: "Para corretores e imobiliarias",
    text: "Funciona para uma operacao individual ou para equipes com varios corretores e carteira compartilhada.",
    icon: Building2
  },
  {
    title: "Visitas mais organizadas",
    text: "A plataforma identifica o interesse do cliente, sugere imoveis compativeis e prepara o agendamento.",
    icon: Sparkles
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-6 py-6 lg:px-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-ink text-white">IA</div>
            <span className="text-lg font-semibold tracking-normal">ImobIA</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-medium text-slate-600">Modo agencia</Link>
            <Link href="/login" className="text-sm font-medium text-slate-600">Entrar</Link>
            <Link href="/dashboard" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white shadow-soft">Conhecer painel</Link>
          </div>
        </nav>

        <div className="grid items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-signal">Atendimento inteligente para imoveis</p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-normal text-ink md:text-7xl">ImobIA</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Organize os contatos que chegam pelo WhatsApp, entenda o que cada cliente procura,
              indique os melhores imoveis e avise o corretor responsavel no proprio numero.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-md bg-signal px-5 py-3 text-sm font-semibold text-white shadow-soft">Abrir painel</Link>
              <Link href="/catalogo/joao-corretor" className="rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink">Ver catalogo</Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-soft backdrop-blur">
            <div className="rounded-md bg-ink p-5 text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-sm font-semibold">Cliente pronto para visita</span>
                <span className="rounded-md bg-emerald px-2 py-1 text-xs font-semibold">WhatsApp</span>
              </div>
              <div className="space-y-4 pt-5">
                <p className="text-2xl font-semibold">Ana Paula busca apartamento</p>
                <p className="text-sm leading-6 text-slate-300">Zona Sul, ate R$ 750 mil, 3 quartos, visita disponivel nesta semana.</p>
                <div className="grid grid-cols-3 gap-3">
                  {["Perfil qualificado", "3 imoveis compativeis", "Corretor avisado"].map((item) => (
                    <div key={item} className="rounded-md bg-white/10 p-3 text-sm">{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 pb-8 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5">
              <item.icon className="mb-4 size-5 text-signal" />
              <h2 className="text-base font-semibold text-ink">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
