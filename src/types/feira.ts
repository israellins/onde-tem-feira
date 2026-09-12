export type DayOfWeek =
  | "domingo"
  | "segunda"
  | "terca"
  | "quarta"
  | "quinta"
  | "sexta"
  | "sabado";

export type CityName = "Rio de Janeiro" | "São Paulo" | "Cuiabá";

export type Accuracy = "official_coords" | "approximate";

export interface Feira {
  id: string;
  name: string;
  city: CityName | string;
  neighborhood: string;
  lat: number;
  lng: number;
  daysOfWeek: DayOfWeek[] | string[];
  hours?: string | null;
  address?: string | null;
  source: string;
  accuracy?: Accuracy | string;
}

export interface FeiraFilters {
  city: string;
  day: string;
  query: string;
  todayOnly: boolean;
}
