import { z } from "zod";

export const DAY_VALUES = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
] as const;

export type DayOfWeek = (typeof DAY_VALUES)[number];

export const dayOfWeekSchema = z.enum(DAY_VALUES);

/** Esquema de uma feira — usado para validar o JSON e os dados do Supabase. */
export const feiraSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{3,80}$/),
  name: z.string().min(2).max(120),
  city: z.string().min(2).max(60),
  neighborhood: z.string().min(1).max(80),
  lat: z.number().min(-34).max(6),
  lng: z.number().min(-74).max(-34),
  daysOfWeek: z.array(dayOfWeekSchema).min(1).max(7),
  hours: z.string().max(40).nullable(),
  address: z.string().max(200).nullable(),
  source: z.string().min(2).max(400),
  accuracy: z.enum(["official_coords", "approximate"]),
  verified: z.boolean(),
});

export type Feira = z.infer<typeof feiraSchema>;

export const feirasFileSchema = z.object({
  feiras: z.array(feiraSchema),
  meta: z.object({
    generatedAt: z.string(),
    cities: z.array(z.string()),
    notes: z.string(),
  }),
});

export interface FeiraFilters {
  city: string;
  /** Dia escolhido no seletor ("" = todos). Ignorado quando todayOnly = true. */
  day: DayOfWeek | "";
  query: string;
  todayOnly: boolean;
}

export interface ConfirmationStats {
  confirmations30d: number;
  notFound30d: number;
  lastConfirmedOn: string | null;
}
