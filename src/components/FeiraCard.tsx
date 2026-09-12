"use client";

import type { Feira } from "@/types/feira";
import { formatDays } from "@/lib/days";

interface Props {
  feira: Feira;
  selected?: boolean;
  onSelect?: (feira: Feira) => void;
  onOpenFeed?: (feira: Feira) => void;
}

export function FeiraCard({ feira, selected, onSelect, onOpenFeed }: Props) {
  return (
    <div
      onClick={() => onSelect?.(feira)}
      className={`w-full text-left rounded-xl border p-3 transition shadow-sm hover:shadow-md cursor-pointer ${
        selected
          ? "border-amber-500 bg-amber-50 ring-1 ring-amber-400"
          : "border-orange-100 bg-white hover:border-amber-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-stone-800 leading-snug text-sm sm:text-base">
          {feira.name}
        </h3>
        {feira.accuracy === "approximate" && (
          <span
            className="shrink-0 text-[10px] uppercase tracking-wide rounded-full bg-stone-100 text-stone-500 px-2 py-0.5"
            title="Coordenadas aproximadas"
          >
            aprox.
          </span>
        )}
      </div>
      <p className="mt-1 text-xs sm:text-sm text-stone-600">
        {feira.neighborhood} · {feira.city}
      </p>
      <p className="mt-1 text-xs text-amber-800 font-medium">
        {formatDays(feira.daysOfWeek as string[])}
        {feira.hours ? ` · ${feira.hours}` : ""}
      </p>
      {feira.address && (
        <p className="mt-1 text-xs text-stone-500 line-clamp-2">{feira.address}</p>
      )}

      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-stone-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenFeed?.(feira);
          }}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/80 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition"
        >
          💬 Mural & Preços
        </button>
        <span className="text-[11px] text-stone-400 font-medium hover:text-amber-600">
          Ver no mapa →
        </span>
      </div>
    </div>
  );
}
