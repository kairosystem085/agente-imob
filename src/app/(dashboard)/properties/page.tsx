import { PageHeader } from "@/components/ui/page-header";
import { properties } from "@/lib/mock-data";

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Gestao" title="Imoveis" description="CRUD premium preparado para upload multiplo, filtros e catalogo publico." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <article key={property.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 h-36 rounded-md bg-gradient-to-br from-slate-200 to-slate-100" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-ink">{property.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{property.district}, {property.city}</p>
              </div>
              <span className="rounded-md bg-emerald/10 px-2 py-1 text-xs font-semibold text-emerald">{property.status}</span>
            </div>
            <p className="mt-4 text-xl font-semibold text-ink">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(property.price)}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm text-slate-600">
              <span>{property.bedrooms} quartos</span>
              <span>{property.bathrooms} banhos</span>
              <span>{property.area} m2</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
