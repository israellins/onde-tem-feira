import { DAY_VALUES, type DayOfWeek } from "@/types/feira";

export const DAY_LABEL: Record<DayOfWeek, string> = {
  domingo: "Domingo",
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
};

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = DAY_VALUES.map((value) => ({
  value,
  label: DAY_LABEL[value],
}));

/** Dia da semana da data informada, no fuso do aparelho do usuário. */
export function dayOfWeekFromDate(date: Date): DayOfWeek {
  // Date#getDay(): 0 = domingo … 6 = sábado, mesma ordem de DAY_VALUES.
  return DAY_VALUES[date.getDay()];
}

/** Ordena e formata os dias: ["sabado","quarta"] → "Quarta, Sábado". */
export function formatDays(days: readonly DayOfWeek[]): string {
  if (days.length === 7) return "Todos os dias";
  return [...days]
    .sort((a, b) => DAY_VALUES.indexOf(a) - DAY_VALUES.indexOf(b))
    .map((d) => DAY_LABEL[d])
    .join(", ");
}
