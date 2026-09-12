import { AppShell } from "@/components/AppShell";
import data from "@/data/feiras.json";
import type { Feira } from "@/types/feira";

export default function HomePage() {
  const feiras = data.feiras as Feira[];
  return <AppShell feiras={feiras} />;
}
