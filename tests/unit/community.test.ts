import { describe, expect, it } from "vitest";
import {
  feiraChangeSuggestionSchema,
  newFeiraSuggestionSchema,
  newPostSchema,
  newShoppingItemSchema,
} from "@/types/community";
import {
  clearLocalItems,
  createLocalShoppingStore,
  pendingTotal,
  readLocalItems,
} from "@/lib/repositories/shopping";
import { validatePhoto } from "@/lib/repositories/posts";

describe("validação de relato", () => {
  it("aceita relato válido", () => {
    expect(newPostSchema.safeParse({ text: " Ótima! ", rating: 5, priceReports: [] }).success).toBe(
      true,
    );
  });
  it("rejeita texto vazio ou longo demais", () => {
    expect(newPostSchema.safeParse({ text: "   ", rating: null, priceReports: [] }).success).toBe(
      false,
    );
    expect(
      newPostSchema.safeParse({ text: "a".repeat(1001), rating: null, priceReports: [] }).success,
    ).toBe(false);
  });
  it("rejeita nota fora de 1–5 e mais de 10 preços", () => {
    expect(newPostSchema.safeParse({ text: "ok", rating: 6, priceReports: [] }).success).toBe(
      false,
    );
    const prices = Array.from({ length: 11 }, () => ({ product: "x", price: "1" }));
    expect(
      newPostSchema.safeParse({ text: "ok", rating: null, priceReports: prices }).success,
    ).toBe(false);
  });
});

describe("validação de sugestões", () => {
  const nova = {
    name: "Feira Nova",
    city: "Cuiabá",
    neighborhood: "Centro",
    address: "",
    hours: "",
    daysOfWeek: ["sabado"],
    lat: -15.6,
    lng: -56.1,
  };

  it("aceita nova feira e converte campos vazios em null", () => {
    const r = newFeiraSuggestionSchema.parse(nova);
    expect(r.address).toBeNull();
    expect(r.hours).toBeNull();
  });
  it("exige ao menos um dia", () => {
    expect(newFeiraSuggestionSchema.safeParse({ ...nova, daysOfWeek: [] }).success).toBe(false);
  });
  it("rejeita coordenada fora do Brasil", () => {
    expect(newFeiraSuggestionSchema.safeParse({ ...nova, lat: 40.7, lng: -74.0 }).success).toBe(
      false,
    );
  });
  it("correção precisa alterar algo", () => {
    expect(feiraChangeSuggestionSchema.safeParse({}).success).toBe(false);
    expect(feiraChangeSuggestionSchema.safeParse({ active: false }).success).toBe(true);
  });
});

describe("lista de compras local", () => {
  it("adiciona, marca, remove e limpa comprados", async () => {
    const store = createLocalShoppingStore(localStorage);
    const a = await store.add({
      item: "Tomate",
      quantity: "1 kg",
      priceEstimate: 8.5,
      category: "legumes",
    });
    const b = await store.add({
      item: "Banana",
      quantity: "1 dz",
      priceEstimate: 6,
      category: "frutas",
    });
    expect((await store.list()).map((i) => i.item)).toEqual(["Banana", "Tomate"]);

    await store.setCompleted(a.id, true);
    expect(pendingTotal(await store.list())).toBe(6);

    await store.removeCompleted();
    expect((await store.list()).map((i) => i.id)).toEqual([b.id]);

    await store.remove(b.id);
    expect(await store.list()).toEqual([]);
  });

  it("tolera dados corrompidos no armazenamento", async () => {
    localStorage.setItem("onde_tem_feira_lista_v2", "{nao é json");
    expect(await createLocalShoppingStore(localStorage).list()).toEqual([]);
    expect(readLocalItems(localStorage)).toEqual([]);
    clearLocalItems(localStorage);
    expect(localStorage.getItem("onde_tem_feira_lista_v2")).toBeNull();
  });

  it("valida item da lista", () => {
    expect(
      newShoppingItemSchema.safeParse({
        item: "",
        quantity: "1",
        priceEstimate: null,
        category: "outros",
      }).success,
    ).toBe(false);
    expect(
      newShoppingItemSchema.safeParse({
        item: "Alho",
        quantity: "1",
        priceEstimate: null,
        category: "invalida",
      }).success,
    ).toBe(false);
  });
});

describe("validação de foto", () => {
  it("aceita JPG até 5 MB e rejeita outros", () => {
    const ok = new File([new Uint8Array(10)], "a.jpg", { type: "image/jpeg" });
    const gif = new File([new Uint8Array(10)], "a.gif", { type: "image/gif" });
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "b.png", { type: "image/png" });
    expect(validatePhoto(ok)).toBeNull();
    expect(validatePhoto(gif)).toMatch(/JPG/);
    expect(validatePhoto(big)).toMatch(/5 MB/);
  });
});
