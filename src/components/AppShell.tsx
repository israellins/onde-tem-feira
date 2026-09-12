"use client";

import { useMemo, useState } from "react";
import type { Feira, FeiraFilters } from "@/types/feira";
import { filterFeiras, uniqueCities } from "@/lib/filterFeiras";
import { Filters } from "@/components/Filters";
import { FeiraList } from "@/components/FeiraList";
import { FeiraMapDynamic } from "@/components/FeiraMapDynamic";

interface Props {
  feiras: Feira[];
}

export function AppShell({ feiras }: Props) {
  const cities = useMemo(() => uniqueCities(feiras), [feiras]);
  const [filters, setFilters] = useState<FeiraFilters>({
    city: "",
    day: "",
    query: "",
    todayOnly: false,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterFeiras(feiras, filters),
    [feiras, filters],
  );

  const selected =
    filtered.find((f) => f.id === selectedId) ??
    feiras.find((f) => f.id === selectedId) ??
    null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
      <header className="rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-4 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-amber-100 text-xs sm:text-sm font-medium tracking-wide uppercase">
              Feiras livres no mapa
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Onde tem feira
            </h1>
            <p className="mt-1 max-w-xl text-sm sm:text-base text-amber-50/95">
              Encontre feiras livres em Rio de Janeiro, São Paulo e Cuiabá —
              filtre por dia, cidade ou bairro e veja no mapa.
            </p>
          </div>
          <p className="text-xs sm:text-sm text-amber-100/90">
            {feiras.length} feiras no catálogo inicial
          </p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(280px,380px)_1fr] lg:items-stretch">
        <aside className="flex flex-col gap-3 rounded-2xl border border-orange-100 bg-white/90 p-3 sm:p-4 shadow-sm backdrop-blur">
          <Filters
            cities={cities}
            filters={filters}
            onChange={(next) => {
              setFilters(next);
              setSelectedId(null);
            }}
            resultCount={filtered.length}
          />
          <FeiraList
            feiras={filtered}
            selectedId={selectedId}
            onSelect={(f) => setSelectedId(f.id)}
          />
        </aside>

        <section className="min-h-[320px] h-[55vh] sm:h-[60vh] lg:h-auto lg:min-h-[calc(100vh-11rem)] rounded-2xl border border-orange-100 bg-white shadow-sm overflow-hidden">
          <FeiraMapDynamic
            feiras={filtered}
            selected={selected}
            city={filters.city}
            onSelect={(f) => setSelectedId(f.id)}
          />
        </section>
      </div>

      <footer className="text-center text-xs text-stone-500 pb-4">
        Dados de fontes municipais e geocodificação aproximada quando necessário.
        Confirme horários locais antes de ir. · Onde tem feira
      </footer>
    </div>
  );
}
