import L from "leaflet";

// Ícones servidos pelo próprio app em public/leaflet (antes vinham do
// unpkg.com, um ponto de falha externo). Copiados de leaflet/dist/images.
const markerIcon = { src: "/leaflet/marker-icon.png" };
const markerIcon2x = { src: "/leaflet/marker-icon-2x.png" };
const markerShadow = { src: "/leaflet/marker-shadow.png" };

export const defaultIcon = L.icon({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const selectedIcon = L.icon({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: "feira-marker-selected",
});

export const OSM_TILES = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
};
