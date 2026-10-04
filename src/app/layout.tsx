import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Onde tem feira — mapa das feiras livres",
    template: "%s · Onde tem feira",
  },
  description:
    "Encontre feiras livres no Rio de Janeiro, São Paulo, Cuiabá e outras cidades. Filtre por dia, bairro e cidade, monte sua lista de compras e veja preços informados pela comunidade.",
  applicationName: "Onde tem feira",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Onde tem feira",
  },
  openGraph: {
    title: "Onde tem feira — mapa das feiras livres",
    description:
      "Encontre feiras livres perto de você, monte sua lista de compras e compartilhe preços.",
    locale: "pt_BR",
    type: "website",
    siteName: "Onde tem feira",
  },
};

export const viewport: Viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} bg-stone-50 text-stone-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
