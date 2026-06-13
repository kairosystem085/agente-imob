import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError, requireBrokerContext } from "@/lib/api";

const maxPhotos = 8;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { context, response } = await requireBrokerContext();
  if (!context) return response;

  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) return jsonError("Missing file", 422);

  const supabase = createAdminClient();
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, photos")
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .single();

  if (propertyError || !property) return jsonError(propertyError?.message ?? "Property not found", 404);

  const existingPhotos = Array.isArray(property.photos) ? (property.photos as string[]) : [];
  if (existingPhotos.length >= maxPhotos) return jsonError("Property photo limit reached", 422);

  const extension = file.name.split(".").pop() ?? "jpg";
  const filePath = `${context.organizationId}/${id}/${crypto.randomUUID()}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("property-photos")
    .upload(filePath, Buffer.from(arrayBuffer), {
      contentType: file.type || "image/jpeg",
      upsert: false
    });

  if (uploadError) return jsonError(uploadError.message, 500);

  const { data: publicUrl } = supabase.storage.from("property-photos").getPublicUrl(filePath);
  const photos = [...existingPhotos, publicUrl.publicUrl];

  const { data, error } = await supabase
    .from("properties")
    .update({ photos, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ url: publicUrl.publicUrl, property: data });
}
