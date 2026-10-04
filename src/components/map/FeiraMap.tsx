"use client";

import { useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Feira } from "@/types/feira";
import { formatDays } from "@/lib/days";
import { CITY_CENTERS, DEFAULT_CENTER } from "@/lib/cityCenters";
import { HoursText } from "@/components/FeiraBadges";
import { defaultIcon, OSM_TILES, selectedIcon } from "@/components/map/leafletIcons";

export interface FeiraMapProps {
  feiras: Feira[];
  selected: Feira | null;
  city: string;
  onSelect: (feira: Feira) => void;
  onOpenDetails: (feira: Feira) => void;
}

function fitTo(map: L.Map, feiras: Feira[], city: string) {
  const center = city ? CITY_CENTERS[city] : undefined;
  if (center) {
    map.setView([center.lat, center.lng], center.zoom);
  } else if (feiras.length > 0) {
    const bounds = L.latLngBounds(feiras.map((f) => [f.lat, f.lng] as [number, number]));
    map.fitBounds(bounds.pad(0.15), { maxZoom: 14 });
  } else {
    map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], DEFAULT_CENTER.zoom);
  }
}

/** Move o mapa quando a cidade muda ou uma feira é selecionada. */
function MapController({
  feiras,
  selected,
  city,
}: Pick<FeiraMapProps, "feiras" | "selected" | "city">) {
  const map = useMap();
  const prevCity = useRef<string | null>(null);
  const prevSelected = useRef<string | null>(null);

  useEffect(() => {
    const selectedId = selected?.id ?? null;
    const firstRun = prevCity.current === null;
    const cityChanged = prevCity.current !== city;
    const selectedChanged = prevSelected.current !== selectedId;
    prevCity.current = city;
    prevSelected.current = selectedId;

    if (selected && (selectedChanged || firstRun)) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 15), {
        duration: 0.6,
      });
    } else if (cityChanged) {
      fitTo(map, feiras, city);
    }
  }, [feiras, selected, city, map]);

  return null;
}

export default function FeiraMap({
  feiras,
  selected,
  city,
  onSelect,
  onOpenDetails,
}: FeiraMapProps) {
  return (
    <MapContainer
      center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
      zoom={DEFAULT_CENTER.zoom}
      className="z-0 h-full w-full rounded-2xl"
      scrollWheelZoom
    >
      <TileLayer {...OSM_TILES} />
      <MapController feiras={feiras} selected={selected} city={city} />
      {feiras.map((f) => (
        <Marker
          key={f.id}
          position={[f.lat, f.lng]}
          icon={selected?.id === f.id ? selectedIcon : defaultIcon}
          title={f.name}
          eventHandlers={{ click: () => onSelect(f) }}
        >
          <Popup>
            <div className="min-w-[190px] text-sm">
              <strong className="block font-bold text-stone-900">{f.name}</strong>
              <span className="mt-1 block text-stone-600">
                {f.neighborhood} · {f.city}
              </span>
              <span className="mt-1 block font-medium text-amber-800">
                {formatDays(f.daysOfWeek)} · <HoursText hours={f.hours} />
              </span>
              {f.address && <span className="mt-1 block text-stone-500">{f.address}</span>}
              {!f.verified && (
                <span className="mt-1 block text-xs font-semibold text-rose-700">
                  Não verificada em fonte oficial
                </span>
              )}
              <button
                type="button"
                onClick={() => onOpenDetails(f)}
                className="mt-2.5 w-full rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700"
              >
                💬 Mural, preços e detalhes
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
