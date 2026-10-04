import { AppShell } from "@/components/AppShell";
import { getFeiras } from "@/lib/data/getFeiras";

// Recarrega o catálogo do Supabase a cada 5 minutos (ISR), para que
// sugestões aprovadas apareçam sem precisar publicar o site de novo.
export const revalidate = 300;

export default async function HomePage() {
  const { feiras } = await getFeiras();
  return <AppShell feiras={feiras} />;
}
