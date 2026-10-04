"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Texto curto acima do título (ex.: "Mural & preços"). */
  eyebrow?: string;
  icon?: ReactNode;
  size?: "md" | "lg";
  children: ReactNode;
}

/**
 * Janela modal acessível baseada em <dialog>:
 * fecha com Esc, prende o foco dentro dela, bloqueia a rolagem do fundo e é
 * anunciada corretamente por leitores de tela.
 */
export function Modal({ open, onClose, title, eyebrow, icon, size = "md", children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Clique no fundo escuro (fora do conteúdo) fecha.
        if (e.target === ref.current) onClose();
      }}
      className={`m-auto w-[calc(100%-1.5rem)] ${
        size === "lg" ? "max-w-xl" : "max-w-md"
      } max-h-[92dvh] rounded-3xl border border-orange-100 bg-white p-0 text-stone-900 shadow-2xl backdrop:bg-stone-900/60 backdrop:backdrop-blur-sm`}
    >
      <div className="flex max-h-[92dvh] flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-start gap-3 pr-8">
          {icon && (
            <div
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-2xl text-white shadow-md"
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <span className="rounded-md bg-amber-100/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-900">
                {eyebrow}
              </span>
            )}
            <h2 id={titleId} className="mt-1 text-xl font-bold leading-snug text-stone-900">
              {title}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition hover:bg-stone-200 hover:text-stone-800"
        >
          <span aria-hidden="true">✕</span>
        </button>
        <div className="-mr-1 min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
      </div>
    </dialog>
  );
}
