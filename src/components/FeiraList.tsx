"use client";

import { useEffect, useRef, useState } from "react";
import type { ConfirmationStats, Feira } from "@/types/feira";
import { FeiraCard } from "@/components/FeiraCard";

interface Props {
  feiras: Feira[];
  selectedId: string | null;
  stats: Record<string, ConfirmationStats>;
  onSelect: (feira: Feira) => void;
  onOpenDetails: (feira: Feira) => void;
}

const PAGE_SIZE = 40;

export function FeiraList({ feiras, selectedId, stats, onSelect, onOpenDetails }: Props) {
  // Renderiza aos poucos para a lista continuar leve com milhares de feiras.
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [prevFeiras, setPrevFeiras] = useState(feiras);
  if (prevFeiras !== feiras) {
    setPrevFeiras(feiras);
    setVisible(PAGE_SIZE);
  }

  const listRef = useRef<HTMLUListElement>(null);

  // Ao selecionar pelo mapa, rola a lista até o card.
  useEffect(() => {
    if (!selectedId) return;
    const el = listRef.current?.querySelector(`[data-feira-id="${CSS.escape(selectedId)}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  if (feiras.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/50 p-6 text-center text-sm text-stone-600">
        Nenhuma feira encontrada com esses filtros. Tente outra cidade, dia ou busca.
      </div>
    );
  }

  // Garante que a feira selecionada esteja renderizada mesmo fora da página atual.
  const selectedIndex = selectedId ? feiras.findIndex((f) => f.id === selectedId) : -1;
  const limit = Math.max(visible, selectedIndex + 1);

  return (
    <ul
      ref={listRef}
      aria-label="Feiras encontradas"
      className="max-h-[min(52vh,28rem)] space-y-2 overflow-y-auto pr-1 lg:max-h-[calc(100vh-15rem)]"
    >
      {feiras.slice(0, limit).map((f) => (
        <li key={f.id} data-feira-id={f.id}>
          <FeiraCard
            feira={f}
            selected={f.id === selectedId}
            stats={stats[f.id]}
            onSelect={onSelect}
            onOpenDetails={onOpenDetails}
          />
        </li>
      ))}
      {limit < feiras.length && (
        <li>
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="w-full rounded-xl border border-orange-200 bg-white py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50"
          >
            Mostrar mais ({feiras.length - limit} restantes)
          </button>
        </li>
      )}
    </ul>
  );
}
