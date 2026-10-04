"use client";

/* eslint-disable @next/next/no-img-element -- fotos do Supabase Storage, tamanho variável */

import { useCallback, useEffect, useState } from "react";
import type { Feira } from "@/types/feira";
import type { FeiraPost } from "@/types/community";
import { useAuth } from "@/lib/auth/AuthProvider";
import { formatRelativeTime, friendlyError } from "@/lib/format";
import { deletePost, listPosts, reportPost } from "@/lib/repositories/posts";
import { Alert } from "@/components/ui/Alert";
import { Avatar } from "@/components/ui/Avatar";
import { PostForm } from "@/components/feira/PostForm";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; posts: FeiraPost[] };

export function PostFeed({ feira }: { feira: Feira }) {
  const { supabase, user, profile, openAuthModal } = useAuth();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [notice, setNotice] = useState<string | null>(null);
  const [reporting, setReporting] = useState<{ postId: string; reason: string } | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const load = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    listPosts(supabase, feira.id)
      .then((posts) => !cancelled && setState({ status: "ready", posts }))
      .catch((e) => !cancelled && setState({ status: "error", message: friendlyError(e) }));
    return () => {
      cancelled = true;
    };
  }, [supabase, feira.id, reloadKey]);

  const handleDelete = async (post: FeiraPost) => {
    if (!supabase || !window.confirm("Apagar este relato?")) return;
    try {
      await deletePost(supabase, post);
      load();
    } catch (e) {
      setNotice(friendlyError(e));
    }
  };

  const startReport = (post: FeiraPost) => {
    if (!user) {
      openAuthModal();
      return;
    }
    setNotice(null);
    setReporting({ postId: post.id, reason: "" });
  };

  const sendReport = async () => {
    if (!supabase || !user || !reporting) return;
    if (!reporting.reason.trim()) {
      setNotice("Conte o motivo da denúncia.");
      return;
    }
    try {
      await reportPost(supabase, user.id, reporting.postId, reporting.reason.slice(0, 300));
      setReporting(null);
      setNotice("Denúncia enviada. A moderação vai analisar.");
    } catch (e) {
      setNotice(friendlyError(e));
    }
  };

  return (
    <section aria-label="Mural de relatos e preços" className="space-y-3">
      <PostForm feira={feira} onPosted={load} />

      {notice && <Alert kind="info">{notice}</Alert>}

      {state.status === "loading" && (
        <p className="py-6 text-center text-sm text-stone-400">Carregando relatos…</p>
      )}
      {state.status === "error" && (
        <div className="space-y-2">
          <Alert kind="error">{state.message}</Alert>
          <button
            type="button"
            onClick={load}
            className="text-sm font-semibold text-amber-700 underline"
          >
            Tentar de novo
          </button>
        </div>
      )}
      {state.status === "ready" && state.posts.length === 0 && (
        <p className="py-6 text-center text-sm text-stone-500">
          Ainda não há relatos nesta feira. Seja a primeira pessoa a contar como está!
        </p>
      )}
      {state.status === "ready" &&
        state.posts.map((post) => {
          const canDelete = user?.id === post.userId || profile?.isAdmin;
          return (
            <article
              key={post.id}
              className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <header className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Avatar name={post.authorName} url={post.authorAvatar} size={32} />
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{post.authorName}</h4>
                    <p className="text-xs text-stone-500">
                      <time dateTime={post.createdAt}>{formatRelativeTime(post.createdAt)}</time>
                    </p>
                  </div>
                </div>
                {post.rating !== null && (
                  <p className="text-sm text-amber-500" aria-label={`Nota ${post.rating} de 5`}>
                    <span aria-hidden="true">
                      {"★".repeat(post.rating)}
                      {"☆".repeat(5 - post.rating)}
                    </span>
                  </p>
                )}
              </header>

              <p className="whitespace-pre-line break-words text-sm leading-relaxed text-stone-800">
                {post.text}
              </p>

              {post.priceReports.length > 0 && (
                <div className="rounded-xl border border-amber-200/70 bg-amber-50/80 p-2.5">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-900">
                    Preços informados
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {post.priceReports.map((pr, idx) => (
                      <li
                        key={idx}
                        className="rounded-md border border-amber-200 bg-white px-2 py-0.5 text-xs font-medium text-stone-800"
                      >
                        <strong>{pr.product}:</strong>{" "}
                        <span className="font-bold text-amber-800">{pr.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {post.photoUrl && (
                <img
                  src={post.photoUrl}
                  alt={`Foto enviada por ${post.authorName}`}
                  loading="lazy"
                  className="mt-1 max-h-64 w-full rounded-xl border border-stone-200 object-cover"
                />
              )}

              <footer className="flex justify-end gap-3 text-xs">
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(post)}
                    className="font-medium text-stone-500 hover:text-red-600"
                  >
                    Apagar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startReport(post)}
                    className="font-medium text-stone-500 hover:text-red-600"
                  >
                    Denunciar
                  </button>
                )}
              </footer>

              {reporting?.postId === post.id && (
                <div className="space-y-2 rounded-xl border border-red-200 bg-red-50/50 p-2.5">
                  <label
                    htmlFor={`report-${post.id}`}
                    className="block text-xs font-semibold text-stone-700"
                  >
                    Por que este relato é inadequado?
                  </label>
                  <textarea
                    id={`report-${post.id}`}
                    rows={2}
                    maxLength={300}
                    value={reporting.reason}
                    onChange={(e) => setReporting({ postId: post.id, reason: e.target.value })}
                    className="w-full resize-none rounded-lg border border-stone-300 bg-white p-2 text-sm outline-none focus:border-red-400"
                  />
                  <div className="flex justify-end gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setReporting(null)}
                      className="px-2 py-1 text-stone-600"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={sendReport}
                      className="rounded-lg bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                    >
                      Enviar denúncia
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
    </section>
  );
}
