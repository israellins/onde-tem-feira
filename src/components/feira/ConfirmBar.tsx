"use client";

import { useState } from "react";
import type { Feira } from "@/types/feira";
import { useAuth } from "@/lib/auth/AuthProvider";
import { formatIsoDate, friendlyError } from "@/lib/format";
import type { ConfirmationStatus, MyConfirmation } from "@/lib/repositories/feedback";
import { Alert } from "@/components/ui/Alert";

export function ConfirmBar({
  feira,
  myConfirmation,
  onConfirm,
}: {
  feira: Feira;
  myConfirmation?: MyConfirmation;
  onConfirm: (feira: Feira, status: ConfirmationStatus) => Promise<void>;
}) {
  const { user, openAuthModal } = useAuth();
  const [busy, setBusy] = useState<ConfirmationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = async (status: ConfirmationStatus) => {
    if (!user) {
      openAuthModal();
      return;
    }
    setBusy(status);
    setError(null);
    try {
      await onConfirm(feira, status);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(null);
    }
  };

  const btn = (active: boolean) =>
    `flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-60 ${
      active
        ? "border-emerald-500 bg-emerald-50 text-emerald-800"
        : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
    }`;

  return (
    <section
      aria-label="Confirmar funcionamento"
      className="space-y-2 rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-3"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-stone-700">
        Esteve nesta feira recentemente?
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy !== null}
          aria-pressed={myConfirmation?.status === "funcionando"}
          onClick={() => send("funcionando")}
          className={btn(myConfirmation?.status === "funcionando")}
        >
          {busy === "funcionando" ? "Enviando…" : "✓ Está funcionando"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          aria-pressed={myConfirmation?.status === "nao_encontrada"}
          onClick={() => send("nao_encontrada")}
          className={btn(myConfirmation?.status === "nao_encontrada")}
        >
          {busy === "nao_encontrada" ? "Enviando…" : "✗ Não encontrei"}
        </button>
      </div>
      {myConfirmation && (
        <p className="text-xs text-stone-500">
          Você informou em {formatIsoDate(myConfirmation.confirmedOn)}. Obrigado!
        </p>
      )}
      {error && <Alert kind="error">{error}</Alert>}
    </section>
  );
}
