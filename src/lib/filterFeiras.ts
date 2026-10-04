import type { DayOfWeek, Feira, FeiraFilters } from "@/types/feira";
import { DAY_LABEL } from "@/lib/days";

/** Minúsculas e sem acentos, para busca tolerante ("cuiaba" acha "Cuiabá"). */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Aplica os filtros da tela.
 * @param today dia de hoje — obrigatório quando filters.todayOnly = true.
 *              Recebido como parâmetro para a função ser pura e testável.
 */
export function filterFeiras(
  feiras: readonly Feira[],
  filters: FeiraFilters,
  today: DayOfWeek | null,
): Feira[] {
  const terms = normalizeText(filters.query).split(/\s+/).filter(Boolean);
  const day = filters.todayOnly ? today : filters.day || null;

  return feiras.filter((f) => {
    if (filters.city && f.city !== filters.city) return false;
    if (day && !f.daysOfWeek.includes(day)) return false;
    if (terms.length > 0) {
      const haystack = normalizeText(
        [
          f.name,
          f.neighborhood,
          f.city,
          f.address ?? "",
          ...f.daysOfWeek.map((d) => DAY_LABEL[d]),
        ].join(" "),
      );
      // Todas as palavras precisam aparecer (em qualquer ordem).
      if (!terms.every((t) => haystack.includes(t))) return false;
    }
    return true;
  });
}

export function uniqueCities(feiras: readonly Feira[]): string[] {
  return Array.from(new Set(feiras.map((f) => f.city))).sort((a, b) => a.localeCompare(b, "pt-BR"));
}
