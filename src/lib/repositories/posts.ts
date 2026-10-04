import type { TypedSupabaseClient } from "@/lib/supabase/client";
import type { FeiraPost, NewPost, PriceReport } from "@/types/community";

export const PHOTO_BUCKET = "post-photos";
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const POST_COLUMNS =
  "id, feira_id, user_id, text, rating, price_reports, photo_path, created_at, author:profiles!posts_user_id_fkey(display_name, avatar_url)";

function isPriceReport(v: unknown): v is PriceReport {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as PriceReport).product === "string" &&
    typeof (v as PriceReport).price === "string"
  );
}

export async function listPosts(
  supabase: TypedSupabaseClient,
  feiraId: string,
  limit = 50,
): Promise<FeiraPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .eq("feira_id", feiraId)
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? []).map((row) => {
    const author = row.author;
    return {
      id: row.id,
      feiraId: row.feira_id,
      userId: row.user_id,
      authorName: author?.display_name ?? "Usuário",
      authorAvatar: author?.avatar_url ?? null,
      text: row.text,
      rating: row.rating,
      priceReports: Array.isArray(row.price_reports)
        ? (row.price_reports as unknown[]).filter(isPriceReport)
        : [],
      photoUrl: row.photo_path
        ? supabase.storage.from(PHOTO_BUCKET).getPublicUrl(row.photo_path).data.publicUrl
        : null,
      createdAt: row.created_at,
    };
  });
}

export function validatePhoto(file: File): string | null {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) return "Use uma foto JPG, PNG ou WebP.";
  if (file.size > MAX_PHOTO_BYTES) return "A foto deve ter no máximo 5 MB.";
  return null;
}

export async function createPost(
  supabase: TypedSupabaseClient,
  userId: string,
  feiraId: string,
  post: NewPost,
  photo: File | null,
): Promise<void> {
  let photoPath: string | null = null;

  if (photo) {
    const problem = validatePhoto(photo);
    if (problem) throw new Error(problem);
    const ext = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
    photoPath = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(photoPath, photo, { contentType: photo.type, upsert: false });
    if (uploadError) throw uploadError;
  }

  const { error } = await supabase.from("posts").insert({
    feira_id: feiraId,
    user_id: userId,
    text: post.text,
    rating: post.rating,
    price_reports: post.priceReports,
    photo_path: photoPath,
  });

  if (error) {
    // Não deixa foto órfã se o relato não foi salvo.
    if (photoPath) await supabase.storage.from(PHOTO_BUCKET).remove([photoPath]);
    throw error;
  }
}

export async function deletePost(
  supabase: TypedSupabaseClient,
  post: Pick<FeiraPost, "id" | "photoUrl">,
): Promise<void> {
  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", post.id)
    .select("photo_path");
  if (error) throw error;
  const path = data?.[0]?.photo_path;
  if (path) await supabase.storage.from(PHOTO_BUCKET).remove([path]);
}

export async function reportPost(
  supabase: TypedSupabaseClient,
  userId: string,
  postId: string,
  reason: string,
): Promise<void> {
  const { error } = await supabase
    .from("post_reports")
    .insert({ post_id: postId, user_id: userId, reason: reason.trim() });
  // 23505 = já denunciado por este usuário; tratamos como sucesso.
  if (error && error.code !== "23505") throw error;
}
