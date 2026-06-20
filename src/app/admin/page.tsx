"use client";

import Link from "next/link";
import { Building2, KeyRound, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";

type CreatedClient = { organization: { name: string; slug: string }; user: { email: string }; login_url: string };

function getAdminSecretFromUrl() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("secret") ?? "";
}

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdClient, setCreatedClient] = useState<CreatedClient | null>(null);

  async function createClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedClient(null);
    const form = new FormData(event.currentTarget);
    const adminSecret = getAdminSecretFromUrl();
    const response = await fetch("/api/admin/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(adminSecret ? { "x-admin-secret": adminSecret } : {})
      },
      body: JSON.stringify(Object.fromEntries(form.entries()))
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) { setError(data.error ?? "Nao foi possivel cadastrar o cliente."); return; }
    setCreatedClient(data);
    event.currentTarget.reset();
  }

  return (
    <main className="min-h-screen bg-[#0f1117] px-6 py-6 text-white"><div className="mx-auto max-w-6xl space-y-6"><nav className="flex items-center justify-between"><Link href="/" className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-md bg-emerald text-sm font-bold text-[#0f1117]">IA</div><div><p className="font-semibold">ImobIA</p><p className="text-xs text-slate-400">Modo agencia</p></div></Link><Link href="/login" className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">Login do cliente</Link></nav><section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"><div className="rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-sm"><div className="flex items-center gap-3"><ShieldCheck className="size-6 text-emerald" /><p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald">Operacao da agencia</p></div><h1 className="mt-4 text-4xl font-semibold tracking-normal">Cadastrar cliente real</h1><p className="mt-4 text-sm leading-6 text-slate-300">Use esta tela para criar uma imobiliaria ou corretor autonomo, gerar o usuario dono e liberar o acesso ao painel conectado ao Supabase.</p><div className="mt-6 rounded-md bg-white/5 p-4 text-sm text-slate-300"><p className="font-semibold text-white">Depois do cadastro:</p><p className="mt-2">1. Cliente entra em /login com email e senha.</p><p>2. Cadastra imoveis reais.</p><p>3. Conecta WhatsApp.</p><p>4. Agente qualifica leads e notifica o corretor.</p></div></div><form onSubmit={createClient} className="rounded-lg border border-white/10 bg-[#1a1f2e] p-6 shadow-sm"><div className="flex items-center gap-3"><Building2 className="size-5 text-emerald" /><h2 className="text-lg font-semibold">Novo cliente</h2></div><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="block"><span className="text-sm font-medium text-slate-300">Nome da operacao</span><input name="name" required placeholder="Ex: Imobiliaria Alfa" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label><label className="block"><span className="text-sm font-medium text-slate-300">Tipo</span><select name="organization_type" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald"><option value="solo_broker">Corretor autonomo</option><option value="agency">Imobiliaria</option></select></label><label className="block"><span className="text-sm font-medium text-slate-300">Slug do catalogo</span><input name="slug" placeholder="imobiliaria-alfa" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label><label className="block"><span className="text-sm font-medium text-slate-300">WhatsApp principal</span><input name="phone" placeholder="+55 85 99999-0000" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label><label className="block"><span className="text-sm font-medium text-slate-300">Nome do dono</span><input name="owner_name" required placeholder="Nome do corretor/dono" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label><label className="block"><span className="text-sm font-medium text-slate-300">Email de acesso</span><input name="email" type="email" required placeholder="cliente@email.com" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label><label className="block md:col-span-2"><span className="text-sm font-medium text-slate-300">Senha inicial</span><input name="password" type="text" required minLength={6} placeholder="Senha para primeiro acesso" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-[#0f1117] px-3 text-sm outline-none focus:border-emerald" /></label></div>{error ? <p className="mt-4 rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : null}{createdClient ? <div className="mt-4 rounded-md border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-emerald"><p className="font-semibold">Cliente criado: {createdClient.organization.name}</p><p>Login: {createdClient.user.email}</p><p>Catalogo: /catalogo/{createdClient.organization.slug}</p></div> : null}<button type="submit" disabled={loading} className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-emerald px-4 text-sm font-semibold text-[#0f1117] disabled:opacity-60"><KeyRound className="size-4" />{loading ? "Criando..." : "Criar cliente e acesso"}</button></form></section></div></main>
  );
}
