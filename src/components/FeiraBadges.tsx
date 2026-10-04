import type { ConfirmationStats, Feira } from "@/types/feira";
import { formatIsoDate } from "@/lib/format";

/** Selos de qualidade do dado: não verificada, local aproximado, confirmações. */
export function FeiraBadges({ feira, stats }: { feira: Feira; stats?: ConfirmationStats }) {
  return (
    <div className="flex flex-wrap gap-1">
      {!feira.verified && (
        <span
          className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700"
          title="Esta feira ainda não foi conferida em uma fonte oficial"
        >
          Não verificada
        </span>
      )}
      {feira.accuracy === "approximate" && (
        <span
          className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-600"
          title="A posição no mapa é aproximada"
        >
          Local aprox.
        </span>
      )}
      {stats && stats.confirmations30d > 0 && stats.lastConfirmedOn && (
        <span
          className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800"
          title={`${stats.confirmations30d} confirmação(ões) nos últimos 30 dias`}
        >
          ✓ Confirmada em {formatIsoDate(stats.lastConfirmedOn).slice(0, 5)}
        </span>
      )}
      {stats && stats.notFound30d > 0 && stats.notFound30d >= stats.confirmations30d && (
        <span
          className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800"
          title="Usuários relataram não ter encontrado esta feira recentemente"
        >
          ⚠ Pode ter mudado
        </span>
      )}
    </div>
  );
}

export function HoursText({ hours }: { hours: string | null }) {
  return hours ? (
    <>{hours}</>
  ) : (
    <span className="italic text-stone-500">horário não confirmado</span>
  );
}
