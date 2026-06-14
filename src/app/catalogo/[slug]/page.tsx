import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, MessageCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/formatters";

function whatsappLink(number: string | null, text?: string) {
  const cleanNumber = number?.replace(/\D/g, "") || "";
  const suffix = text ? `?text=${encodeURIComponent(text)}` : "";
  return cleanNumber ? `https://wa.me/${cleanNumber}${suffix}` : "#";
}

export default async function CatalogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: organization } = await supabase.from("organizations").select("id, name, slug, phone").eq("slug", slug).maybeSingle();

  if (!organization) notFound();

  const { data } = await supabase.from("properties").select("id, title, description, property_type, purpose, price, city, district, bedrooms, area, status, property_images(url, position)").eq("organization_id", organization.id).eq("status", "active").order("created_at", { ascending: false });
  const properties = data ?? [];

  return (
    <main className="min-h-screen px-6 py-6"><div className="mx-auto max-w-7xl"><nav className="flex items-center justify-between"><Link href="/" className="font-semibold text-ink">ImobIA</Link><a href={whatsappLink(organization.phone)} className="flex items-center gap-2 rounded-md bg-emerald px-4 py-2 text-sm font-semibold text-white"><MessageCircle className="size-4" />Falar com atendimento</a></nav><section className="py-12"><div className="flex items-center gap-4"><div className="grid size-14 place-items-center rounded-md bg-ink text-lg font-bold text-white">{organization.name.slice(0, 2).toUpperCase()}</div><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-signal">Imoveis selecionados</p><h1 className="mt-2 text-4xl font-semibold tracking-normal text-ink">{organization.name}</h1></div></div><p className="mt-5 max-w-2xl text-slate-600">Veja opcoes disponiveis e envie seu interesse para receber atendimento pelo WhatsApp.</p></section><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{properties.map((property) => { const image = property.property_images?.sort((a, b) => a.position - b.position)[0]?.url; return <article key={property.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 grid h-48 place-items-center overflow-hidden rounded-md bg-slate-100">{image ? <img src={image} alt={property.title} className="h-full w-full object-cover" /> : <Building2 className="size-10 text-slate-400" />}</div><div className="mb-3 flex gap-2"><span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{property.property_type}</span><span className="rounded-md bg-emerald/10 px-2 py-1 text-xs font-semibold text-emerald">{property.purpose}</span></div><h2 className="font-semibold text-ink">{property.title}</h2><p className="mt-1 text-sm text-slate-500">{property.district}, {property.city}</p><p className="mt-4 text-xl font-semibold text-ink">{formatCurrency(property.price)}</p><div className="mt-3 flex gap-3 text-sm text-slate-600"><span>{property.bedrooms} quartos</span>{property.area ? <span>{property.area} m2</span> : null}</div><a href={whatsappLink(organization.phone, `Ola, tenho interesse no imovel: ${property.title}`)} className="mt-4 block h-10 rounded-md bg-signal px-4 py-2 text-center text-sm font-semibold text-white">Tenho interesse</a></article>; })}</section></div></main>
  );
}
