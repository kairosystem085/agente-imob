import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0f1117] px-6 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-soft">
        <Link href="/" className="text-sm font-semibold text-emerald">ImobIA</Link>
        <h1 className="mt-6 text-3xl font-semibold">Acesso da agencia</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">Para abrir o painel administrativo, acesse usando o segredo configurado no Railway.</p>
        <code className="mt-4 block rounded-md bg-black/30 p-3 text-sm text-emerald">/admin?secret=SEU_ADMIN_SECRET</code>
        <p className="mt-4 text-xs leading-5 text-slate-400">Depois do primeiro acesso, o sistema grava uma sessao segura em cookie HTTP-only.</p>
      </section>
    </main>
  );
}
