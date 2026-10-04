import Link from "next/link";
import type { ReactNode } from "react";

/** Moldura simples para páginas de texto (sobre, privacidade, termos). */
export function ContentPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm font-semibold text-amber-700 hover:underline">
        ← Voltar ao mapa
      </Link>
      <article className="mt-4 space-y-4 rounded-2xl border border-orange-100 bg-white p-6 text-sm leading-relaxed text-stone-700 shadow-sm sm:p-8 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-stone-900 [&_li]:ml-5 [&_li]:list-disc">
        <h1 className="text-2xl font-extrabold text-stone-900">{title}</h1>
        {children}
      </article>
    </div>
  );
}
