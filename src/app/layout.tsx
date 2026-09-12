import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Onde tem feira — Mapa, Lista de Compras e Mural da Feira",
  description:
    "Mapa das feiras livres no Brasil — Rio de Janeiro, São Paulo, Cuiabá, Belo Horizonte, Brasília, Salvador, Curitiba, Porto Alegre, Recife e mais. Filtre por dia, cidade e bairro, crie sua lista de compras e confira postagens com preços atualizados.",
  openGraph: {
    title: "Onde tem feira — Mapa e Comunidade de Feiras Livres",
    description:
      "Encontre feiras livres em várias cidades do Brasil, crie sua lista de compras e compartilhe fotos e preços com a comunidade.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-stone-50 text-stone-900`}
      >
        {children}
      </body>
    </html>
  );
}
