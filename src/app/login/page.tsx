"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError("Email ou senha invalidos.");
      return;
    }

    router.push(searchParams.get("redirectedFrom") ?? "/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#0f1117] px-6 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-soft">
        <Link href="/" className="text-sm font-semibold text-emerald">ImobIA</Link>
        <h1 className="mt-6 text-3xl font-semibold">Acessar painel</h1>
        <p className="mt-2 text-sm text-slate-300">Entrada restrita para corretores e equipes cadastradas pela agencia.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-300">Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-300">Senha</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" />
          </label>
          {error ? <p className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : null}
          <button type="submit" disabled={loading} className="h-11 w-full rounded-md bg-emerald text-sm font-semibold text-[#0f1117] disabled:opacity-60">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
