import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type TypedSupabaseClient = SupabaseClient<Database>;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * true quando as variáveis do Supabase estão definidas.
 * Sem elas o app continua funcionando: mapa com os dados do JSON e lista de
 * compras salva no aparelho. Login, mural e sugestões ficam indisponíveis.
 */
export const isSupabaseConfigured = Boolean(url && key);

let browserClient: TypedSupabaseClient | null = null;

/** Cliente para o navegador (sessão persistida, login com PKCE). */
export function getSupabaseBrowserClient(): TypedSupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!browserClient) {
    browserClient = createClient<Database>(url!, key!, {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return browserClient;
}

/** Cliente sem sessão, para leitura de dados públicos no servidor. */
export function createSupabaseServerClient(): TypedSupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient<Database>(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
