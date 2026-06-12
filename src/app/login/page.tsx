import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <Link href="/" className="text-sm font-semibold text-signal">ImobIA</Link>
        <h1 className="mt-6 text-3xl font-semibold text-ink">Entrar</h1>
        <p className="mt-2 text-sm text-slate-600">A autenticacao sera conectada ao Supabase Auth.</p>
        <form className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Senha</span>
            <input type="password" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
          </label>
          <button type="button" className="h-11 w-full rounded-md bg-ink text-sm font-semibold text-white">Entrar</button>
        </form>
      </section>
    </main>
  );
}
