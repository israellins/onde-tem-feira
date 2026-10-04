"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import type { Feira } from "@/types/feira";
import { newPostSchema, priceReportSchema, type PriceReport } from "@/types/community";
import { useAuth } from "@/lib/auth/AuthProvider";
import { friendlyError } from "@/lib/format";
import { createPost, validatePhoto } from "@/lib/repositories/posts";
import { Alert } from "@/components/ui/Alert";

export function PostForm({ feira, onPosted }: { feira: Feira; onPosted: () => void }) {
  const { supabase, user, profile, openAuthModal } = useAuth();
  const [text, setText] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [prices, setPrices] = useState<PriceReport[]>([]);
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const ids = useId();

  if (!user) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-3">
        <p className="text-sm text-stone-700">
          Entre para contar como está a feira e informar preços.
        </p>
        <button
          type="button"
          onClick={openAuthModal}
          className="shrink-0 rounded-lg bg-amber-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
        >
          Entrar
        </button>
      </div>
    );
  }

  const addPrice = () => {
    const parsed = priceReportSchema.safeParse({ product, price });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Preço inválido");
      return;
    }
    if (prices.length >= 10) {
      setError("Máximo de 10 preços por relato.");
      return;
    }
    setPrices([...prices, parsed.data]);
    setProduct("");
    setPrice("");
    setError(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const parsed = newPostSchema.safeParse({ text, rating, priceReports: prices });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Verifique os campos");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await createPost(supabase, user.id, feira.id, parsed.data, photo);
      setText("");
      setRating(null);
      setPrices([]);
      setPhoto(null);
      if (fileRef.current) fileRef.current.value = "";
      onPosted();
    } catch (err) {
      setError(
        err instanceof Error && /foto/i.test(err.message) ? err.message : friendlyError(err),
      );
    } finally {
      setSending(false);
    }
  };

  const firstName = (profile?.displayName ?? "").split(" ")[0];

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2.5 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-3"
      noValidate
    >
      <label
        htmlFor={`${ids}-text`}
        className="text-xs font-bold uppercase tracking-wider text-stone-700"
      >
        Seu relato
      </label>
      <textarea
        id={`${ids}-text`}
        rows={3}
        maxLength={1000}
        placeholder={`Como está a feira${firstName ? `, ${firstName}` : ""}? Barracas, qualidade, movimento…`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full resize-none rounded-xl border border-stone-300 bg-white p-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
      />

      <fieldset className="flex flex-col gap-1.5 rounded-xl border border-amber-200 bg-white/80 p-2.5">
        <legend className="px-1 text-xs font-bold uppercase tracking-wider text-stone-700">
          Preços (opcional)
        </legend>
        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor={`${ids}-product`}>
            Produto
          </label>
          <input
            id={`${ids}-product`}
            type="text"
            maxLength={60}
            placeholder="Produto (ex.: tomate)"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-stone-300 px-2.5 py-1.5 text-sm outline-none focus:border-amber-500"
          />
          <label className="sr-only" htmlFor={`${ids}-price`}>
            Preço
          </label>
          <input
            id={`${ids}-price`}
            type="text"
            maxLength={30}
            placeholder="R$ 4,99/kg"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPrice();
              }
            }}
            className="w-28 rounded-lg border border-stone-300 px-2.5 py-1.5 text-sm outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={addPrice}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
          >
            Adicionar
          </button>
        </div>
        {prices.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {prices.map((pr, idx) => (
              <li
                key={idx}
                className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900"
              >
                {pr.product}: {pr.price}
                <button
                  type="button"
                  aria-label={`Remover ${pr.product}`}
                  onClick={() => setPrices(prices.filter((_, i) => i !== idx))}
                  className="ml-0.5 text-stone-500 hover:text-red-600"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className="flex items-center gap-1"
          role="radiogroup"
          aria-label="Sua nota para a feira"
        >
          <span className="mr-1 text-xs font-semibold text-stone-600">Nota:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
              onClick={() => setRating(rating === star ? null : star)}
              className={`text-xl leading-none ${rating !== null && star <= rating ? "text-amber-500" : "text-stone-300"}`}
            >
              ★
            </button>
          ))}
        </div>

        <label className="cursor-pointer text-xs font-semibold text-amber-800 hover:underline">
          {photo ? `📷 ${photo.name.slice(0, 24)}` : "📷 Adicionar foto"}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (file) {
                const problem = validatePhoto(file);
                if (problem) {
                  setError(problem);
                  e.target.value = "";
                  return;
                }
              }
              setError(null);
              setPhoto(file);
            }}
          />
        </label>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <button
        type="submit"
        disabled={sending}
        className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-amber-600 hover:to-orange-600 disabled:opacity-60"
      >
        {sending ? "Publicando…" : "Publicar relato"}
      </button>
    </form>
  );
}
