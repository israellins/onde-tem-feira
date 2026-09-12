"use client";

import { DAYS_OF_WEEK, todayDayOfWeek, DAY_LABEL } from "@/lib/days";
import type { FeiraFilters } from "@/types/feira";

interface Props {
  cities: string[];
  filters: FeiraFilters;
  onChange: (next: FeiraFilters) => void;
  resultCount: number;
}

export function Filters({ cities, filters, onChange, resultCount }: Props) {
  const today = todayDayOfWeek();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="city">
          Cidade
        </label>
        <select
          id="city"
          value={filters.city}
          onChange={(e) =>
            onChange({ ...filters, city: e.target.value, todayOnly: false })
          }
          className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-stone-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="">Todas as cidades</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="day">
          Dia da semana
        </label>
        <select
          id="day"
          value={filters.todayOnly ? today : filters.day}
          disabled={filters.todayOnly}
          onChange={(e) =>
            onChange({ ...filters, day: e.target.value, todayOnly: false })
          }
          className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-stone-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-60"
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
          onClick={() =>
            onChange({
              ...filters,
              todayOnly: !filters.todayOnly,
              day: !filters.todayOnly ? today : "",
            })
          }
          className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
            filters.todayOnly
              ? "bg-amber-500 text-white shadow"
              : "bg-amber-100 text-amber-900 hover:bg-amber-200"
          }`}
          aria-pressed={filters.todayOnly}
        >
          Hoje ({DAY_LABEL[today]})
        </button>
      </div>

      <div className="relative">
        <label className="sr-only" htmlFor="search">
          Buscar feira
        </label>
        <input
          id="search"
          type="search"
          placeholder="Buscar por nome, bairro ou endereço…"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm text-stone-800 shadow-sm placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <p className="text-xs text-stone-500">
        {resultCount} feira{resultCount === 1 ? "" : "s"} encontrada
        {resultCount === 1 ? "" : "s"}
      </p>
    </div>
  );
}
