import type { TypedSupabaseClient } from "@/lib/supabase/client";
import type { ConfirmationStats } from "@/types/feira";
import type { FeiraChangeSuggestion, FeiraSuggestion, NewFeiraSuggestion } from "@/types/community";

export type ConfirmationStatus = "funcionando" | "nao_encontrada";

export async function fetchConfirmationStats(
  supabase: TypedSupabaseClient,
): Promise<Record<string, ConfirmationStats>> {
  const { data, error } = await supabase.rpc("feira_confirmation_stats");
  if (error) throw error;
  const result: Record<string, ConfirmationStats> = {};
  for (const row of data ?? []) {
    result[row.feira_id] = {
      confirmations30d: Number(row.confirmations_30d),
      notFound30d: Number(row.not_found_30d),
      lastConfirmedOn: row.last_confirmed_on,
    };
  }
  return result;
}

export interface MyConfirmation {
  status: ConfirmationStatus;
  confirmedOn: string;
}

/** Última confirmação do próprio usuário para cada feira (últimos 30 dias). */
export async function fetchMyConfirmations(
  supabase: TypedSupabaseClient,
): Promise<Record<string, MyConfirmation>> {
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("feira_confirmations")
    .select("feira_id, status, confirmed_on")
    .gte("confirmed_on", since)
    .order("confirmed_on", { ascending: false })
    .limit(1000);
  if (error) throw error;
  const result: Record<string, MyConfirmation> = {};
  for (const row of data ?? []) {
    if (!(row.feira_id in result)) {
      result[row.feira_id] = {
        status: row.status as ConfirmationStatus,
        confirmedOn: row.confirmed_on,
      };
    }
  }
  return result;
}

/** Registra (ou corrige) a confirmação de hoje. */
export async function confirmFeira(
  supabase: TypedSupabaseClient,
  userId: string,
  feiraId: string,
  status: ConfirmationStatus,
): Promise<void> {
  const { error } = await supabase
    .from("feira_confirmations")
    .upsert(
      { feira_id: feiraId, user_id: userId, status },
      { onConflict: "feira_id,user_id,confirmed_on" },
    );
  if (error) throw error;
}

export async function suggestNewFeira(
  supabase: TypedSupabaseClient,
  userId: string,
  payload: NewFeiraSuggestion,
  comment: string | null,
): Promise<void> {
  const { error } = await supabase.from("feira_suggestions").insert({
    user_id: userId,
    kind: "nova",
    payload,
    comment,
  });
  if (error) throw error;
}

export async function suggestFeiraChange(
  supabase: TypedSupabaseClient,
  userId: string,
  feiraId: string,
  payload: FeiraChangeSuggestion,
  comment: string | null,
): Promise<void> {
  const { error } = await supabase.from("feira_suggestions").insert({
    user_id: userId,
    kind: "alteracao",
    feira_id: feiraId,
    payload,
    comment,
  });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Administração
// ---------------------------------------------------------------------------

export async function listPendingSuggestions(
  supabase: TypedSupabaseClient,
): Promise<FeiraSuggestion[]> {
  const { data, error } = await supabase
    .from("feira_suggestions")
    .select(
      "id, kind, feira_id, payload, comment, status, review_note, created_at, author:profiles!feira_suggestions_user_id_fkey(display_name)",
    )
    .eq("status", "pendente")
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map((row) => {
    const author = row.author;
    return {
      id: row.id,
      kind: row.kind as FeiraSuggestion["kind"],
      feiraId: row.feira_id,
      payload: (row.payload ?? {}) as Record<string, unknown>,
      comment: row.comment,
      status: row.status as FeiraSuggestion["status"],
      reviewNote: row.review_note,
      authorName: author?.display_name ?? "Usuário",
      createdAt: row.created_at,
    };
  });
}

export async function approveSuggestion(
  supabase: TypedSupabaseClient,
  id: string,
  note: string | null,
): Promise<string> {
  const { data, error } = await supabase.rpc("approve_suggestion", {
    suggestion_id: id,
    note: note ?? undefined,
  });
  if (error) throw error;
  return data;
}

export async function rejectSuggestion(
  supabase: TypedSupabaseClient,
  id: string,
  note: string | null,
): Promise<void> {
  const { error } = await supabase.rpc("reject_suggestion", {
    suggestion_id: id,
    note: note ?? undefined,
  });
  if (error) throw error;
}

export interface ReportedPost {
  postId: string;
  feiraId: string;
  text: string;
  authorName: string;
  hidden: boolean;
  reasons: string[];
}

export async function listReportedPosts(supabase: TypedSupabaseClient): Promise<ReportedPost[]> {
  const { data, error } = await supabase
    .from("post_reports")
    .select(
      "reason, post:posts!inner(id, feira_id, text, hidden, author:profiles!posts_user_id_fkey(display_name))",
    )
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) throw error;

  const byPost = new Map<string, ReportedPost>();
  for (const row of data ?? []) {
    const post = row.post;
    if (!post) continue;
    const author = post.author;
    const entry: ReportedPost = byPost.get(post.id) ?? {
      postId: post.id,
      feiraId: post.feira_id,
      text: post.text,
      authorName: author?.display_name ?? "Usuário",
      hidden: post.hidden,
      reasons: [],
    };
    entry.reasons.push(row.reason);
    byPost.set(post.id, entry);
  }
  return [...byPost.values()];
}

/** Oculta (ou reexibe) um relato e limpa as denúncias dele. */
export async function moderatePost(
  supabase: TypedSupabaseClient,
  postId: string,
  hidden: boolean,
): Promise<void> {
  const { error } = await supabase.from("posts").update({ hidden }).eq("id", postId);
  if (error) throw error;
  const { error: clearError } = await supabase.from("post_reports").delete().eq("post_id", postId);
  if (clearError) throw clearError;
}
