"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ConfirmationStats, Feira, FeiraFilters } from "@/types/feira";
import { filterFeiras, uniqueCities } from "@/lib/filterFeiras";
import { useToday } from "@/lib/hooks/useToday";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import {
  confirmFeira,
  fetchConfirmationStats,
  fetchMyConfirmations,
  type ConfirmationStatus,
  type MyConfirmation,
} from "@/lib/repositories/feedback";
import { Filters } from "@/components/Filters";
import { FeiraList } from "@/components/FeiraList";
import { FeiraMap } from "@/components/map";
import { AuthModal } from "@/components/AuthModal";
import { UserMenu } from "@/components/UserMenu";
import { ShoppingListModal } from "@/components/ShoppingListModal";
import { FeiraDetailsModal } from "@/components/feira/FeiraDetailsModal";
import { SuggestionModal, type SuggestionTarget } from "@/components/feira/SuggestionModal";

interface Props {
  feiras: Feira[];
}

const EMPTY_FILTERS: FeiraFilters = { city: "", day: "", query: "", todayOnly: false };

function AppShellContent({ feiras }: Props) {
  const { enabled, supabase, user, openAuthModal } = useAuth();
  const today = useToday();
  const cities = useMemo(() => uniqueCities(feiras), [feiras]);

  const [filters, setFilters] = useState<FeiraFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestionTarget | null>(null);
  const [stats, setStats] = useState<Record<string, ConfirmationStats>>({});
  const [mine, setMine] = useState<Record<string, MyConfirmation>>({});

  const filtered = useMemo(() => filterFeiras(feiras, filters, today), [feiras, filters, today]);
  const byId = useMemo(() => new Map(feiras.map((f) => [f.id, f])), [feiras]);
  const selected = selectedId ? (byId.get(selectedId) ?? null) : null;
  const details = detailsId ? (byId.get(detailsId) ?? null) : null;

  // Resumo público de confirmações (não depende de login).
  useEffect(() => {
    if (!supabase) return;
    fetchConfirmationStats(supabase)
      .then(setStats)
      .catch((e) => console.warn("[confirmações] falha ao carregar", e));
  }, [supabase]);

  // Confirmações do próprio usuário.
  useEffect(() => {
    if (!supabase || !user) {
      Promise.resolve().then(() => setMine({}));
      return;
    }
    fetchMyConfirmations(supabase)
      .then(setMine)
      .catch((e) => console.warn("[confirmações] falha ao carregar as suas", e));
  }, [supabase, user]);

  const handleConfirm = useCallback(
    async (feira: Feira, status: ConfirmationStatus) => {
      if (!supabase || !user) return;
      await confirmFeira(supabase, user.id, feira.id, status);
      const [s, m] = await Promise.all([
        fetchConfirmationStats(supabase),
        fetchMyConfirmations(supabase),
      ]);
      setStats(s);
      setMine(m);
    },
    [supabase, user],
  );

  const handleSelect = useCallback((f: Feira) => setSelectedId(f.id), []);
  const handleOpenDetails = useCallback((f: Feira) => {
    setSelectedId(f.id);
    setDetailsId(f.id);
  }, []);

  const openNewFeira = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setSuggestion({ kind: "nova", city: filters.city });
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
      <header className="relative rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-4 text-white shadow-lg sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
        >
          <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        </div>
        {/* z-20: o menu do usuário precisa ficar acima da linha de baixo e do mapa. */}
        <div className="relative z-20 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-100 sm:text-sm">
              <span aria-hidden="true" className="text-xl">
                🧺
              </span>
              Feiras livres no Brasil
            </p>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Onde tem feira
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-amber-50/95 sm:text-sm">
              Encontre feiras livres perto de você, monte sua lista de compras e compartilhe preços
              com a comunidade.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 sm:self-start">
            <button
              type="button"
              onClick={() => setIsShoppingListOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-3.5 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur transition hover:bg-white/30 active:scale-95 sm:text-sm"
            >
              <span aria-hidden="true">📝</span> Minha lista
            </button>
            <UserMenu />
          </div>
        </div>
        <div className="relative z-10 mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/20 pt-3 text-xs text-amber-100/90">
          <span>
            {feiras.length} feiras mapeadas em {cities.length} cidades
          </span>
          {enabled && (
            <button
              type="button"
              onClick={openNewFeira}
              className="font-semibold text-white underline-offset-2 hover:underline"
            >
              + Sugerir uma feira que falta
            </button>
          )}
        </div>
      </header>

      <main className="grid gap-4 lg:grid-cols-[minmax(280px,380px)_1fr] lg:items-stretch">
        <aside
          aria-label="Filtros e lista de feiras"
          className="flex flex-col gap-3 rounded-2xl border border-orange-100 bg-white/90 p-3 shadow-sm backdrop-blur sm:p-4"
        >
          <Filters
            cities={cities}
            filters={filters}
            today={today}
            onChange={(next) => {
              setFilters(next);
              setSelectedId(null);
            }}
            resultCount={filtered.length}
          />
          <FeiraList
            feiras={filtered}
            selectedId={selectedId}
            stats={stats}
            onSelect={handleSelect}
            onOpenDetails={handleOpenDetails}
          />
        </aside>

        <section
          aria-label="Mapa das feiras"
          className="relative h-[55vh] min-h-[320px] overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm sm:h-[60vh] lg:h-auto lg:min-h-[calc(100vh-11rem)]"
        >
          <FeiraMap
            feiras={filtered}
            selected={selected}
            city={filters.city}
            onSelect={handleSelect}
            onOpenDetails={handleOpenDetails}
          />
        </section>
      </main>

      <footer className="space-y-1 pb-4 text-center text-xs text-stone-500">
        <p>Dados de fontes municipais e da comunidade. Feiras mudam: confirme antes de ir.</p>
        <p className="space-x-3">
          <Link href="/sobre" className="hover:underline">
            Sobre os dados
          </Link>
          <Link href="/privacidade" className="hover:underline">
            Privacidade
          </Link>
          <Link href="/termos" className="hover:underline">
            Termos
          </Link>
        </p>
      </footer>

      <AuthModal />
      <ShoppingListModal isOpen={isShoppingListOpen} onClose={() => setIsShoppingListOpen(false)} />
      <FeiraDetailsModal
        feira={details}
        onClose={() => setDetailsId(null)}
        stats={details ? stats[details.id] : undefined}
        myConfirmation={details ? mine[details.id] : undefined}
        onConfirm={handleConfirm}
        onSuggestChange={(f) => {
          setDetailsId(null);
          if (!user) {
            openAuthModal();
            return;
          }
          setSuggestion({ kind: "alteracao", feira: f });
        }}
      />
      <SuggestionModal target={suggestion} cities={cities} onClose={() => setSuggestion(null)} />
    </div>
  );
}

export function AppShell(props: Props) {
  return (
    <AuthProvider>
      <AppShellContent {...props} />
    </AuthProvider>
  );
}
