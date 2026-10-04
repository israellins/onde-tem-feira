"use client";

import { useCallback, useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { formatCurrency, friendlyError, parseMoney } from "@/lib/format";
import {
  clearLocalItems,
  createLocalShoppingStore,
  createRemoteShoppingStore,
  pendingTotal,
  readLocalItems,
  type ShoppingStore,
} from "@/lib/repositories/shopping";
import { newShoppingItemSchema, type ShoppingCategory, type ShoppingItem } from "@/types/community";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";

const CATEGORIES: { id: ShoppingCategory; label: string; color: string }[] = [
  { id: "frutas", label: "🍎 Frutas", color: "bg-red-50 text-red-700 border-red-200" },
  {
    id: "legumes",
    label: "🥕 Legumes e verduras",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    id: "pasteis",
    label: "🥟 Pastéis e lanches",
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  { id: "peixes", label: "🐟 Peixes e carnes", color: "bg-blue-50 text-blue-700 border-blue-200" },
  {
    id: "temperos",
    label: "🌿 Temperos e ervas",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  { id: "outros", label: "📦 Outros", color: "bg-stone-50 text-stone-700 border-stone-200" },
];

export function ShoppingListModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return <ShoppingList onClose={onClose} />;
}

function ShoppingList({ onClose }: { onClose: () => void }) {
  const { supabase, user, enabled, openAuthModal } = useAuth();
  const ids = useId();

  const store: ShoppingStore | null = useMemo(() => {
    if (supabase && user) return createRemoteShoppingStore(supabase, user.id);
    if (typeof window === "undefined") return null;
    return createLocalShoppingStore(window.localStorage);
  }, [supabase, user]);

  const [items, setItems] = useState<ShoppingItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [itemText, setItemText] = useState("");
  const [quantity, setQuantity] = useState("1 kg");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ShoppingCategory>("frutas");
  const [localToImport, setLocalToImport] = useState<ShoppingItem[]>([]);

  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!store) return;
    let cancelled = false;
    store
      .list()
      .then((list) => !cancelled && setItems(list))
      .catch((e) => {
        if (cancelled) return;
        setError(friendlyError(e));
        setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [store, reloadKey]);

  // Ao entrar, oferece levar para a conta os itens salvos no aparelho.
  useEffect(() => {
    if (user && typeof window !== "undefined") {
      const local = readLocalItems(window.localStorage);
      Promise.resolve().then(() => setLocalToImport(local));
    }
  }, [user]);

  // Atualização otimista: a tela muda na hora e volta atrás se falhar.
  const mutate = async (optimistic: ShoppingItem[], action: () => Promise<unknown>) => {
    const previous = items;
    setItems(optimistic);
    setError(null);
    try {
      await action();
    } catch (e) {
      setItems(previous);
      setError(friendlyError(e));
    }
  };

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!store) return;
    const parsed = newShoppingItemSchema.safeParse({
      item: itemText,
      quantity: quantity.trim() || "1 un",
      priceEstimate: parseMoney(price),
      category,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Verifique os campos");
      return;
    }
    setError(null);
    try {
      const created = await store.add(parsed.data);
      setItems((prev) => [created, ...(prev ?? [])]);
      setItemText("");
      setPrice("");
    } catch (err) {
      setError(friendlyError(err));
    }
  };

  const importLocal = async () => {
    if (!store) return;
    try {
      for (const i of [...localToImport].reverse()) {
        await store.add({
          item: i.item,
          quantity: i.quantity,
          priceEstimate: i.priceEstimate,
          category: i.category,
        });
      }
      clearLocalItems(window.localStorage);
      setLocalToImport([]);
      reload();
    } catch (e) {
      setError(friendlyError(e));
    }
  };

  const list = items ?? [];
  const completedCount = list.filter((i) => i.completed).length;
  const total = pendingTotal(list);

  return (
    <Modal open onClose={onClose} title="Minha lista de feira" icon="🛒" size="lg">
      <div className="space-y-4">
        <p className="text-xs text-stone-500">
          {user ? "Salva na sua conta e sincronizada entre aparelhos." : "Salva neste aparelho."}{" "}
          {!user && enabled && (
            <button
              type="button"
              onClick={openAuthModal}
              className="font-semibold text-amber-700 underline"
            >
              Entre para sincronizar.
            </button>
          )}
        </p>

        {localToImport.length > 0 && (
          <Alert kind="info">
            Há {localToImport.length} item(ns) salvos neste aparelho.{" "}
            <button type="button" onClick={importLocal} className="font-semibold underline">
              Levar para minha conta
            </button>
          </Alert>
        )}

        <form
          onSubmit={add}
          className="flex flex-col gap-2.5 rounded-2xl border border-amber-200/60 bg-amber-50/70 p-3.5"
          noValidate
        >
          <div className="flex gap-2">
            <label htmlFor={`${ids}-item`} className="sr-only">
              Item
            </label>
            <input
              id={`${ids}-item`}
              type="text"
              maxLength={80}
              placeholder="Ex.: cheiro-verde, tomate…"
              value={itemText}
              onChange={(e) => setItemText(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
            <label htmlFor={`${ids}-qtd`} className="sr-only">
              Quantidade
            </label>
            <input
              id={`${ids}-qtd`}
              type="text"
              maxLength={30}
              placeholder="Qtd."
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-24 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor={`${ids}-cat`} className="sr-only">
              Categoria
            </label>
            <select
              id={`${ids}-cat`}
              value={category}
              onChange={(e) => setCategory(e.target.value as ShoppingCategory)}
              className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 outline-none focus:border-amber-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <div className="relative w-32">
              <span
                aria-hidden="true"
                className="absolute left-2.5 top-2 text-sm font-semibold text-stone-400"
              >
                R$
              </span>
              <label htmlFor={`${ids}-preco`} className="sr-only">
                Preço estimado (opcional)
              </label>
              <input
                id={`${ids}-preco`}
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white py-2 pl-9 pr-2 text-sm outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-amber-700"
            >
              Adicionar
            </button>
          </div>
        </form>

        {error && <Alert kind="error">{error}</Alert>}

        <div className="flex min-h-[120px] flex-col gap-2">
          {items === null ? (
            <p className="py-8 text-center text-sm text-stone-400">Carregando…</p>
          ) : list.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-500">
              Sua lista está vazia. Adicione o que quer comprar na feira!
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {list.map((item) => {
                const cat = CATEGORIES.find((c) => c.id === item.category);
                return (
                  <li
                    key={item.id}
                    className={`flex items-center justify-between gap-2 rounded-2xl border p-3 transition ${
                      item.completed
                        ? "border-stone-200 bg-stone-50 opacity-60"
                        : "border-stone-200 bg-white shadow-sm"
                    }`}
                  >
                    <label className="flex min-w-0 cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() =>
                          store &&
                          mutate(
                            list.map((i) =>
                              i.id === item.id ? { ...i, completed: !i.completed } : i,
                            ),
                            () => store.setCompleted(item.id, !item.completed),
                          )
                        }
                        className="h-5 w-5 cursor-pointer accent-amber-600"
                      />
                      <span className="min-w-0">
                        <span
                          className={`block truncate text-sm font-medium ${item.completed ? "text-stone-400 line-through" : "text-stone-900"}`}
                        >
                          {item.item}
                        </span>
                        <span className="mt-0.5 flex items-center gap-2">
                          <span className="text-xs font-medium text-stone-500">
                            {item.quantity}
                          </span>
                          {cat && (
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cat.color}`}
                            >
                              {cat.label}
                            </span>
                          )}
                        </span>
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      {item.priceEstimate !== null && (
                        <span className="rounded-lg bg-amber-100/80 px-2.5 py-1 text-xs font-bold text-amber-900">
                          {formatCurrency(item.priceEstimate)}
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label={`Remover ${item.item}`}
                        onClick={() =>
                          store &&
                          mutate(
                            list.filter((i) => i.id !== item.id),
                            () => store.remove(item.id),
                          )
                        }
                        className="p-1 text-sm text-stone-400 transition hover:text-red-500"
                      >
                        <span aria-hidden="true">🗑️</span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-stone-200 pt-3">
          <div>
            <p className="text-xs text-stone-500">Falta gastar (estimado):</p>
            <p className="text-lg font-extrabold text-amber-700">{formatCurrency(total)}</p>
          </div>
          {completedCount > 0 && (
            <button
              type="button"
              onClick={() =>
                store &&
                mutate(
                  list.filter((i) => !i.completed),
                  () => store.removeCompleted(),
                )
              }
              className="text-xs font-medium text-stone-500 underline hover:text-stone-700"
            >
              Limpar comprados ({completedCount})
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
