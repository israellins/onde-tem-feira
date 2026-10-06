const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value: number): string {
  return currency.format(value);
}

/** "agora mesmo", "há 3 h", "há 2 dias", ou a data para mais de 30 dias. */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  if (Number.isNaN(diffMs)) return "";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ontem";
  if (days <= 30) return `há ${days} dias`;
  return then.toLocaleDateString("pt-BR");
}

/** "2026-10-04" → "04/10/2026" (sem passar por fuso horário). */
export function formatIsoDate(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : isoDate;
}

/** Converte "8,50" ou "8.50" em número; vazio ou inválido → null. */
export function parseMoney(input: string): number | null {
  const cleaned = input.replace(/[^\d,.-]/g, "").replace(",", ".");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

/** Mensagem amigável para erros do Supabase/rede. */
export function friendlyError(error: unknown): string {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : "";
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  // P0001 = mensagem escrita por nós no banco, já pensada para o usuário.
  if (code === "P0001" || /limite/i.test(message)) return message;
  if (/failed to fetch|network/i.test(message))
    return "Sem conexão. Verifique sua internet e tente novamente.";
  if (/jwt|not authenticated|permission|row-level security/i.test(message))
    return "Sua sessão expirou. Entre novamente.";
  return "Algo deu errado. Tente novamente em instantes.";
}
