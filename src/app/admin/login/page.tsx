import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0f1117] px-6 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-soft">
        <Link href="/" className="text-sm font-semibold text-emerald">ImobIA</Link>
        <h1 className="mt-6 text-3xl font-semibold">Modo agencia</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Acesso restrito para configuracao das operacoes. Entre usando a URL com o segredo administrativo configurado no Railway.
        </p>
        <div className="mt-5 rounded-md border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Formato de acesso</p>
          <p className="mt-2 break-all">/admin?secret=SUA_SENHA_ADMIN</p>
        </div>
      </section>
    </main>
  );
}
