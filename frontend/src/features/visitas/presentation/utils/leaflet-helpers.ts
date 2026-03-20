/**
 * Utilidades compartidas de Leaflet — iconos, popups, inicialización de mapa.
 *
 * Centraliza toda la lógica de Leaflet que antes estaba duplicada
 * en VisitasPage, GestionVisitasPanel y VisitaTecnicaMapaModal.
 */

import L from 'leaflet';

// ── Iconos ────────────────────────────────────────────────────────────────── //

/** Genera un SVG data-URI como icono de marcador con color personalizado */
function svgMarkerUrl(fillColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
    <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${fillColor}"/>
    <circle cx="12.5" cy="12.5" r="6" fill="white"/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const ICON_SIZE: [number, number] = [25, 41];
const ICON_ANCHOR: [number, number] = [12, 41];
const POPUP_ANCHOR: [number, number] = [1, -34];

/** Cache de iconos por color para evitar recrear el mismo icono */
const iconCache = new Map<string, L.Icon>();

export function getMarkerIcon(color: string): L.Icon {
  let icon = iconCache.get(color);
  if (!icon) {
    icon = L.icon({
      iconUrl: svgMarkerUrl(color),
      iconSize: ICON_SIZE,
      iconAnchor: ICON_ANCHOR,
      popupAnchor: POPUP_ANCHOR,
    });
    iconCache.set(color, icon);
  }
  return icon;
}

export const DEFAULT_ICON = getMarkerIcon('#2563eb');
export const SELECTED_ICON = getMarkerIcon('#dc2626');

// ── Colores de clusters ───────────────────────────────────────────────────── //

export const CLUSTER_COLORS = [
  '#dc2626', '#16a34a', '#d97706', '#9333ea', '#2563eb',
  '#0891b2', '#e11d48', '#4f46e5', '#ca8a04', '#059669',
  '#7c3aed', '#ea580c', '#0d9488', '#be185d', '#65a30d',
] as const;

/** Color verde usado para marcadores de visitas ya asignadas */
export const ASSIGNED_COLOR = '#16a34a';

// ── Inicialización de mapa ────────────────────────────────────────────────── //

const DEFAULT_CENTER: [number, number] = [4.711, -74.072]; // Bogotá
const DEFAULT_ZOOM = 6;

export interface MapRefs {
  map: L.Map;
  layerGroup: L.LayerGroup;
}

/** Crea un mapa Leaflet con TileLayer de OSM y un LayerGroup vacío */
export function initMap(container: HTMLElement): MapRefs {
  const map = L.map(container, { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  const layerGroup = L.layerGroup().addTo(map);
  return { map, layerGroup };
}

/** Ajusta los límites del mapa a un conjunto de coordenadas */
export function fitBoundsToPoints(
  map: L.Map,
  points: Array<{ lat: number; lng: number }>,
  maxZoom = 14,
) {
  if (!points.length) return;
  const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng] as [number, number]));
  map.fitBounds(bounds, { padding: [40, 40], maxZoom });
}

// ── Popups seguros (prevención XSS) ──────────────────────────────────────── //

function esc(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export interface PopupData {
  radicado: string;
  solicitante: string;
  direccion: string;
  municipio: string;
  departamento: string;
  zona?: string;
  programa?: string;
  grupoLabel?: string;
  grupoColor?: string;
  tecnicoLabel?: string;
}

/** Genera HTML seguro (XSS-safe) para popup de marcador */
export function buildPopupHtml(d: PopupData): string {
  let html = `<div style="font-size:13px;line-height:1.4">
    <p style="font-weight:700;margin:0 0 2px">${esc(d.radicado)}</p>
    <p style="margin:0 0 2px">${esc(d.solicitante)}</p>
    <p style="color:#6b7280;font-size:11px;margin:0">${esc(d.direccion)}</p>
    <p style="color:#6b7280;font-size:11px;margin:0 0 4px">${esc(d.municipio)}, ${esc(d.departamento)}</p>`;

  if (d.zona) {
    html += `<span style="font-size:10px;background:#f3f4f6;color:#4b5563;padding:1px 6px;border-radius:4px">${esc(d.zona)}</span>`;
  }
  if (d.grupoLabel && d.grupoColor) {
    html += `<span style="font-size:10px;background:${d.grupoColor}22;color:${d.grupoColor};padding:1px 6px;border-radius:4px;font-weight:600;margin-left:4px">${esc(d.grupoLabel)}</span>`;
  }
  if (d.programa) {
    html += `<p style="color:#9ca3af;font-size:11px;margin:4px 0 0">${esc(d.programa)}</p>`;
  }
  if (d.tecnicoLabel) {
    html += `<p style="margin:4px 0 0;font-size:11px;color:${d.grupoColor ?? '#16a34a'};font-weight:600">Asignado a: ${esc(d.tecnicoLabel)}</p>`;
  }

  html += '</div>';
  return html;
}
