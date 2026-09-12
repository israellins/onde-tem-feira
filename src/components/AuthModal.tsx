"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/authContext";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, loginWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    loginWithEmail(email, name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-orange-100 relative">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold text-xl shadow-md mb-2">
            🍊
          </div>
          <h2 className="text-2xl font-bold text-stone-900">
            {isSignUp ? "Criar sua conta" : "Entrar no Onde Tem Feira"}
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Acesse a Lista de Compras da Feira e poste fotos, preços e dicas!
          </p>
        </div>

        {/* Google Auth Button */}
        <button
          onClick={() => loginWithGoogle()}
          className="w-full flex items-center justify-center gap-3 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium py-3 px-4 rounded-xl shadow-sm transition active:scale-[0.99] mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.31 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          Entrar com Gmail / Google
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-stone-200"></div>
          <span className="px-3 text-xs uppercase tracking-wider text-stone-400 font-semibold">
            ou com e-mail
          </span>
          <div className="flex-1 border-t border-stone-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Nome completo
              </label>
              <input
                type="text"
                required
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Endereço de E-mail
            </label>
            <input
              type="email"
              required
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition active:scale-[0.99]"
          >
            {isSignUp ? "Concluir cadastro" : "Entrar com E-mail"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-amber-700 hover:underline font-medium"
          >
            {isSignUp
              ? "Já tem uma conta? Clique para entrar"
              : "Não tem conta ainda? Clique para cadastrar-se"}
          </button>
        </div>
      </div>
    </div>
  );
}
