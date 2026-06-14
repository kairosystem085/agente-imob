"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { loadDemoState, type DemoState } from "@/lib/demo-store";

function whatsappLink(number: string, text?: string) {
  const cleanNumber = number.replace(/\D/g, "") || "5585999990001";
  const suffix = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${cleanNumber}${suffix}`;
}

export default function CatalogPage() {
  const params = useParams<{ slug: string }>();
  const [state, setState] = useState<DemoState | null>(null);
  useEffect(() => setState(loadDemoState()), []);
  if (!state) return <main className="min-h-screen px-6 py-6">Carregando...</main>;

  const organization = state.organizations.find((item) => item.slug === params.slug) ?? state.organizations[0];
  const properties = state.properties.filter((property) => property.organization_id === organization.id && property.active);

  return (
    <main className="min-h-screen px-6 py-6">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-center justify-between"><Link href="/" className="font-semibold text-ink">ImobIA</Link><a href={whatsappLink(organization.whatsapp_number)} className="flex items-center gap-2 rounded-md bg-emerald px-4 py-2 text-sm font-semibold text-white"><MessageCircle className="size-4" />Falar com atendimento</a></nav>
        <section className="py-12"><div className="flex items-center gap-4"><div className="grid size-14 place-items-center rounded-md bg-ink text-lg font-bold text-white">{organization.name.slice(0, 2).toUpperCase()}</div><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-signal">Imoveis selecionados</p><h1 className="mt-2 text-4xl font-semibold tracking-normal text-ink">{organization.name}</h1>{organization.creci ? <p className="mt-1 text-sm text-slate-500">CRECI {organization.creci}</p> : null}</div></div><p className="mt-5 max-w-2xl text-slate-600">Veja opcoes disponiveis e envie seu interesse para receber atendimento pelo WhatsApp.</p></section>
        <section className="mb-6 grid gap-3 md:grid-cols-4">{["Cidade", "Bairro", "Tipo", "Faixa de preco"].map((filter) => <button key={filter} type="button" className="h-11 rounded-md border border-slate-200 bg-white px-3 text-left text-sm font-medium text-slate-600">{filter}</button>)}</section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{properties.map((property) => <article key={property.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 grid h-48 place-items-center overflow-hidden rounded-md bg-slate-100"><Building2 className="size-10 text-slate-400" /></div><div className="mb-3 flex gap-2"><span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{property.type}</span><span className="rounded-md bg-emerald/10 px-2 py-1 text-xs font-semibold text-emerald">{property.purpose}</span></div><h2 className="font-semibold text-ink">{property.title}</h2><p className="mt-1 text-sm text-slate-500">{property.neighborhood}, {property.city}</p><p className="mt-4 text-xl font-semibold text-ink">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(property.price)}</p><div className="mt-3 flex gap-3 text-sm text-slate-600">{property.bedrooms ? <span>{property.bedrooms} quartos</span> : null}{property.area_m2 ? <span>{property.area_m2} m2</span> : null}</div><a href={whatsappLink(organization.whatsapp_number, `Ola, tenho interesse no imovel: ${property.title}`)} className="mt-4 block h-10 rounded-md bg-signal px-4 py-2 text-center text-sm font-semibold text-white">Tenho interesse</a></article>)}</section>
      </div>
    </main>
  );
}
