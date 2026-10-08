"use client";

import { useId, useState, type FormEvent } from "react";
import { z } from "zod";
import { friendlyError } from "@/lib/format";
import type { ListMember } from "@/lib/repositories/shopping";
import { Alert } from "@/components/ui/Alert";

const emailSchema = z.string().trim().email();

/** Compartilhar a minha lista por e-mail e ver/remover quem tem acesso. */
export function SharePanel({
  members,
  onShare,
  onRemove,
}: {
  members: ListMember[];
  onShare: (email: string) => Promise<string>;
  onRemove: (member: ListMember) => Promise<void>;
}) {
  const ids = useId();
  // Aberto por padrão quando já há pessoas com acesso (dado que chega depois).
  const [openChoice, setOpenChoice] = useState<boolean | null>(null);
  const open = openChoice ?? members.length > 0;
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!emailSchema.safeParse(email).success) {
      setMessage({ kind: "error", text: "Digite um e-mail válido." });
      return;
    }
    setBusy(true);
    try {
      const name = await onShare(email.trim());
      setMessage({ kind: "success", text: `Lista compartilhada com ${name}.` });
      setEmail("");
    } catch (err) {
      setMessage({ kind: "error", text: friendlyError(err) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (member: ListMember) => {
    if (!window.confirm(`Parar de compartilhar sua lista com ${member.name}?`)) return;
    setMessage(null);
    try {
      await onRemove(member);
    } catch (err) {
      setMessage({ kind: "error", text: friendlyError(err) });
    }
  };

  return (
    <section
      aria-label="Compartilhar lista"
      className="rounded-2xl border border-sky-200 bg-sky-50/60 p-3.5"
    >
      <button
        type="button"
        onClick={() => setOpenChoice(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-sky-900"
      >
        <span>
          <span aria-hidden="true">👥</span> Compartilhar lista
          {members.length > 0 && ` (${members.length})`}
        </span>
        <span aria-hidden="true">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-stone-600">
            Quem você adicionar vê sua lista e pode adicionar, marcar e remover itens. A pessoa
            precisa ter entrado no app pelo menos uma vez.
          </p>

          <form onSubmit={submit} className="flex flex-wrap gap-2" noValidate>
            <label htmlFor={`${ids}-email`} className="sr-only">
              E-mail da pessoa
            </label>
            <input
              id={`${ids}-email`}
              type="email"
              inputMode="email"
              autoComplete="off"
              placeholder="e-mail da pessoa"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700 disabled:opacity-60"
            >
              {busy ? "Compartilhando…" : "Compartilhar"}
            </button>
          </form>

          {message && <Alert kind={message.kind}>{message.text}</Alert>}

          {members.length > 0 && (
            <ul aria-label="Pessoas com acesso" className="space-y-1.5">
              {members.map((m) => (
                <li
                  key={m.memberId}
                  className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-sm"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-stone-800">{m.name}</span>
                    <span className="block truncate text-xs text-stone-500">{m.email}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(m)}
                    aria-label={`Remover ${m.name} da lista`}
                    className="shrink-0 text-xs font-semibold text-stone-500 hover:text-red-600"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
