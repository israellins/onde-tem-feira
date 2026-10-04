import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { getFeiras } from "@/lib/data/getFeiras";

export const metadata: Metadata = {
  title: "Moderação",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { feiras } = await getFeiras();
  const names = Object.fromEntries(feiras.map((f) => [f.id, `${f.name} (${f.city})`]));
  return (
    <AuthProvider>
      <AdminPanel feiraNames={names} />
    </AuthProvider>
  );
}
