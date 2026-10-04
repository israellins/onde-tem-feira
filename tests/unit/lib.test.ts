import { describe, expect, it } from "vitest";
import type { Feira, FeiraFilters } from "@/types/feira";
import { dayOfWeekFromDate, formatDays } from "@/lib/days";
import { filterFeiras, normalizeText, uniqueCities } from "@/lib/filterFeiras";
import {
  formatCurrency,
  formatIsoDate,
  formatRelativeTime,
  friendlyError,
  parseMoney,
} from "@/lib/format";

const base: Feira = {
  id: "teste-01",
  name: "Feira da Praça",
  city: "São Paulo",
  neighborhood: "Pinheiros",
  lat: -23.56,
  lng: -46.69,
  daysOfWeek: ["sabado"],
  hours: null,
  address: "Rua Teodoro Sampaio",
  source: "teste",
  accuracy: "official_coords",
  verified: true,
};

const feiras: Feira[] = [
  base,
  {
    ...base,
    id: "teste-02",
    name: "Feira do Centro",
    city: "Cuiabá",
    neighborhood: "Centro",
    daysOfWeek: ["quarta", "domingo"],
    address: null,
  },
  {
    ...base,
    id: "teste-03",
    name: "Feira Orgânica",
    city: "Rio de Janeiro",
    neighborhood: "Glória",
    daysOfWeek: ["sabado", "terca"],
  },
];

const noFilters: FeiraFilters = { city: "", day: "", query: "", todayOnly: false };

describe("dias da semana", () => {
  it("converte Date em dia (domingo = 0)", () => {
    expect(dayOfWeekFromDate(new Date(2026, 9, 4))).toBe("domingo"); // 04/10/2026
    expect(dayOfWeekFromDate(new Date(2026, 9, 10))).toBe("sabado");
  });

  it("formata e ordena os dias", () => {
    expect(formatDays(["sabado", "quarta"])).toBe("Quarta, Sábado");
    expect(formatDays(["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"])).toBe(
      "Todos os dias",
    );
  });
});

describe("filterFeiras", () => {
  it("sem filtros devolve tudo", () => {
    expect(filterFeiras(feiras, noFilters, null)).toHaveLength(3);
  });

  it("filtra por cidade", () => {
    expect(filterFeiras(feiras, { ...noFilters, city: "Cuiabá" }, null).map((f) => f.id)).toEqual([
      "teste-02",
    ]);
  });

  it("filtra por dia escolhido", () => {
    expect(filterFeiras(feiras, { ...noFilters, day: "sabado" }, null)).toHaveLength(2);
  });

  it("'Hoje' usa o dia recebido e ignora o seletor de dia", () => {
    const result = filterFeiras(
      feiras,
      { ...noFilters, todayOnly: true, day: "sabado" },
      "domingo",
    );
    expect(result.map((f) => f.id)).toEqual(["teste-02"]);
  });

  it("'Hoje' sem dia conhecido não filtra (renderização no servidor)", () => {
    expect(filterFeiras(feiras, { ...noFilters, todayOnly: true }, null)).toHaveLength(3);
  });

  it("busca ignora acentos e maiúsculas", () => {
    expect(filterFeiras(feiras, { ...noFilters, query: "CUIABA" }, null)).toHaveLength(1);
    expect(filterFeiras(feiras, { ...noFilters, query: "gloria" }, null)).toHaveLength(1);
  });

  it("busca exige todas as palavras, em qualquer ordem", () => {
    expect(filterFeiras(feiras, { ...noFilters, query: "orgânica sábado" }, null)).toHaveLength(1);
    expect(filterFeiras(feiras, { ...noFilters, query: "orgânica cuiabá" }, null)).toHaveLength(0);
  });

  it("busca pelo nome do dia", () => {
    expect(filterFeiras(feiras, { ...noFilters, query: "terça" }, null).map((f) => f.id)).toEqual([
      "teste-03",
    ]);
  });

  it("combina filtros", () => {
    const r = filterFeiras(
      feiras,
      { city: "São Paulo", day: "sabado", query: "pinheiros", todayOnly: false },
      null,
    );
    expect(r).toHaveLength(1);
  });
});

describe("utilitários", () => {
  it("normalizeText", () => {
    expect(normalizeText("  São JOÃO ")).toBe("sao joao");
  });

  it("uniqueCities ordena em pt-BR", () => {
    expect(uniqueCities(feiras)).toEqual(["Cuiabá", "Rio de Janeiro", "São Paulo"]);
  });

  it("formatCurrency", () => {
    expect(formatCurrency(8.5).replace(/\s/g, " ")).toBe("R$ 8,50");
  });

  it("parseMoney aceita vírgula e rejeita lixo", () => {
    expect(parseMoney("8,50")).toBe(8.5);
    expect(parseMoney("R$ 12.3")).toBe(12.3);
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("abc")).toBeNull();
    expect(parseMoney("-3")).toBeNull();
  });

  it("formatIsoDate", () => {
    expect(formatIsoDate("2026-10-04")).toBe("04/10/2026");
  });

  it("formatRelativeTime", () => {
    const now = new Date("2026-10-04T12:00:00Z");
    expect(formatRelativeTime("2026-10-04T11:59:40Z", now)).toBe("agora mesmo");
    expect(formatRelativeTime("2026-10-04T11:30:00Z", now)).toBe("há 30 min");
    expect(formatRelativeTime("2026-10-04T09:00:00Z", now)).toBe("há 3 h");
    expect(formatRelativeTime("2026-10-03T09:00:00Z", now)).toBe("ontem");
    expect(formatRelativeTime("2026-09-30T12:00:00Z", now)).toBe("há 4 dias");
    expect(formatRelativeTime("invalido", now)).toBe("");
  });

  it("friendlyError traduz erros comuns", () => {
    expect(friendlyError(new Error("Failed to fetch"))).toMatch(/conexão/);
    expect(friendlyError({ message: "Limite de relatos atingido." })).toBe(
      "Limite de relatos atingido.",
    );
    expect(friendlyError({ message: "new row violates row-level security" })).toMatch(/sessão/);
    expect(friendlyError(null)).toMatch(/Algo deu errado/);
  });
});
