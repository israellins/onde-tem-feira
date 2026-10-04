import type { TypedSupabaseClient } from "@/lib/supabase/client";
import {
  SHOPPING_CATEGORIES,
  type NewShoppingItem,
  type ShoppingCategory,
  type ShoppingItem,
} from "@/types/community";

/**
 * Armazenamento da lista de compras.
 * - Com login: tabela shopping_items no Supabase (sincroniza entre aparelhos).
 * - Sem login: localStorage do navegador.
 */
export interface ShoppingStore {
  list(): Promise<ShoppingItem[]>;
  add(item: NewShoppingItem): Promise<ShoppingItem>;
  setCompleted(id: string, completed: boolean): Promise<void>;
  remove(id: string): Promise<void>;
  removeCompleted(): Promise<void>;
}

const LOCAL_KEY = "onde_tem_feira_lista_v2";

function asCategory(value: string): ShoppingCategory {
  return (SHOPPING_CATEGORIES as readonly string[]).includes(value)
    ? (value as ShoppingCategory)
    : "outros";
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createLocalShoppingStore(storage: Storage): ShoppingStore {
  const read = (): ShoppingItem[] => {
    try {
      const raw = storage.getItem(LOCAL_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as ShoppingItem[]) : [];
    } catch {
      return [];
    }
  };
  const write = (items: ShoppingItem[]) => {
    try {
      storage.setItem(LOCAL_KEY, JSON.stringify(items));
    } catch {
      throw new Error("Não foi possível salvar no aparelho (armazenamento cheio ou bloqueado).");
    }
  };

  return {
    async list() {
      return read();
    },
    async add(input) {
      const item: ShoppingItem = {
        id: newId(),
        ...input,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      write([item, ...read()]);
      return item;
    },
    async setCompleted(id, completed) {
      write(read().map((i) => (i.id === id ? { ...i, completed } : i)));
    },
    async remove(id) {
      write(read().filter((i) => i.id !== id));
    },
    async removeCompleted() {
      write(read().filter((i) => !i.completed));
    },
  };
}

export function createRemoteShoppingStore(
  supabase: TypedSupabaseClient,
  userId: string,
): ShoppingStore {
  const map = (row: {
    id: string;
    item: string;
    quantity: string;
    price_estimate: number | null;
    category: string;
    completed: boolean;
    created_at: string;
  }): ShoppingItem => ({
    id: row.id,
    item: row.item,
    quantity: row.quantity,
    priceEstimate: row.price_estimate === null ? null : Number(row.price_estimate),
    category: asCategory(row.category),
    completed: row.completed,
    createdAt: row.created_at,
  });

  const COLUMNS = "id, item, quantity, price_estimate, category, completed, created_at";

  return {
    async list() {
      const { data, error } = await supabase
        .from("shopping_items")
        .select(COLUMNS)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []).map(map);
    },
    async add(input) {
      const { data, error } = await supabase
        .from("shopping_items")
        .insert({
          user_id: userId,
          item: input.item,
          quantity: input.quantity,
          price_estimate: input.priceEstimate,
          category: input.category,
        })
        .select(COLUMNS)
        .single();
      if (error) throw error;
      return map(data);
    },
    async setCompleted(id, completed) {
      const { error } = await supabase.from("shopping_items").update({ completed }).eq("id", id);
      if (error) throw error;
    },
    async remove(id) {
      const { error } = await supabase.from("shopping_items").delete().eq("id", id);
      if (error) throw error;
    },
    async removeCompleted() {
      const { error } = await supabase
        .from("shopping_items")
        .delete()
        .eq("user_id", userId)
        .eq("completed", true);
      if (error) throw error;
    },
  };
}

/** Itens salvos no aparelho antes do login, para oferecer importação. */
export function readLocalItems(storage: Storage): ShoppingItem[] {
  try {
    const raw = storage.getItem(LOCAL_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as ShoppingItem[]) : [];
  } catch {
    return [];
  }
}

export function clearLocalItems(storage: Storage): void {
  try {
    storage.removeItem(LOCAL_KEY);
  } catch {
    // ignorado
  }
}

/** Total estimado: soma dos preços dos itens ainda não comprados. */
export function pendingTotal(items: readonly ShoppingItem[]): number {
  return items.filter((i) => !i.completed).reduce((sum, i) => sum + (i.priceEstimate ?? 0), 0);
}
