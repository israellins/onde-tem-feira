"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import type { ShoppingItem } from "@/types/shopping";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: "frutas", label: "🍎 Frutas", color: "bg-red-50 text-red-700 border-red-200" },
  { id: "legumes", label: "🥕 Legumes & Verduras", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { id: "pasteis", label: "🥟 Pastéis & Lanches", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { id: "peixes", label: "🐟 Peixes & Carnes", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "temperos", label: "🌿 Temperos & Ervas", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "outros", label: "📦 Outros", color: "bg-stone-50 text-stone-700 border-stone-200" },
] as const;

export function ShoppingListModal({ isOpen, onClose }: Props) {
  const { user, openAuthModal } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [quantity, setQuantity] = useState("1 kg");
  const [priceEstimate, setPriceEstimate] = useState("");
  const [category, setCategory] = useState<ShoppingItem["category"]>("frutas");

  useEffect(() => {
    if (!user) return;
    try {
      const saved = localStorage.getItem(`onde_tem_feira_shopping_${user.id}`);
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        // Initial sample items for new user
        const initialItems: ShoppingItem[] = [
          {
            id: "1",
            userId: user.id,
            item: "Tomate italiano",
            quantity: "1.5 kg",
            priceEstimate: 8.5,
            category: "legumes",
            completed: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            userId: user.id,
            item: "Pastel de carne com queijo",
            quantity: "2 un",
            priceEstimate: 16.0,
            category: "pasteis",
            completed: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: "3",
            userId: user.id,
            item: "Banana Prata",
            quantity: "1 dúzia",
            priceEstimate: 6.0,
            category: "frutas",
            completed: false,
            createdAt: new Date().toISOString(),
          },
        ];
        setItems(initialItems);
        localStorage.setItem(`onde_tem_feira_shopping_${user.id}`, JSON.stringify(initialItems));
      }
    } catch {
      // Storage fallback
    }
  }, [user]);

  const saveItems = (newItems: ShoppingItem[]) => {
    setItems(newItems);
    if (user) {
      localStorage.setItem(`onde_tem_feira_shopping_${user.id}`, JSON.stringify(newItems));
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim() || !user) return;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      userId: user.id,
      item: newItemText.trim(),
      quantity: quantity.trim() || "1 un",
      priceEstimate: priceEstimate ? parseFloat(priceEstimate) : undefined,
      category,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    saveItems([newItem, ...items]);
    setNewItemText("");
    setPriceEstimate("");
  };

  const toggleItem = (id: string) => {
    saveItems(
      items.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i))
    );
  };

  const removeItem = (id: string) => {
    saveItems(items.filter((i) => i.id !== id));
  };

  const clearCompleted = () => {
    saveItems(items.filter((i) => !i.completed));
  };

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-center border border-amber-100">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
            📝
          </div>
          <h3 className="text-xl font-bold text-stone-900">Lista de Compras da Feira</h3>
          <p className="text-sm text-stone-600 mt-2 mb-6">
            Você precisa estar conectado com sua conta ou Gmail para criar e gerenciar sua lista de compras da feira!
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-100"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onClose();
                openAuthModal();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-md hover:from-amber-600 hover:to-orange-600"
            >
              Fazer Login agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalEstimate = items.reduce(
    (sum, item) => sum + (item.priceEstimate || 0),
    0
  );
  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-orange-100 max-h-[90vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-md">
            🛒
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">Minha Lista de Feira</h2>
            <p className="text-xs text-stone-500">
              {completedCount} de {items.length} itens marcados · {user.name}
            </p>
          </div>
        </div>

        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/60 mb-4 flex flex-col gap-2.5">
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Ex: Cheiro verde, Pastel de vento, Tomate..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-white"
            />
            <input
              type="text"
              placeholder="Qtd (ex: 1 kg)"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-24 rounded-xl border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-white"
            />
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-xs font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-white text-stone-700"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <div className="relative w-28">
              <span className="absolute left-2.5 top-2 text-xs font-semibold text-stone-400">R$</span>
              <input
                type="number"
                step="0.50"
                placeholder="Preço (opcional)"
                value={priceEstimate}
                onChange={(e) => setPriceEstimate(e.target.value)}
                className="w-full rounded-xl border border-stone-300 pl-8 pr-2 py-2 text-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-white"
              />
            </div>

            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow transition active:scale-[0.98]"
            >
              + Adicionar
            </button>
          </div>
        </form>

        {/* List items */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 min-h-[160px] max-h-[340px]">
          {items.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-sm">
              Sua lista está vazia. Adicione os produtos que deseja comprar na feira!
            </div>
          ) : (
            items.map((item) => {
              const catObj = CATEGORIES.find((c) => c.id === item.category);
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                    item.completed
                      ? "bg-stone-50 border-stone-200 opacity-60"
                      : "bg-white border-stone-200 hover:border-amber-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleItem(item.id)}
                      className="w-5 h-5 rounded-lg text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                    />
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium text-stone-900 truncate ${
                          item.completed ? "line-through text-stone-400" : ""
                        }`}
                      >
                        {item.item}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-stone-500 font-medium">
                          {item.quantity}
                        </span>
                        {catObj && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catObj.color}`}
                          >
                            {catObj.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.priceEstimate !== undefined && (
                      <span className="text-xs font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                        R$ {item.priceEstimate.toFixed(2)}
                      </span>
                    )}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-stone-300 hover:text-red-500 text-sm p-1 transition"
                      title="Remover item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & total */}
        <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500">Estimativa total:</p>
            <p className="text-lg font-extrabold text-amber-700">
              R$ {totalEstimate.toFixed(2)}
            </p>
          </div>
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="text-xs text-stone-400 hover:text-stone-600 underline font-medium"
            >
              Limpar concluídos ({completedCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
