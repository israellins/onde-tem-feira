"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Feira } from "@/types/feira";
import { formatDays } from "@/lib/days";
import { CITY_CENTERS, DEFAULT_CENTER } from "@/lib/cityCenters";
import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: "feira-marker-selected",
});

function FitBounds({
  feiras,
  selected,
  city,
}: {
  feiras: Feira[];
  selected: Feira | null;
  city: string;
}) {
  const map = useMap();
  const prevCityRef = useRef<string>(city);
  const prevSelectedIdRef = useRef<string | null>(selected?.id ?? null);
  const isInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    const cityChanged = prevCityRef.current !== city;
    const selectedChanged = prevSelectedIdRef.current !== (selected?.id ?? null);

    prevCityRef.current = city;
    prevSelectedIdRef.current = selected?.id ?? null;

    // Initial mount behavior
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      if (selected) {
        map.flyTo([selected.lat, selected.lng], 15, { duration: 0.6 });
      } else if (city && CITY_CENTERS[city]) {
        const c = CITY_CENTERS[city];
        map.setView([c.lat, c.lng], c.zoom);
      } else if (feiras.length > 0) {
        const bounds = L.latLngBounds(feiras.map((f) => [f.lat, f.lng]));
        map.fitBounds(bounds.pad(0.15));
      }
      return;
    }

    // Fly to selected feira when clicked
    if (selectedChanged && selected) {
      map.flyTo([selected.lat, selected.lng], 15, { duration: 0.6 });
      return;
    }

    // Reposition ONLY when city explicitly changes
    if (cityChanged) {
      if (city && CITY_CENTERS[city]) {
        const c = CITY_CENTERS[city];
        map.setView([c.lat, c.lng], c.zoom);
      } else if (feiras.length > 0) {
        const bounds = L.latLngBounds(feiras.map((f) => [f.lat, f.lng]));
        map.fitBounds(bounds.pad(0.15));
      } else {
        map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], DEFAULT_CENTER.zoom);
      }
    }
  }, [feiras, selected, city, map]);

  return null;
}

interface Props {
  feiras: Feira[];
  selected: Feira | null;
  city: string;
  onSelect: (feira: Feira) => void;
  onOpenFeed?: (feira: Feira) => void;
}

export default function FeiraMap({ feiras, selected, city, onSelect, onOpenFeed }: Props) {
  const center = useMemo(() => {
    if (city && CITY_CENTERS[city]) return CITY_CENTERS[city];
    return DEFAULT_CENTER;
  }, [city]);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={center.zoom}
      className="h-full w-full rounded-2xl z-0"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds feiras={feiras} selected={selected} city={city} />
      {feiras.map((f) => (
        <Marker
          key={f.id}
          position={[f.lat, f.lng]}
          icon={selected?.id === f.id ? selectedIcon : markerIcon}
          eventHandlers={{
            click: () => onSelect(f),
          }}
        >
          <Popup>
            <div className="min-w-[190px] text-sm">
              <strong className="block text-stone-900 font-bold">{f.name}</strong>
              <span className="block text-stone-600 mt-1">
                {f.neighborhood} · {f.city}
              </span>
              <span className="block text-amber-800 mt-1 font-medium">
                {formatDays(f.daysOfWeek as string[])}
                {f.hours ? ` · ${f.hours}` : ""}
              </span>
              {f.address && (
                <span className="block text-stone-500 mt-1">{f.address}</span>
              )}

              <button
                type="button"
                onClick={() => onOpenFeed?.(f)}
                className="mt-2.5 w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition shadow-sm"
              >
                💬 Ver Mural & Preços
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
