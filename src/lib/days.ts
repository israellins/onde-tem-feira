import type { DayOfWeek } from "@/types/feira";

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: "domingo", label: "Domingo" },
  { value: "segunda", label: "Segunda" },
  { value: "terca", label: "Terça" },
  { value: "quarta", label: "Quarta" },
  { value: "quinta", label: "Quinta" },
  { value: "sexta", label: "Sexta" },
  { value: "sabado", label: "Sábado" },
];

export const DAY_LABEL: Record<string, string> = Object.fromEntries(
  DAYS_OF_WEEK.map((d) => [d.value, d.label]),
);

const JS_DAY_TO_OURS: DayOfWeek[] = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
];

export function todayDayOfWeek(): DayOfWeek {
  return JS_DAY_TO_OURS[new Date().getDay()];
}

export function formatDays(days: string[]): string {
  return days.map((d) => DAY_LABEL[d] ?? d).join(", ");
}
