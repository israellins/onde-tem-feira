"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { formatRelativeTime, friendlyError } from "@/lib/format";
import { formatDays } from "@/lib/days";
import {
  approveSuggestion,
  listPendingSuggestions,
  listReportedPosts,
  moderatePost,
  rejectSuggestion,
  type ReportedPost,
} from "@/lib/repositories/feedback";
import type { FeiraSuggestion } from "@/types/community";
import type { DayOfWeek } from "@/types/feira";
import { Alert } from "@/components/ui/Alert";
import { AuthModal } from "@/components/AuthModal";

const FIELD_LABEL: Record<string, string> = {
  name: "Nome",
  city: "Cidade",
  neighborhood: "Bairro",
  address: "Endereço",
  hours: "Horário",
  daysOfWeek: "Dias",
  lat: "Latitude",
  lng: "Longitude",
  active: "Ativa",
};

function renderValue(key: string, value: unknown): string {
  if (key === "daysOfWeek" && Array.isArray(value)) return formatDays(value as DayOfWeek[]);
  if (key === "active") return value === false ? "Não (feira encerrada)" : "Sim";
  if (value === null || value === "") return "(vazio)";
  return String(value);
}

export function AdminPanel({ feiraNames }: { feiraNames: Record<string, string> }) {
  const { supabase, user, profile, loading, openAuthModal } = useAuth();
  const [suggestions, setSuggestions] = useState<FeiraSuggestion[] | null>(null);
  const [reports, setReports] = useState<ReportedPost[] | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const isAdmin = profile?.isAdmin ?? false;

  useEffect(() => {
    if (!supabase || !isAdmin) return;
    let cancelled = false;
    Promise.all([listPendingSuggestions(supabase), listReportedPosts(supabase)])
      .then(([s, r]) => {
        if (cancelled) return;
        setSuggestions(s);
        setReports(r);
      })
      .catch((e) => !cancelled && setMessage({ kind: "error", text: friendlyError(e) }));
    return () => {
      cancelled = true;
    };
  }, [supabase, isAdmin, reloadKey]);

  const act = async (id: string, fn: () => Promise<unknown>, ok: string) => {
    setBusyId(id);
    setMessage(null);
    try {
      await fn();
      setMessage({ kind: "success", text: ok });
      setReloadKey((k) => k + 1);
    } catch (e) {
      setMessage({ kind: "error", text: (e as { message?: string })?.message ?? friendlyError(e) });
    } finally {
      setBusyId(null);
    }
  };

  let body: React.ReactNode;
  if (!supabase) {
    body = <Alert kind="info">O Supabase não está configurado neste ambiente.</Alert>;
  } else if (loading) {
    body = <p className="text-sm text-stone-500">Carregando…</p>;
  } else if (!user) {
    body = (
      <button
        type="button"
        onClick={openAuthModal}
        className="rounded-xl bg-amber-600 px-4 py-2 font-semibold text-white"
      >
        Entrar
      </button>
    );
  } else if (!profile?.isAdmin) {
    body = <Alert kind="error">Sua conta não tem permissão de moderação.</Alert>;
  } else {
    body = (
      <div className="space-y-8">
        {message && <Alert kind={message.kind}>{message.text}</Alert>}

        <section className="space-y-3">
          <h2 className="text-lg font-bold">Sugestões pendentes ({suggestions?.length ?? "…"})</h2>
          {suggestions?.length === 0 && (
            <p className="text-sm text-stone-500">Nada para revisar.</p>
          )}
          {suggestions?.map((s) => (
            <article
              key={s.id}
              className="space-y-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold">
                  {s.kind === "nova"
                    ? "Nova feira"
                    : `Correção: ${feiraNames[s.feiraId ?? ""] ?? s.feiraId}`}
                </h3>
                <p className="text-xs text-stone-500">
                  por {s.authorName} · {formatRelativeTime(s.createdAt)}
                </p>
              </header>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                {Object.entries(s.payload).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="font-medium text-stone-500">{FIELD_LABEL[k] ?? k}</dt>
                    <dd className="break-words">{renderValue(k, v)}</dd>
                  </div>
                ))}
              </dl>
              {s.kind === "nova" && typeof s.payload.lat === "number" && (
                <a
                  className="text-xs font-semibold text-amber-700 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.openstreetmap.org/?mlat=${s.payload.lat}&mlon=${s.payload.lng}#map=18/${s.payload.lat}/${s.payload.lng}`}
                >
                  Ver local no mapa ↗
                </a>
              )}
              {s.comment && (
                <p className="rounded-lg bg-stone-50 p-2 text-sm italic">“{s.comment}”</p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  disabled={busyId === s.id}
                  onClick={() =>
                    act(
                      s.id,
                      () => approveSuggestion(supabase, s.id, null),
                      "Sugestão aprovada. O mapa atualiza em até 5 minutos.",
                    )
                  }
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Aprovar
                </button>
                <button
                  type="button"
                  disabled={busyId === s.id}
                  onClick={() =>
                    act(s.id, () => rejectSuggestion(supabase, s.id, null), "Sugestão rejeitada.")
                  }
                  className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold hover:bg-stone-100 disabled:opacity-60"
                >
                  Rejeitar
                </button>
              </div>
            </article>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">Relatos denunciados ({reports?.length ?? "…"})</h2>
          {reports?.length === 0 && <p className="text-sm text-stone-500">Nenhuma denúncia.</p>}
          {reports?.map((r) => (
            <article
              key={r.postId}
              className="space-y-2 rounded-2xl border border-red-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs text-stone-500">
                {feiraNames[r.feiraId] ?? r.feiraId} · por {r.authorName} {r.hidden && "· (oculto)"}
              </p>
              <p className="whitespace-pre-line text-sm">{r.text}</p>
              <ul className="text-xs text-red-800">
                {r.reasons.map((reason, i) => (
                  <li key={i}>Denúncia: {reason}</li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busyId === r.postId}
                  onClick={() =>
                    act(r.postId, () => moderatePost(supabase, r.postId, true), "Relato ocultado.")
                  }
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  Ocultar relato
                </button>
                <button
                  type="button"
                  disabled={busyId === r.postId}
                  onClick={() =>
                    act(
                      r.postId,
                      () => moderatePost(supabase, r.postId, false),
                      "Denúncias descartadas.",
                    )
                  }
                  className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold hover:bg-stone-100 disabled:opacity-60"
                >
                  Manter e descartar denúncias
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <Link href="/" className="text-sm font-semibold text-amber-700 hover:underline">
        ← Voltar ao mapa
      </Link>
      <h1 className="text-2xl font-extrabold">Painel de moderação</h1>
      {body}
      <AuthModal />
    </div>
  );
}
