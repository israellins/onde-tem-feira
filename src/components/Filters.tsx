"use client";

import { DAYS_OF_WEEK, DAY_LABEL } from "@/lib/days";
import type { DayOfWeek, FeiraFilters } from "@/types/feira";

interface Props {
  cities: string[];
  filters: FeiraFilters;
  onChange: (next: FeiraFilters) => void;
  resultCount: number;
  /** null enquanto o dia do aparelho ainda não é conhecido (renderização no servidor). */
  today: DayOfWeek | null;
}

const selectClass =
  "rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-stone-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-60";

export function Filters({ cities, filters, onChange, resultCount, today }: Props) {
  const hasFilters = Boolean(filters.city || filters.day || filters.query || filters.todayOnly);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="filtro-cidade">
          Cidade
        </label>
        <select
          id="filtro-cidade"
          value={filters.city}
          onChange={(e) => onChange({ ...filters, city: e.target.value })}
          className={selectClass}
        >
          <option value="">Todas as cidades</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="filtro-dia">
          Dia da semana
        </label>
        <select
          id="filtro-dia"
          value={filters.todayOnly && today ? today : filters.day}
          disabled={filters.todayOnly}
          onChange={(e) =>
            onChange({
              ...filters,
              day: e.target.value as DayOfWeek | "",
              todayOnly: false,
            })
          }
          className={selectClass}
        >
          <option value="">Todos os dias</option>
          {DAYS_OF_WEEK.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={!today}
          onClick={() => onChange({ ...filters, todayOnly: !filters.todayOnly, day: "" })}
          aria-pressed={filters.todayOnly}
          className={`rounded-full px-3 py-2 text-sm font-semibold transition disabled:opacity-60 ${
            filters.todayOnly
              ? "bg-amber-500 text-white shadow"
              : "bg-amber-100 text-amber-900 hover:bg-amber-200"
          }`}
        >
          Hoje{today ? ` (${DAY_LABEL[today]})` : ""}
        </button>
      </div>

      <div>
        <label className="sr-only" htmlFor="filtro-busca">
          Buscar feira
        </label>
        <input
          id="filtro-busca"
          type="search"
          placeholder="Buscar por nome, bairro ou endereço…"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm text-stone-800 shadow-sm placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-stone-500">
        <p aria-live="polite">
          {resultCount === 1 ? "1 feira encontrada" : `${resultCount} feiras encontradas`}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => onChange({ city: "", day: "", query: "", todayOnly: false })}
            className="font-semibold text-amber-700 hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
