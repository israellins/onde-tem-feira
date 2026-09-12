"use client";

import dynamic from "next/dynamic";
import type { Feira } from "@/types/feira";

const FeiraMap = dynamic(() => import("@/components/FeiraMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-orange-50 text-sm text-stone-500">
      Carregando mapa…
    </div>
  ),
});

interface Props {
  feiras: Feira[];
  selected: Feira | null;
  city: string;
  onSelect: (feira: Feira) => void;
}

export function FeiraMapDynamic(props: Props) {
  return <FeiraMap {...props} />;
}
