"use client";

import { Building2, Plus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { getActiveOrganization, loadDemoState, makeId, saveDemoState, type DemoState } from "@/lib/demo-store";

type PropertyForm = { title: string; type: string; purpose: string; price: string; neighborhood: string; city: string; bedrooms: string; area_m2: string; description: string };
const initialForm: PropertyForm = { title: "", type: "apartamento", purpose: "venda", price: "", neighborhood: "", city: "", bedrooms: "", area_m2: "", description: "" };

export default function PropertiesPage() {
  const [state, setState] = useState<DemoState | null>(null);
  const [form, setForm] = useState<PropertyForm>(initialForm);
  useEffect(() => setState(loadDemoState()), []);
  if (!state) return <div className="p-6">Carregando...</div>;

  const organization = getActiveOrganization(state);
  const properties = state.properties.filter((property) => property.organization_id === organization.id);

  function updateField(field: keyof PropertyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextState: DemoState = {
      ...state,
      properties: [
        { id: makeId("prop"), organization_id: organization.id, title: form.title, type: form.type, purpose: form.purpose, price: Number(form.price || 0), neighborhood: form.neighborhood, city: form.city, bedrooms: form.bedrooms ? Number(form.bedrooms) : null, area_m2: form.area_m2 ? Number(form.area_m2) : null, description: form.description, photos: [], active: true, created_at: new Date().toISOString() },
        ...state.properties
      ]
    };
    setState(nextState);
    saveDemoState(nextState);
    setForm(initialForm);
  }

  function toggleProperty(id: string) {
    const nextState = { ...state, properties: state.properties.map((property) => property.id === id ? { ...property, active: !property.active } : property) };
    setState(nextState);
    saveDemoState(nextState);
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Carteira" title="Imoveis" description="Cadastre os imoveis que aparecem no catalogo e sao usados pelo agente para sugerir opcoes aos clientes." />
      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3"><Plus className="size-5 text-signal" /><h2 className="text-lg font-semibold text-ink">Novo imovel</h2></div>
        <div className="grid gap-4 md:grid-cols-3"><input value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Titulo" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal md:col-span-2" /><input value={form.price} onChange={(event) => updateField("price", event.target.value)} placeholder="Preco" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" /><select value={form.type} onChange={(event) => updateField("type", event.target.value)} className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal"><option value="apartamento">Apartamento</option><option value="casa">Casa</option><option value="terreno">Terreno</option><option value="cobertura">Cobertura</option><option value="sala_comercial">Sala comercial</option></select><select value={form.purpose} onChange={(event) => updateField("purpose", event.target.value)} className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal"><option value="venda">Venda</option><option value="aluguel">Aluguel</option></select><input value={form.city} onChange={(event) => updateField("city", event.target.value)} placeholder="Cidade" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" /><input value={form.neighborhood} onChange={(event) => updateField("neighborhood", event.target.value)} placeholder="Bairro" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" /><input value={form.bedrooms} onChange={(event) => updateField("bedrooms", event.target.value)} placeholder="Quartos" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" /><input value={form.area_m2} onChange={(event) => updateField("area_m2", event.target.value)} placeholder="Area m2" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" /></div>
        <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Descricao" className="mt-4 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-signal" />
        <button type="submit" className="mt-4 rounded-md bg-signal px-4 py-2 text-sm font-semibold text-white">Salvar imovel</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{properties.map((property) => <article key={property.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 grid h-40 place-items-center rounded-md bg-slate-100"><Building2 className="size-9 text-slate-400" /></div><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-ink">{property.title}</h2><p className="mt-1 text-sm text-slate-500">{property.neighborhood}, {property.city}</p></div><button type="button" onClick={() => toggleProperty(property.id)} className={`rounded-md px-2 py-1 text-xs font-semibold ${property.active ? "bg-emerald/10 text-emerald" : "bg-slate-100 text-slate-600"}`}>{property.active ? "Ativo" : "Inativo"}</button></div><p className="mt-4 text-xl font-semibold text-ink">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(property.price)}</p><div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600"><span className="rounded-md bg-slate-100 px-2 py-1">{property.type}</span><span className="rounded-md bg-slate-100 px-2 py-1">{property.purpose}</span>{property.bedrooms ? <span className="rounded-md bg-slate-100 px-2 py-1">{property.bedrooms} quartos</span> : null}</div></article>)}</div>
    </div>
  );
}
