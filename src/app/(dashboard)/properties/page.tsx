"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PageHeader } from "@/components/ui/page-header";

type Property = {
  id: string;
  title: string;
  type: string;
  purpose: string;
  price: number;
  neighborhood: string;
  city: string;
  bedrooms: number | null;
  area_m2: number | null;
  description: string | null;
  photos: string[];
  active: boolean;
};

type PropertiesResponse = { properties: Property[] };

type PropertyForm = {
  title: string;
  type: string;
  purpose: string;
  price: string;
  neighborhood: string;
  city: string;
  bedrooms: string;
  area_m2: string;
  description: string;
};

const initialForm: PropertyForm = {
  title: "",
  type: "apartamento",
  purpose: "venda",
  price: "",
  neighborhood: "",
  city: "",
  bedrooms: "",
  area_m2: "",
  description: ""
};

async function fetchProperties() {
  const response = await fetch("/api/properties");
  if (!response.ok) throw new Error("Could not load properties");
  return response.json() as Promise<PropertiesResponse>;
}

export default function PropertiesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PropertyForm>(initialForm);
  const { data, isLoading } = useQuery({ queryKey: ["properties"], queryFn: fetchProperties });
  const properties = data?.properties ?? [];

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
          area_m2: form.area_m2 ? Number(form.area_m2) : undefined
        })
      });
      if (!response.ok) throw new Error("Could not create property");
      return response.json();
    },
    onSuccess: () => {
      setForm(initialForm);
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    }
  });

  function updateField(field: keyof PropertyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Carteira" title="Imoveis" description="Cadastre os imoveis que aparecem no catalogo e sao usados pelo agente para sugerir opcoes aos clientes." />

      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3"><Plus className="size-5 text-signal" /><h2 className="text-lg font-semibold text-ink">Novo imovel</h2></div>
        <div className="grid gap-4 md:grid-cols-3">
          <input value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Titulo" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal md:col-span-2" />
          <input value={form.price} onChange={(event) => updateField("price", event.target.value)} placeholder="Preco" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
          <select value={form.type} onChange={(event) => updateField("type", event.target.value)} className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal"><option value="apartamento">Apartamento</option><option value="casa">Casa</option><option value="terreno">Terreno</option><option value="cobertura">Cobertura</option><option value="sala_comercial">Sala comercial</option></select>
          <select value={form.purpose} onChange={(event) => updateField("purpose", event.target.value)} className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal"><option value="venda">Venda</option><option value="aluguel">Aluguel</option></select>
          <input value={form.city} onChange={(event) => updateField("city", event.target.value)} placeholder="Cidade" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
          <input value={form.neighborhood} onChange={(event) => updateField("neighborhood", event.target.value)} placeholder="Bairro" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
          <input value={form.bedrooms} onChange={(event) => updateField("bedrooms", event.target.value)} placeholder="Quartos" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
          <input value={form.area_m2} onChange={(event) => updateField("area_m2", event.target.value)} placeholder="Area m2" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
        </div>
        <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Descricao" className="mt-4 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-signal" />
        <button type="submit" className="mt-4 rounded-md bg-signal px-4 py-2 text-sm font-semibold text-white">Salvar imovel</button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <article key={property.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 grid h-40 place-items-center rounded-md bg-slate-100">
              {property.photos?.[0] ? <img src={property.photos[0]} alt={property.title} className="h-full w-full rounded-md object-cover" /> : <Building2 className="size-9 text-slate-400" />}
            </div>
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="font-semibold text-ink">{property.title}</h2><p className="mt-1 text-sm text-slate-500">{property.neighborhood}, {property.city}</p></div>
              <span className={`rounded-md px-2 py-1 text-xs font-semibold ${property.active ? "bg-emerald/10 text-emerald" : "bg-slate-100 text-slate-600"}`}>{property.active ? "Ativo" : "Inativo"}</span>
            </div>
            <p className="mt-4 text-xl font-semibold text-ink">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(property.price)}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600"><span className="rounded-md bg-slate-100 px-2 py-1">{property.type}</span><span className="rounded-md bg-slate-100 px-2 py-1">{property.purpose}</span>{property.bedrooms ? <span className="rounded-md bg-slate-100 px-2 py-1">{property.bedrooms} quartos</span> : null}</div>
          </article>
        ))}
      </div>
      {!isLoading && properties.length === 0 ? <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Nenhum imovel cadastrado ainda.</div> : null}
    </div>
  );
}
