/**
 * Servicio de geocodificación con caché en IndexedDB.
 *
 * - Almacena resultados (lat, lng) en IndexedDB para evitar consultas repetidas.
 * - La clave es la dirección + municipio + departamento normalizada.
 * - Respeta el rate-limit de Nominatim con delay configurable.
 * - Al recargar la app o cambiar de programa, las direcciones ya resueltas
 *   se leen instantáneamente desde la caché.
 */

import type { PostulanteRow } from '../../../postulantes/presentation/hooks/use-postulantes';

// ── Tipos ─────────────────────────────────────────────────────────────────── //

export interface GeocodedMarker {
  id: number;
  lat: number;
  lng: number;
  radicado: string;
  solicitante: string;
  direccion: string;
  municipio: string;
  departamento: string;
  zona: string;
  programa: string;
  postulanteId: string;
  postulacionId: string;
}

interface CachedCoord {
  lat: number;
  lng: number;
  ts: number;
}

// ── IndexedDB cache ───────────────────────────────────────────────────────── //

const DB_NAME = 'geocode_cache';
const DB_VERSION = 1;
const STORE_NAME = 'coords';
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 días

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function normalizeKey(parts: string[]): string {
  return parts
    .map(s => s.trim().toLowerCase().replace(/\s+/g, ' '))
    .join('|');
}

async function getCached(db: IDBDatabase, key: string): Promise<CachedCoord | null> {
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => {
      const val = req.result as CachedCoord | undefined;
      if (val && Date.now() - val.ts < CACHE_TTL) {
        resolve(val);
      } else {
        resolve(null);
      }
    };
    req.onerror = () => resolve(null);
  });
}

function putCache(db: IDBDatabase, key: string, coord: CachedCoord): void {
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(coord, key);
}

// ── Helpers ───────────────────────────────────────────────────────────────── //

export function nombreCompleto(row: PostulanteRow): string {
  if (!row.ciudadano) return '—';
  const { primer_nombre, segundo_nombre, primer_apellido, segundo_apellido } = row.ciudadano;
  return [primer_nombre, segundo_nombre, primer_apellido, segundo_apellido]
    .filter(Boolean)
    .join(' ') || '—';
}

/** Extrae un nombre descriptivo de ubicación de la dirección */
export function extractBarrio(m: GeocodedMarker): string {
  const match = m.direccion.match(/(?:Barrio|B\/)\s+([^,]+)/i);
  if (match) return match[1].trim();
  const parts = m.direccion.split(',');
  if (parts.length > 1) return parts[parts.length - 1].trim();
  return m.municipio;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Geocodificación batch con caché ───────────────────────────────────────── //

export interface GeocodeProgress {
  done: number;
  total: number;
  cached: number;
}

/**
 * Geolocaliza un lote de postulantes con caché y rate-limiting.
 *
 * @param postulantes  Lista de postulantes a geocodificar
 * @param onProgress   Callback por cada item procesado
 * @param signal       AbortSignal para cancelar (opcional)
 * @param delayMs      Delay entre llamadas a Nominatim (default 700ms)
 */
export async function geocodeBatch(
  postulantes: PostulanteRow[],
  onProgress: (progress: GeocodeProgress) => void,
  signal?: AbortSignal,
  delayMs = 700,
): Promise<GeocodedMarker[]> {
  const results: GeocodedMarker[] = [];
  let cachedCount = 0;

  let db: IDBDatabase | null = null;
  try {
    db = await openDB();
  } catch {
    // IndexedDB no disponible, usar solo API
  }

  for (let i = 0; i < postulantes.length; i++) {
    if (signal?.aborted) break;

    const p = postulantes[i];
    const parts = [p.direccion, p.municipio, p.departamento, 'Colombia'].filter(Boolean);
    if (!parts.length) {
      onProgress({ done: i + 1, total: postulantes.length, cached: cachedCount });
      continue;
    }

    const cacheKey = normalizeKey(parts);
    let coord: { lat: number; lng: number } | null = null;

    // 1. Intentar caché
    if (db) {
      const cached = await getCached(db, cacheKey);
      if (cached) {
        coord = { lat: cached.lat, lng: cached.lng };
        cachedCount++;
      }
    }

    // 2. Si no está en caché, llamar a Nominatim
    if (!coord) {
      try {
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('q', parts.join(', '));
        url.searchParams.set('format', 'json');
        url.searchParams.set('limit', '1');

        const resp = await fetch(url.toString(), {
          headers: {
            'Accept-Language': 'es',
            'User-Agent': 'ModuloSubsidiosVivienda/visitas',
          },
          signal,
        });

        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data) && data.length > 0) {
            const lat = Number(data[0].lat);
            const lng = Number(data[0].lon);
            if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
              coord = { lat, lng };
              // Guardar en caché
              if (db) {
                putCache(db, cacheKey, { lat, lng, ts: Date.now() });
              }
            }
          }
        }

        // Rate limit: solo esperar cuando hicimos una llamada HTTP
        if (i < postulantes.length - 1 && !signal?.aborted) {
          await sleep(delayMs);
        }
      } catch (e) {
        if (signal?.aborted) break;
        // Nominatim falló; continuar con el siguiente
      }
    }

    if (coord) {
      results.push({
        id: p.id,
        lat: coord.lat,
        lng: coord.lng,
        radicado: p.numero_radicado,
        solicitante: nombreCompleto(p),
        direccion: p.direccion,
        municipio: p.municipio,
        departamento: p.departamento,
        zona: p.zona_label ?? p.zona,
        programa: p.programa_nombre ?? '—',
        postulanteId: String(p.id),
        postulacionId: p.id_postulacion != null ? String(p.id_postulacion) : String(p.id),
      });
    }

    onProgress({ done: i + 1, total: postulantes.length, cached: cachedCount });
  }

  return results;
}
