"use client";

import { useMemo, useState } from "react";
import type { Feira, FeiraFilters } from "@/types/feira";
import { filterFeiras, uniqueCities } from "@/lib/filterFeiras";
import { Filters } from "@/components/Filters";
import { FeiraList } from "@/components/FeiraList";
import { FeiraMapDynamic } from "@/components/FeiraMapDynamic";
import { AuthProvider, useAuth } from "@/lib/authContext";
import { AuthModal } from "@/components/AuthModal";
import { ShoppingListModal } from "@/components/ShoppingListModal";
import { FeiraFeedModal } from "@/components/FeiraFeedModal";

interface Props {
  feiras: Feira[];
}

function AppShellContent({ feiras }: Props) {
  const { user, logout, openAuthModal } = useAuth();
  const cities = useMemo(() => uniqueCities(feiras), [feiras]);

  const [filters, setFilters] = useState<FeiraFilters>({
    city: "",
    day: "",
    query: "",
    todayOnly: false,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Modals state
  const [feedFeira, setFeedFeira] = useState<Feira | null>(null);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);

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
      <header className="rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-4 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🧺</span>
              <p className="text-amber-100 text-xs sm:text-sm font-semibold tracking-wider uppercase">
                Feiras livres no Brasil
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
              Onde tem feira
            </h1>
            <p className="mt-1 max-w-2xl text-xs sm:text-sm text-amber-50/95 leading-relaxed">
              Encontre feiras livres em Rio, São Paulo, Cuiabá, Belo Horizonte, Brasília, Salvador, Curitiba, Porto Alegre, Recife, Fortaleza e mais.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:self-start">
            {/* Shopping List Button */}
            <button
              onClick={() => setIsShoppingListOpen(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-xl border border-white/30 transition shadow-sm active:scale-95"
            >
              <span>📝</span>
              <span>Minha Lista</span>
            </button>

            {/* Auth / Profile Button */}
            {user ? (
              <div className="flex items-center gap-2 bg-white/95 text-stone-800 p-1.5 pl-3 rounded-xl border border-white/40 shadow-sm text-xs font-semibold">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-6 h-6 rounded-full border border-amber-300"
                />
                <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                <button
                  onClick={logout}
                  className="text-stone-400 hover:text-red-600 p-1 transition"
                  title="Sair"
                >
                  🚪
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs sm:text-sm py-2 px-4 rounded-xl shadow-md transition active:scale-95"
              >
                <span>🔑</span>
                <span>Entrar / Cadastrar</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-amber-100/90">
          <span>{feiras.length} feiras mapeadas em {cities.length} cidades</span>
          <span className="hidden sm:inline">Dica: Clique em "Mural & Preços" em qualquer feira para ver dicas e preços!</span>
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
            onOpenFeed={(f) => setFeedFeira(f)}
          />
        </aside>

        <section className="min-h-[320px] h-[55vh] sm:h-[60vh] lg:h-auto lg:min-h-[calc(100vh-11rem)] rounded-2xl border border-orange-100 bg-white shadow-sm overflow-hidden relative">
          <FeiraMapDynamic
            feiras={filtered}
            selected={selected}
            city={filters.city}
            onSelect={(f) => setSelectedId(f.id)}
            onOpenFeed={(f) => setFeedFeira(f)}
          />
        </section>
      </div>

      <footer className="text-center text-xs text-stone-500 pb-4">
        Dados de fontes municipais e colaboração comunitária.
        Confirme horários locais antes de ir. · Onde tem feira
      </footer>

      {/* Global Modals */}
      <AuthModal />
      <ShoppingListModal
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
      />
      <FeiraFeedModal
        feira={feedFeira}
        isOpen={!!feedFeira}
        onClose={() => setFeedFeira(null)}
      />
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
