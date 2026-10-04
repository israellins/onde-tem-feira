import "server-only";
import localData from "@/data/feiras.json";
import { feiraSchema, feirasFileSchema, type Feira } from "@/types/feira";
import { createSupabaseServerClient } from "@/lib/supabase/client";

/** Verificadas primeiro; depois por cidade e nome (ordem do pt-BR). */
export function sortFeiras(feiras: Feira[]): Feira[] {
  return [...feiras].sort(
    (a, b) =>
      Number(b.verified) - Number(a.verified) ||
      a.city.localeCompare(b.city, "pt-BR") ||
      a.name.localeCompare(b.name, "pt-BR"),
  );
}

export interface FeirasResult {
  feiras: Feira[];
  origin: "supabase" | "local";
}

/** Dados embutidos no app — usados sem Supabase ou se ele falhar. */
export function getLocalFeiras(): Feira[] {
  return sortFeiras(feirasFileSchema.parse(localData).feiras);
}

/**
 * Lê o catálogo de feiras do Supabase (inclui sugestões aprovadas).
 * Se o Supabase não estiver configurado ou falhar, usa o JSON local para que
 * o mapa nunca fique vazio.
 */
export async function getFeiras(): Promise<FeirasResult> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { feiras: getLocalFeiras(), origin: "local" };

  try {
    const { data, error } = await supabase
      .from("feiras")
      .select(
        "id, name, city, neighborhood, lat, lng, days_of_week, hours, address, source, accuracy, verified",
      )
      .eq("active", true)
      .limit(5000);

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Tabela feiras vazia");

    const feiras: Feira[] = [];
    for (const row of data) {
      const parsed = feiraSchema.safeParse({
        id: row.id,
        name: row.name,
        city: row.city,
        neighborhood: row.neighborhood,
        lat: row.lat,
        lng: row.lng,
        daysOfWeek: row.days_of_week,
        hours: row.hours,
        address: row.address,
        source: row.source,
        accuracy: row.accuracy,
        verified: row.verified,
      });
      if (parsed.success) feiras.push(parsed.data);
      else console.warn(`[feiras] registro inválido ignorado: ${row.id}`);
    }
    return { feiras: sortFeiras(feiras), origin: "supabase" };
  } catch (error) {
    console.error("[feiras] falha ao ler do Supabase, usando JSON local", error);
    return { feiras: getLocalFeiras(), origin: "local" };
  }
}
