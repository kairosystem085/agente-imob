import { revalidatePath } from "next/cache";
import { Building2, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getAppContext } from "@/lib/app-context";
import { formatCurrency } from "@/lib/formatters";
import { createAdminClient } from "@/lib/supabase/admin";

const propertyImagesBucket = "property-images";
const maxImageSize = 5 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

function sanitizeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const name = fileName
    .replace(/\.[^/.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "foto";

  return `${name}.${extension}`;
}

async function ensurePropertyImagesBucket() {
  const admin = createAdminClient();
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = buckets?.some((bucket) => bucket.name === propertyImagesBucket);

  if (!exists) {
    const { error } = await admin.storage.createBucket(propertyImagesBucket, {
      public: true,
      fileSizeLimit: maxImageSize,
      allowedMimeTypes: allowedImageTypes
    });

    if (error && !error.message.toLowerCase().includes("already exists")) throw error;
  }

  return admin;
}

async function uploadPropertyImage(organizationId: string, propertyId: string, file: File) {
  if (!file || file.size === 0) return null;
  if (!allowedImageTypes.includes(file.type)) throw new Error("Envie uma imagem JPG, PNG ou WEBP.");
  if (file.size > maxImageSize) throw new Error("A foto deve ter no maximo 5MB.");

  const admin = await ensurePropertyImagesBucket();
  const filePath = `${organizationId}/${propertyId}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error } = await admin.storage.from(propertyImagesBucket).upload(filePath, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false
  });

  if (error) throw error;

  const { data } = admin.storage.from(propertyImagesBucket).getPublicUrl(filePath);
  return data.publicUrl;
}

async function createProperty(formData: FormData) {
  "use server";

  const { supabase, profile, organization } = await getAppContext();
  const imageFile = formData.get("image_file");

  const { data: property, error } = await supabase
    .from("properties")
    .insert({
      organization_id: organization.id,
      broker_id: profile.id,
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      property_type: String(formData.get("property_type") ?? "apartment"),
      purpose: String(formData.get("purpose") ?? "sale"),
      price: Number(formData.get("price") ?? 0),
      city: String(formData.get("city") ?? "").trim(),
      district: String(formData.get("district") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      bedrooms: Number(formData.get("bedrooms") ?? 0),
      bathrooms: Number(formData.get("bathrooms") ?? 0),
      parking_spaces: Number(formData.get("parking_spaces") ?? 0),
      area: Number(formData.get("area") || 0),
      status: "active"
    })
    .select("id")
    .single();

  if (error) throw error;

  if (property && imageFile instanceof File) {
    const publicUrl = await uploadPropertyImage(organization.id, property.id, imageFile);

    if (publicUrl) {
      await supabase.from("property_images").insert({
        organization_id: organization.id,
        property_id: property.id,
        url: publicUrl,
        position: 0
      });
    }
  }

  revalidatePath("/properties");
  revalidatePath("/dashboard");
  revalidatePath(`/catalogo/${organization.slug}`);
}

async function toggleProperty(formData: FormData) {
  "use server";

  const { supabase, organization } = await getAppContext();
  const id = String(formData.get("id"));
  const currentStatus = String(formData.get("status"));

  const { error } = await supabase
    .from("properties")
    .update({ status: currentStatus === "active" ? "inactive" : "active" })
    .eq("id", id)
    .eq("organization_id", organization.id);

  if (error) throw error;

  revalidatePath("/properties");
  revalidatePath("/dashboard");
  revalidatePath(`/catalogo/${organization.slug}`);
}

export default async function PropertiesPage() {
  const { supabase, profile, organization } = await getAppContext();
  const canSeeAll = profile.role === "owner" || profile.role === "manager";

  let query = supabase
    .from("properties")
    .select("id, title, property_type, purpose, price, city, district, bedrooms, status, property_images(url, position)")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  if (!canSeeAll) query = query.eq("broker_id", profile.id);

  const { data, error } = await query;
  if (error) throw error;
  const properties = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Carteira" title="Imoveis" description="Cadastre os imoveis reais que aparecem no catalogo e alimentam o agente de WhatsApp." />

      <form action={createProperty} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3"><Plus className="size-5 text-signal" /><h2 className="text-lg font-semibold text-ink">Novo imovel</h2></div>
        <div className="grid gap-4 md:grid-cols-3">
          <input name="title" required placeholder="Titulo" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal md:col-span-2" />
          <input name="price" required type="number" min="0" placeholder="Preco" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
          <select name="property_type" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal"><option value="apartment">Apartamento</option><option value="house">Casa</option><option value="land">Terreno</option><option value="commercial">Comercial</option></select>
          <select name="purpose" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal"><option value="sale">Venda</option><option value="rent">Aluguel</option></select>
          <input name="city" required placeholder="Cidade" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
          <input name="district" required placeholder="Bairro" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
          <input name="address" placeholder="Endereco" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
          <input name="bedrooms" type="number" min="0" placeholder="Quartos" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
          <input name="bathrooms" type="number" min="0" placeholder="Banheiros" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
          <input name="parking_spaces" type="number" min="0" placeholder="Vagas" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
          <input name="area" type="number" min="0" placeholder="Area m2" className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-signal" />
          <label className="flex h-11 cursor-pointer items-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-500 outline-none focus-within:border-signal md:col-span-2">
            <span>Foto principal do imovel</span>
            <input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" />
          </label>
        </div>
        <textarea name="description" placeholder="Descricao" className="mt-4 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-signal" />
        <button type="submit" className="mt-4 rounded-md bg-signal px-4 py-2 text-sm font-semibold text-white">Salvar imovel</button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => {
          const image = property.property_images?.sort((a, b) => a.position - b.position)[0]?.url;
          return (
            <article key={property.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 grid h-40 place-items-center overflow-hidden rounded-md bg-slate-100">{image ? <img src={image} alt={property.title} className="h-full w-full object-cover" /> : <Building2 className="size-9 text-slate-400" />}</div>
              <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-ink">{property.title}</h2><p className="mt-1 text-sm text-slate-500">{property.district}, {property.city}</p></div><form action={toggleProperty}><input type="hidden" name="id" value={property.id} /><input type="hidden" name="status" value={property.status} /><button type="submit" className={`rounded-md px-2 py-1 text-xs font-semibold ${property.status === "active" ? "bg-emerald/10 text-emerald" : "bg-slate-100 text-slate-600"}`}>{property.status === "active" ? "Ativo" : "Inativo"}</button></form></div>
              <p className="mt-4 text-xl font-semibold text-ink">{formatCurrency(property.price)}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600"><span className="rounded-md bg-slate-100 px-2 py-1">{property.property_type}</span><span className="rounded-md bg-slate-100 px-2 py-1">{property.purpose}</span><span className="rounded-md bg-slate-100 px-2 py-1">{property.bedrooms} quartos</span></div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
