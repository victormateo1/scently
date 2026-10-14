import { supabase } from "@/integrations/supabase/client";

const BUCKET = "perfume-photos";

// Reduce la foto a 1280px y la pasa a JPEG; si el navegador no puede, se sube el original.
// Reduce a 1280px. PNG/WebP/GIF salen como WebP (conserva transparencia); el resto, JPEG.
async function resizeImage(file: File, max = 1280): Promise<Blob | null> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const keepAlpha = /^image\/(png|webp|gif)$/.test(file.type);
    return await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, keepAlpha ? "image/webp" : "image/jpeg", 0.88),
    );
  } catch {
    return null;
  }
}

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function uploadPhoto(file: File): Promise<string> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Sesión caducada");
  const resized = await resizeImage(file);
  const body: Blob = resized ?? file;
  const type = body.type || file.type;
  const ext = resized ? (EXT[type] ?? "jpg") : (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${u.user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, body, { contentType: type, cacheControl: "3600" });
  if (error) throw error;
  return path;
}

export async function removePhoto(path: string | null | undefined) {
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

export async function registerSprays(perfumeId: string, count: number) {
  const { error } = await supabase.rpc("register_sprays", { _perfume_id: perfumeId, _count: count });
  if (error) throw error;
}

export async function adjustRemaining(perfumeId: string, ml: number, note?: string) {
  const { error } = await supabase.rpc("update_remaining", {
    _perfume_id: perfumeId,
    _ml: ml,
    ...(note ? { _note: note } : {}),
  });
  if (error) throw error;
}