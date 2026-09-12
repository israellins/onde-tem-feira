export const CITY_CENTERS: Record<
  string,
  { lat: number; lng: number; zoom: number }
> = {
  "Rio de Janeiro": { lat: -22.9068, lng: -43.1729, zoom: 12 },
  "São Paulo": { lat: -23.5505, lng: -46.6333, zoom: 11 },
  Cuiabá: { lat: -15.601, lng: -56.0978, zoom: 12 },
  "Belo Horizonte": { lat: -19.9167, lng: -43.9345, zoom: 12 },
  Brasília: { lat: -15.7975, lng: -47.8919, zoom: 12 },
  Curitiba: { lat: -25.4284, lng: -49.2733, zoom: 12 },
  "Porto Alegre": { lat: -30.0346, lng: -51.2177, zoom: 12 },
  Salvador: { lat: -12.9777, lng: -38.5016, zoom: 12 },
  Recife: { lat: -8.0476, lng: -34.877, zoom: 12 },
  Fortaleza: { lat: -3.7319, lng: -38.5267, zoom: 12 },
  Niterói: { lat: -22.8833, lng: -43.1036, zoom: 13 },
  Campinas: { lat: -22.9056, lng: -47.0608, zoom: 12 },
  Florianópolis: { lat: -27.5954, lng: -48.548, zoom: 12 },
};

export const DEFAULT_CENTER = { lat: -15.8, lng: -47.9, zoom: 4 };
