/**
 * Testes de integridade do catálogo de feiras (src/data/feiras.json).
 * Rodam em toda alteração para impedir que dados quebrados ou inventados
 * cheguem ao app.
 */
import { describe, expect, it } from "vitest";
import data from "@/data/feiras.json";
import { feirasFileSchema } from "@/types/feira";
import { CITY_CENTERS } from "@/lib/cityCenters";

const { feiras } = feirasFileSchema.parse(data);

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

describe("catálogo de feiras", () => {
  it("segue o esquema", () => {
    expect(feiras.length).toBeGreaterThan(0);
  });

  it("não tem ids repetidos", () => {
    const ids = feiras.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("não tem dias repetidos numa mesma feira", () => {
    for (const f of feiras) {
      expect(new Set(f.daysOfWeek).size, f.id).toBe(f.daysOfWeek.length);
    }
  });

  it("toda cidade tem um centro de mapa configurado", () => {
    const missing = [...new Set(feiras.map((f) => f.city))].filter((c) => !CITY_CENTERS[c]);
    expect(missing).toEqual([]);
  });

  it("cada feira fica a menos de 40 km do centro da sua cidade", () => {
    const far = feiras
      .map((f) => ({ id: f.id, km: distanceKm(f, CITY_CENTERS[f.city]) }))
      .filter((x) => x.km > 40);
    expect(far).toEqual([]);
  });

  it("feira não verificada nunca afirma ter coordenada oficial", () => {
    const wrong = feiras.filter((f) => !f.verified && f.accuracy === "official_coords");
    expect(wrong.map((f) => f.id)).toEqual([]);
  });

  it("não exibe horários que a fonte não informa (SP, Cuiabá e não verificadas)", () => {
    const wrong = feiras.filter(
      (f) => f.hours !== null && (f.city !== "Rio de Janeiro" || !f.verified),
    );
    expect(wrong.map((f) => f.id)).toEqual([]);
  });

  it("não tem espaços duplicados em nomes e endereços", () => {
    const bad = feiras.filter((f) => /\s{2,}/.test(f.name) || /\s{2,}/.test(f.address ?? ""));
    expect(bad.map((f) => f.id)).toEqual([]);
  });
});

describe("ordenação do catálogo", () => {
  it("mostra feiras verificadas primeiro", async () => {
    const { sortFeiras } = await import("@/lib/data/getFeiras");
    const sorted = sortFeiras(feiras);
    const firstUnverified = sorted.findIndex((f) => !f.verified);
    expect(sorted.slice(firstUnverified).every((f) => !f.verified)).toBe(true);
    expect(sorted[0].verified).toBe(true);
  });
});
