"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { friendlyError } from "@/lib/format";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Avatar } from "@/components/ui/Avatar";

export function UserMenu() {
  const { enabled, loading, user, profile, openAuthModal, signOut, deleteAccount } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (!enabled) return null;

  if (loading) {
    return <div className="h-9 w-28 animate-pulse rounded-xl bg-white/30" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={openAuthModal}
        className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-amber-900 shadow-md transition hover:bg-amber-50 active:scale-95 sm:text-sm"
      >
        <span aria-hidden="true">🔑</span>
        Entrar
      </button>
    );
  }

  const name = profile?.displayName ?? user.email?.split("@")[0] ?? "Você";

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount();
      setConfirmDelete(false);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/95 p-1.5 pl-2 pr-3 text-xs font-semibold text-stone-800 shadow-sm"
      >
        <Avatar name={name} url={profile?.avatarUrl ?? null} size={24} />
        <span className="max-w-[110px] truncate">{name.split(" ")[0]}</span>
        <span aria-hidden="true" className="text-stone-400">
          ▾
        </span>
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 z-[1000] mt-2 w-56 overflow-hidden rounded-xl border border-stone-200 bg-white text-sm text-stone-700 shadow-xl"
        >
          <p className="truncate border-b border-stone-100 px-4 py-2.5 text-xs text-stone-500">
            {user.email}
          </p>
          {profile?.isAdmin && (
            <Link role="menuitem" href="/admin" className="block px-4 py-2.5 hover:bg-amber-50">
              Painel de moderação
            </Link>
          )}
          <button
            role="menuitem"
            type="button"
            className="block w-full px-4 py-2.5 text-left hover:bg-amber-50"
            onClick={() => {
              setMenuOpen(false);
              signOut().catch(() => undefined);
            }}
          >
            Sair
          </button>
          <button
            role="menuitem"
            type="button"
            className="block w-full px-4 py-2.5 text-left text-red-700 hover:bg-red-50"
            onClick={() => {
              setMenuOpen(false);
              setConfirmDelete(true);
            }}
          >
            Excluir minha conta
          </button>
        </div>
      )}

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Excluir conta"
        icon="⚠️"
      >
        <div className="space-y-4 text-sm text-stone-700">
          <p>
            Isso apaga <strong>definitivamente</strong> sua conta, seus relatos e fotos no mural,
            sua lista de compras, confirmações e sugestões. Não dá para desfazer.
          </p>
          {error && <Alert kind="error">{error}</Alert>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-xl border border-stone-300 px-4 py-2 font-medium hover:bg-stone-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? "Excluindo…" : "Excluir para sempre"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
