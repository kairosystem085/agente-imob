import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { organization, properties } from "@/lib/mock-data";

export default async function CatalogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="min-h-screen px-6 py-6">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-center justify-between">
          <Link href="/" className="font-semibold text-ink">ImobIA</Link>
          <a href="https://wa.me/5585999990001" className="flex items-center gap-2 rounded-md bg-emerald px-4 py-2 text-sm font-semibold text-white">
            <MessageCircle className="size-4" />
            Chamar no WhatsApp
          </a>
        </nav>

        <section className="py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-signal">Catalogo publico</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-ink">{slug === organization.slug ? organization.name : "Imobiliaria"}</h1>
          <p className="mt-4 max-w-2xl text-slate-600">Imoveis ativos, filtros e atendimento direto para registrar interesse.</p>
        </section>

        <section className="mb-6 grid gap-3 md:grid-cols-4">
          {["Cidade", "Bairro", "Tipo", "Faixa de preco"].map((filter) => (
            <button key={filter} type="button" className="h-11 rounded-md border border-slate-200 bg-white px-3 text-left text-sm font-medium text-slate-600">{filter}</button>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <article key={property.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 h-40 rounded-md bg-gradient-to-br from-slate-200 to-slate-100" />
              <h2 className="font-semibold text-ink">{property.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{property.district}, {property.city}</p>
              <p className="mt-4 text-xl font-semibold text-ink">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(property.price)}
              </p>
              <button type="button" className="mt-4 h-10 w-full rounded-md bg-signal text-sm font-semibold text-white">Tenho interesse</button>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
