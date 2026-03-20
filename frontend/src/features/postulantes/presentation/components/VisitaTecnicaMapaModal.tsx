import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import L from 'leaflet';
import { usePostulantes } from '../hooks/use-postulantes';
import type { PostulanteRow } from '../hooks/use-postulantes';

// Icono simple para marcadores
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type MarkerData = {
  id: number;
  lat: number;
  lng: number;
  label: string;
  detail: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function geocode(postulante: PostulanteRow): Promise<MarkerData | null> {
  const queryParts = [
    postulante.direccion,
    postulante.municipio,
    postulante.departamento,
    'Colombia',
  ].filter(Boolean);
  if (!queryParts.length) return null;

  const q = queryParts.join(', ');
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  const resp = await fetch(url.toString(), {
    headers: {
      'Accept-Language': 'es',
      'User-Agent': 'ModuloSubsidiosVivienda/visitas-tecnicas',
    },
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const { lat, lon } = data[0];
  const latNum = Number(lat);
  const lonNum = Number(lon);
  if (Number.isNaN(latNum) || Number.isNaN(lonNum)) return null;

  return {
    id: postulante.id,
    lat: latNum,
    lng: lonNum,
    label: postulante.numero_radicado,
    detail: `${postulante.direccion} · ${postulante.municipio}`,
  };
}

export const VisitaTecnicaMapaModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { postulantes, isLoading, error } = usePostulantes('APROBADA');
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geoError, setGeoError] = useState('');

  // Refs para Leaflet vanilla
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isOpen || postulantes.length === 0) return;
      setIsGeocoding(true);
      setGeoError('');
      const next: MarkerData[] = [];
      for (const p of postulantes) {
        try {
          const marker = await geocode(p);
          if (marker) next.push(marker);
        } catch {
          setGeoError('No se pudieron geocodificar algunas direcciones.');
        }
        await sleep(700);
        if (cancelled) return;
      }
      if (!cancelled) setMarkers(next);
      if (!cancelled) setIsGeocoding(false);
    }
    load();
    return () => { cancelled = true; };
  }, [isOpen, postulantes]);

  // Inicializar mapa cuando el modal se abre
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;
      const map = L.map(mapContainerRef.current, {
        center: [4.711, -74.072],
        zoom: 6,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      const lg = L.layerGroup().addTo(map);
      mapRef.current = map;
      layerGroupRef.current = lg;
      map.invalidateSize();
    }, 50);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, [isOpen]);

  // Sincronizar marcadores
  useEffect(() => {
    const lg = layerGroupRef.current;
    const map = mapRef.current;
    if (!lg || !map) return;

    lg.clearLayers();
    for (const m of markers) {
      L.marker([m.lat, m.lng], { icon: markerIcon })
        .bindPopup(`<div style="font-size:13px"><p style="font-weight:600;margin:0">${m.label}</p><p style="color:#4b5563;margin:2px 0 0">${m.detail}</p></div>`)
        .addTo(lg);
    }

    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [markers]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden focus:outline-none">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-lg font-bold text-gray-900">Mapa de visitas técnicas</Dialog.Title>
              <p className="text-xs text-gray-500">Postulaciones aprobadas para programar visitas en campo</p>
            </div>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 text-2xl leading-none" aria-label="Cerrar">×</Dialog.Close>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-semibold">{postulantes.length} aprobadas</span>
              {isLoading && <span>Cargando registros...</span>}
              {isGeocoding && <span>Ubicando direcciones en el mapa...</span>}
              {error && <span className="text-red-600">{error}</span>}
              {geoError && <span className="text-amber-700">{geoError}</span>}
            </div>

            <div className="w-full h-[65vh] rounded-lg overflow-hidden border border-gray-200">
              <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
            </div>

            <p className="text-xs text-gray-500">
              Las ubicaciones se obtienen a partir de la dirección registrada en la postulación usando OpenStreetMap (Nominatim).
              Si alguna dirección no se puede ubicar, verifica que tenga municipio y departamento completos.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
