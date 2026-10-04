"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { z } from "zod";
import { useAuth } from "@/lib/auth/AuthProvider";
import { friendlyError } from "@/lib/format";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";

const emailSchema = z.string().trim().email();

export function AuthModal() {
  const { enabled, isAuthModalOpen, closeAuthModal, signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    closeAuthModal();
    setStatus("idle");
    setError(null);
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogle(); // redireciona para o Google
    } catch (e) {
      setError(friendlyError(e));
    }
  };

  const handleEmail = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!emailSchema.safeParse(email).success) {
      setError("Digite um e-mail válido.");
      return;
    }
    setStatus("sending");
    try {
      await signInWithEmail(email);
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      const msg = String((err as { message?: string })?.message ?? "");
      setError(
        /rate limit|security purposes/i.test(msg)
          ? "Muitas tentativas. Aguarde um minuto e tente de novo."
          : friendlyError(err),
      );
    }
  };

  return (
    <Modal open={isAuthModalOpen} onClose={close} title="Entrar no Onde tem feira" icon="🍊">
      {!enabled ? (
        <Alert kind="info">
          O login ainda não está disponível nesta versão. O mapa e a lista de compras funcionam
          normalmente.
        </Alert>
      ) : status === "sent" ? (
        <div className="space-y-3 text-sm text-stone-700">
          <Alert kind="success">
            Enviamos um link de acesso para <strong>{email.trim()}</strong>.
          </Alert>
          <p>Abra o e-mail neste aparelho e toque no link para entrar. Ele vale por 1 hora.</p>
          <p className="text-xs text-stone-500">
            Não chegou? Confira a caixa de spam ou{" "}
            <button
              type="button"
              className="font-semibold text-amber-700 underline"
              onClick={() => setStatus("idle")}
            >
              tente outro e-mail
            </button>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Entre para publicar no mural, confirmar feiras, sugerir correções e sincronizar sua
            lista de compras entre aparelhos.
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white px-4 py-3 font-medium text-stone-700 shadow-sm transition hover:bg-stone-50 active:scale-[0.99]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.31 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Continuar com Google
          </button>

          <div className="flex items-center" aria-hidden="true">
            <div className="flex-1 border-t border-stone-200" />
            <span className="px-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
              ou
            </span>
            <div className="flex-1 border-t border-stone-200" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3" noValidate>
            <div>
              <label
                htmlFor="auth-email"
                className="mb-1 block text-sm font-semibold text-stone-700"
              >
                Receber link de acesso por e-mail
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 font-semibold text-white shadow-md transition hover:from-amber-600 hover:to-orange-600 disabled:opacity-60"
            >
              {status === "sending" ? "Enviando…" : "Enviar link"}
            </button>
          </form>

          {error && <Alert kind="error">{error}</Alert>}

          <p className="text-center text-xs text-stone-500">
            Ao entrar você concorda com os{" "}
            <Link href="/termos" className="underline">
              termos de uso
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" className="underline">
              política de privacidade
            </Link>
            .
          </p>
        </div>
      )}
    </Modal>
  );
}
