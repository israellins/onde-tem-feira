import type { Feira, FeiraFilters } from "@/types/feira";
import { todayDayOfWeek } from "@/lib/days";

export function filterFeiras(feiras: Feira[], filters: FeiraFilters): Feira[] {
  const q = filters.query.trim().toLowerCase();
  const day = filters.todayOnly ? todayDayOfWeek() : filters.day;

  return feiras.filter((f) => {
    if (filters.city && f.city !== filters.city) return false;
    if (day && !(f.daysOfWeek as string[]).includes(day)) return false;
    if (q) {
      const hay = [
        f.name,
        f.neighborhood,
        f.city,
        f.address ?? "",
        ...(f.daysOfWeek as string[]),
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function uniqueCities(feiras: Feira[]): string[] {
  return Array.from(new Set(feiras.map((f) => f.city))).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}
