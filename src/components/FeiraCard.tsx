"use client";

import { memo } from "react";
import type { ConfirmationStats, Feira } from "@/types/feira";
import { formatDays } from "@/lib/days";
import { FeiraBadges, HoursText } from "@/components/FeiraBadges";

interface Props {
  feira: Feira;
  selected: boolean;
  stats?: ConfirmationStats;
  onSelect: (feira: Feira) => void;
  onOpenDetails: (feira: Feira) => void;
}

function FeiraCardBase({ feira, selected, stats, onSelect, onOpenDetails }: Props) {
  return (
    <article
      aria-current={selected ? "true" : undefined}
      className={`rounded-xl border p-3 shadow-sm transition hover:shadow-md ${
        selected
          ? "border-amber-500 bg-amber-50 ring-1 ring-amber-400"
          : "border-orange-100 bg-white hover:border-amber-300"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(feira)}
        className="block w-full text-left"
        aria-label={`Mostrar ${feira.name} no mapa`}
      >
        <h3 className="text-sm font-semibold leading-snug text-stone-800 sm:text-base">
          {feira.name}
        </h3>
        <p className="mt-1 text-xs text-stone-600 sm:text-sm">
          {feira.neighborhood} · {feira.city}
        </p>
        <p className="mt-1 text-xs font-medium text-amber-800">
          {formatDays(feira.daysOfWeek)} · <HoursText hours={feira.hours} />
        </p>
        {feira.address && (
          <p className="mt-1 line-clamp-2 text-xs text-stone-500">{feira.address}</p>
        )}
        <div className="mt-2">
          <FeiraBadges feira={feira} stats={stats} />
        </div>
      </button>

      <div className="mt-2.5 flex items-center justify-between border-t border-stone-100 pt-2">
        <button
          type="button"
          onClick={() => onOpenDetails(feira)}
          className="inline-flex items-center gap-1 rounded-lg bg-amber-100/80 px-2.5 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-200"
        >
          <span aria-hidden="true">💬</span> Mural, preços e detalhes
        </button>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${feira.lat},${feira.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-stone-500 hover:text-amber-700"
        >
          Como chegar ↗
        </a>
      </div>
    </article>
  );
}

export const FeiraCard = memo(FeiraCardBase);
