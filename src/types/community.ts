import { z } from "zod";
import { dayOfWeekSchema } from "@/types/feira";

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  isAdmin: boolean;
}

export interface PriceReport {
  product: string;
  price: string;
}

export interface FeiraPost {
  id: string;
  feiraId: string;
  userId: string;
  authorName: string;
  authorAvatar: string | null;
  text: string;
  rating: number | null;
  priceReports: PriceReport[];
  photoUrl: string | null;
  createdAt: string;
}

export const SHOPPING_CATEGORIES = [
  "frutas",
  "legumes",
  "pasteis",
  "peixes",
  "temperos",
  "outros",
] as const;

export type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number];

export interface ShoppingItem {
  id: string;
  item: string;
  quantity: string;
  priceEstimate: number | null;
  category: ShoppingCategory;
  completed: boolean;
  createdAt: string;
  /** Só na lista online: quem adicionou o item. */
  addedBy?: string | null;
  addedByName?: string | null;
}

export type NewShoppingItem = Pick<
  ShoppingItem,
  "item" | "quantity" | "priceEstimate" | "category"
>;

// ---------------------------------------------------------------------------
// Formulários — validação compartilhada entre a interface e os testes
// ---------------------------------------------------------------------------

export const priceReportSchema = z.object({
  product: z.string().trim().min(1, "Informe o produto").max(60),
  price: z.string().trim().min(1, "Informe o preço").max(30),
});

export const newPostSchema = z.object({
  text: z.string().trim().min(1, "Escreva um relato").max(1000, "Máximo de 1000 caracteres"),
  rating: z.number().int().min(1).max(5).nullable(),
  priceReports: z.array(priceReportSchema).max(10, "Máximo de 10 preços"),
});

export type NewPost = z.infer<typeof newPostSchema>;

export const newShoppingItemSchema = z.object({
  item: z.string().trim().min(1, "Informe o item").max(80),
  quantity: z.string().trim().min(1).max(30),
  priceEstimate: z.number().min(0).max(100000).nullable(),
  category: z.enum(SHOPPING_CATEGORIES),
});

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable();

/** Sugestão de nova feira. */
export const newFeiraSuggestionSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome").max(120),
  city: z.string().trim().min(2, "Informe a cidade").max(60),
  neighborhood: z.string().trim().min(1, "Informe o bairro").max(80),
  address: optionalText(200),
  hours: optionalText(40),
  daysOfWeek: z.array(dayOfWeekSchema).min(1, "Escolha ao menos um dia").max(7),
  lat: z.number().min(-34).max(6),
  lng: z.number().min(-74).max(-34),
});

export type NewFeiraSuggestion = z.infer<typeof newFeiraSuggestionSchema>;

/** Sugestão de correção: só os campos alterados são enviados. */
export const feiraChangeSuggestionSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    neighborhood: z.string().trim().min(1).max(80).optional(),
    address: optionalText(200).optional(),
    hours: optionalText(40).optional(),
    daysOfWeek: z.array(dayOfWeekSchema).min(1).max(7).optional(),
    active: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "Altere pelo menos um campo");

export type FeiraChangeSuggestion = z.infer<typeof feiraChangeSuggestionSchema>;

export interface FeiraSuggestion {
  id: string;
  kind: "nova" | "alteracao";
  feiraId: string | null;
  payload: Record<string, unknown>;
  comment: string | null;
  status: "pendente" | "aprovada" | "rejeitada";
  reviewNote: string | null;
  authorName: string;
  createdAt: string;
}
