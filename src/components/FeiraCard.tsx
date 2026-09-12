"use client";

import type { Feira } from "@/types/feira";
import { formatDays } from "@/lib/days";

interface Props {
  feira: Feira;
  selected?: boolean;
  onSelect?: (feira: Feira) => void;
}

export function FeiraCard({ feira, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(feira)}
      className={`w-full text-left rounded-xl border p-3 transition shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
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
    </button>
  );
}
