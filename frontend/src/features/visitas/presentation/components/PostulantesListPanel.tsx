/**
 * PostulantesListPanel – Panel lateral con listado buscable de postulaciones.
 */

import React, { useMemo, useState } from 'react';
import type { PostulanteRow } from '../../../postulantes/presentation/hooks/use-postulantes';
import { nombreCompleto } from '../utils/geocoding';
import type { GeocodedMarker } from '../utils/geocoding';

interface Props {
  postulantes: PostulanteRow[];
  markers: GeocodedMarker[];
  isGeocoding: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export const PostulantesListPanel: React.FC<Props> = React.memo(({
  postulantes,
  markers,
  isGeocoding,
  selectedId,
  onSelect,
}) => {
  const [busqueda, setBusqueda] = useState('');

  const markerIds = useMemo(() => new Set(markers.map(m => m.id)), [markers]);

  const filtered = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return postulantes;
    return postulantes.filter(row => {
      const nombre    = nombreCompleto(row).toLowerCase();
      const radicado  = row.numero_radicado.toLowerCase();
      const municipio = row.municipio.toLowerCase();
      const dir       = row.direccion?.toLowerCase() ?? '';
      return nombre.includes(q) || radicado.includes(q) || municipio.includes(q) || dir.includes(q);
    });
  }, [postulantes, busqueda]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[600px]">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          Postulaciones aprobadas
        </h3>
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar radicado, nombre, municipio…"
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-xs">No hay postulaciones aprobadas</p>
          </div>
        )}

        {filtered.map(row => {
          const isActive = row.id === selectedId;
          const hasMarker = markerIds.has(row.id);
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => onSelect(row.id)}
              className={`w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 focus:outline-none focus:bg-blue-50 ${
                isActive ? 'bg-blue-50 border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-mono font-semibold text-blue-700 truncate">
                    {row.numero_radicado}
                  </p>
                  <p className="text-sm font-medium text-gray-900 truncate mt-0.5">
                    {nombreCompleto(row)}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{row.direccion}</p>
                  <p className="text-xs text-gray-400">{row.municipio}, {row.departamento}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {hasMarker ? (
                    <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                      Ubicada
                    </span>
                  ) : isGeocoding ? (
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                      Procesando…
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">
                      Sin ubicar
                    </span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    row.zona === 'URBANA'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-teal-100 text-teal-700'
                  }`}>
                    {row.zona_label}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
        {filtered.length} de {postulantes.length} postulación{postulantes.length !== 1 ? 'es' : ''}
      </div>
    </div>
  );
});

PostulantesListPanel.displayName = 'PostulantesListPanel';
