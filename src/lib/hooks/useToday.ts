"use client";

import { useSyncExternalStore } from "react";
import type { DayOfWeek } from "@/types/feira";
import { dayOfWeekFromDate } from "@/lib/days";

function subscribe(onChange: () => void): () => void {
  // Reavalia a cada minuto e quando o app volta ao primeiro plano, para que
  // "Hoje" vire o dia certo após a meia-noite sem recarregar a página.
  const interval = window.setInterval(onChange, 60_000);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", onChange);
  };
}

const getSnapshot = (): DayOfWeek => dayOfWeekFromDate(new Date());
// No servidor (página estática) não sabemos o dia do usuário.
const getServerSnapshot = (): DayOfWeek | null => null;

/** Dia da semana atual no aparelho do usuário; null durante a renderização no servidor. */
export function useToday(): DayOfWeek | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
