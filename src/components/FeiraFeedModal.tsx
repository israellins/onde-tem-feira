"use client";

import React, { useState, useEffect } from "react";
import type { Feira } from "@/types/feira";
import type { FeiraPost, PriceReport } from "@/types/post";
import { useAuth } from "@/lib/authContext";

interface Props {
  feira: Feira | null;
  isOpen: boolean;
  onClose: () => void;
}

// Seed community posts for feiras
const INITIAL_POSTS: Record<string, FeiraPost[]> = {
  default: [
    {
      id: "post-seed-1",
      feiraId: "default",
      userId: "usr_seed_1",
      userName: "Dona Maria Feirante",
      userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Maria",
      text: "Feira maravilhosa hoje! O pastel de carne com queijo estava sensacional e bem quentinho.",
      priceReports: [
        { product: "Tomate Italiano", price: "R$ 4,99 / kg" },
        { product: "Pastel Especial", price: "R$ 8,00" },
      ],
      rating: 5,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "post-seed-2",
      feiraId: "default",
      userId: "usr_seed_2",
      userName: "Carlos Henrique",
      userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Carlos",
      text: "Cheguei por volta das 08h30 e consegui estacionar bem perto. Diversidade ótima de frutas da época!",
      priceReports: [{ product: "Banana Prata", price: "R$ 5,50 / dúzia" }],
      rating: 4,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ],
};

export function FeiraFeedModal({ feira, isOpen, onClose }: Props) {
  const { user, openAuthModal } = useAuth();
  const [posts, setPosts] = useState<FeiraPost[]>([]);
  const [newText, setNewText] = useState("");
  const [newProduct, setNewProduct] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [pricesList, setPricesList] = useState<PriceReport[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (!feira) return;
    try {
      const savedKey = `onde_tem_feira_posts_${feira.id}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        setPosts(JSON.parse(saved));
      } else {
        // Fallback seed posts custom to this feira
        const feiraPosts: FeiraPost[] = [
          {
            id: `post-${feira.id}-1`,
            feiraId: feira.id,
            userId: "usr_seed_1",
            userName: "Ana Paula Silva",
            userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ana",
            text: `Recomendo muito a ${feira.name}! Excelentes barracas de verduras frescas e produtos orgânicos.`,
            priceReports: [
              { product: "Cheiro Verde", price: "R$ 2,50 o maço" },
              { product: "Cenoura", price: "R$ 3,80 / kg" },
            ],
            rating: 5,
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          },
          {
            id: `post-${feira.id}-2`,
            feiraId: feira.id,
            userId: "usr_seed_2",
            userName: "Roberto Santos",
            userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Roberto",
            text: "Preços muito honestos no final da feira! Vale a pena conferir a barraca do seu José.",
            priceReports: [{ product: "Pastel + Caldo de Cana", price: "R$ 12,00 o combo" }],
            rating: 4,
            createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
          },
        ];
        setPosts(feiraPosts);
        localStorage.setItem(savedKey, JSON.stringify(feiraPosts));
      }
    } catch {
      // Storage error fallback
    }
  }, [feira]);

  if (!isOpen || !feira) return null;

  const handleAddPriceReport = () => {
    if (!newProduct.trim() || !newPrice.trim()) return;
    setPricesList([...pricesList, { product: newProduct.trim(), price: newPrice.trim() }]);
    setNewProduct("");
    setNewPrice("");
  };

  const handleRemovePriceReport = (index: number) => {
    setPricesList(pricesList.filter((_, i) => i !== index));
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!newText.trim()) return;

    const newPost: FeiraPost = {
      id: "post_" + Date.now(),
      feiraId: feira.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      text: newText.trim(),
      priceReports: pricesList.length > 0 ? pricesList : undefined,
      photoUrl: photoUrl.trim() || undefined,
      rating,
      createdAt: new Date().toISOString(),
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem(`onde_tem_feira_posts_${feira.id}`, JSON.stringify(updated));

    setNewText("");
    setPricesList([]);
    setPhotoUrl("");
  };

  const formatRelativeTime = (isoString: string) => {
    const diffHours = Math.floor((Date.now() - new Date(isoString).getTime()) / 3600000);
    if (diffHours < 1) return "agora mesmo";
    if (diffHours < 24) return `há ${diffHours}h`;
    return `há ${Math.floor(diffHours / 24)}d`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-orange-100 max-h-[92vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition"
        >
          ✕
        </button>

        {/* Header info */}
        <div className="flex items-start gap-3 mb-4 pr-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
            💬
          </div>
          <div>
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider bg-amber-100/80 px-2 py-0.5 rounded-md">
              Mural & Preços da Feira
            </span>
            <h2 className="text-xl font-bold text-stone-900 leading-snug mt-1">
              {feira.name}
            </h2>
            <p className="text-xs text-stone-500">
              {feira.neighborhood} · {feira.city}
            </p>
          </div>
        </div>

        {/* New Post Form */}
        <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-4 rounded-2xl border border-amber-200/70 mb-4 shadow-inner">
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>✨</span> Deixar um relato sobre esta feira
          </h3>

          {!user ? (
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-200">
              <p className="text-xs text-stone-600 font-medium">
                Faça login para compartilhar dicas, preços e fotos!
              </p>
              <button
                onClick={openAuthModal}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-sm"
              >
                Entrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitPost} className="flex flex-col gap-2.5">
              <textarea
                required
                rows={2}
                placeholder={`Como está a feira hoje, ${user.name.split(" ")[0]}? Dicas de barracas, qualidade dos produtos...`}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-white resize-none"
              />

              {/* Price Report Input */}
              <div className="flex flex-col gap-1.5 bg-white/80 p-2.5 rounded-xl border border-amber-200">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                  🏷️ Informar preço de produto (opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Produto (ex: Tomate)"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    className="flex-1 rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Preço (ex: R$ 4,99/kg)"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-32 rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddPriceReport}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs px-3 py-1.5 rounded-lg"
                  >
                    + Adicionar
                  </button>
                </div>

                {pricesList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {pricesList.map((pr, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                      >
                        {pr.product}: {pr.price}
                        <button
                          type="button"
                          onClick={() => handleRemovePriceReport(idx)}
                          className="text-stone-400 hover:text-red-600 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating & Photo link */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-stone-600 font-semibold mr-1">Avaliação:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-base ${star <= rating ? "text-amber-500" : "text-stone-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  placeholder="URL da Foto (opcional)"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="flex-1 max-w-[200px] rounded-lg border border-stone-300 px-2.5 py-1 text-xs outline-none"
                />

                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md transition active:scale-[0.98]"
                >
                  Publicar Relato
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Posts Feed list */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-[160px]">
          {posts.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-sm">
              Nenhuma postagem ainda nesta feira. Seja o primeiro a compartilhar!
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm hover:border-amber-200 transition flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.userName}`}
                      alt={post.userName}
                      className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">{post.userName}</h4>
                      <p className="text-[10px] text-stone-400">{formatRelativeTime(post.createdAt)}</p>
                    </div>
                  </div>

                  {post.rating && (
                    <div className="flex text-xs text-amber-500">
                      {"★".repeat(post.rating)}
                      {"☆".repeat(5 - post.rating)}
                    </div>
                  )}
                </div>

                <p className="text-xs text-stone-800 leading-relaxed">{post.text}</p>

                {/* Price Reports list */}
                {post.priceReports && post.priceReports.length > 0 && (
                  <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/70">
                    <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                      🏷️ Preços informados:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.priceReports.map((pr, idx) => (
                        <span
                          key={idx}
                          className="bg-white text-stone-800 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-medium"
                        >
                          <strong>{pr.product}:</strong>{" "}
                          <span className="text-amber-800 font-bold">{pr.price}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {post.photoUrl && (
                  <img
                    src={post.photoUrl}
                    alt="Foto da feira"
                    className="w-full max-h-48 object-cover rounded-xl mt-1 border border-stone-200"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
