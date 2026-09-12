"use client";

import type { Feira } from "@/types/feira";
import { FeiraCard } from "@/components/FeiraCard";

interface Props {
  feiras: Feira[];
  selectedId?: string | null;
  onSelect: (feira: Feira) => void;
  onOpenFeed?: (feira: Feira) => void;
}

export function FeiraList({ feiras, selectedId, onSelect, onOpenFeed }: Props) {
  if (feiras.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/50 p-6 text-center text-sm text-stone-600">
        Nenhuma feira encontrada com esses filtros. Tente outra cidade, dia ou
        busca.
      </div>
    );
  }

  return (
    <ul className="space-y-2 overflow-y-auto pr-1 max-h-[min(52vh,28rem)] lg:max-h-[calc(100vh-14rem)]">
      {feiras.map((f) => (
        <li key={f.id}>
          <FeiraCard
            feira={f}
            selected={f.id === selectedId}
            onSelect={onSelect}
            onOpenFeed={onOpenFeed}
          />
        </li>
      ))}
    </ul>
  );
}
