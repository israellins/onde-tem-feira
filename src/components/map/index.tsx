"use client";

import dynamic from "next/dynamic";

// O Leaflet usa `window`, então os mapas só carregam no navegador.

function MapLoading() {
  return (
    <div className="flex h-full min-h-40 w-full items-center justify-center rounded-2xl bg-orange-50 text-sm text-stone-500">
      Carregando mapa…
    </div>
  );
}

export const FeiraMap = dynamic(() => import("@/components/map/FeiraMap"), {
  ssr: false,
  loading: MapLoading,
});

export const LocationPicker = dynamic(() => import("@/components/map/LocationPicker"), {
  ssr: false,
  loading: MapLoading,
});
