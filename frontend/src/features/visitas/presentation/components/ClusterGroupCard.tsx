/**
 * ClusterGroupCard – Tarjeta de grupo de clustering con asignación de técnico.
 */

import React, { useCallback, useState } from 'react';
import type { GeocodedMarker } from '../utils/geocoding';
import { extractBarrio } from '../utils/geocoding';

export interface ClusterGroup {
  index: number;
  color: string;
  markers: GeocodedMarker[];
  tecnicoId: string | null;
}

interface Tecnico {
  id: number;
  nombre: string;
  apellido: string;
}

interface Props {
  cluster: ClusterGroup;
  tecnicos: Tecnico[];
  loadingTec: boolean;
  tecnicoAssignments: Record<number, string>;
  isExpanded: boolean;
  isAssigning: boolean;
  onToggleExpand: () => void;
  onToggleAssign: () => void;
  onAssignTecnico: (clusterIdx: number, tecnicoId: string) => void;
}

export const ClusterGroupCard: React.FC<Props> = React.memo(({
  cluster,
  tecnicos,
  loadingTec,
  tecnicoAssignments,
  isExpanded,
  isAssigning,
  onToggleExpand,
  onToggleAssign,
  onAssignTecnico,
}) => {
  const barrios = [...new Set(cluster.markers.map(m => extractBarrio(m)))];
  const assignedTec = cluster.tecnicoId
    ? tecnicos.find(t => String(t.id) === cluster.tecnicoId) ?? null
    : null;

  // ── Confirmación de asignación ──
  const [confirmData, setConfirmData] = useState<{ tecnicoId: string; tecnicoNombre: string } | null>(null);

  const handleTecnicoClick = useCallback((tecId: string, nombre: string) => {
    setConfirmData({ tecnicoId: tecId, tecnicoNombre: nombre });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmData) {
      onAssignTecnico(cluster.index, confirmData.tecnicoId);
      setConfirmData(null);
    }
  }, [confirmData, onAssignTecnico, cluster.index]);

  const handleCancelConfirm = useCallback(() => {
    setConfirmData(null);
  }, []);

  return (
    <>
    {/* ── Modal de confirmación de asignación ── */}
    {confirmData && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleCancelConfirm}>
        <div
          className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-6 py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Confirmar asignación</h3>
                <p className="text-xs text-gray-500">Esta acción asignará las visitas al técnico seleccionado</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Grupo</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cluster.color }} />
                  Grupo {cluster.index + 1}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Hogares</span>
                <span className="font-semibold text-gray-900">{cluster.markers.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Técnico</span>
                <span className="font-semibold text-indigo-700">{confirmData.tecnicoNombre}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Barrios</span>
                <span className="font-medium text-gray-700 text-right max-w-[200px] truncate" title={barrios.join(', ')}>{barrios.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelConfirm}
              className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="text-sm font-semibold px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Confirmar asignación
            </button>
          </div>
        </div>
      </div>
    )}

    <div
      className={`rounded-xl border transition-all ${
        assignedTec ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-white'
      }`}
    >
      {/* Cabecera del grupo */}
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span
              className="w-3.5 h-3.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: cluster.color }}
            />
            <h4 className="text-sm font-bold text-gray-900">
              Grupo {cluster.index + 1}
            </h4>
          </div>

          <div className="flex items-center gap-4 mb-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {cluster.markers.length} hogar{cluster.markers.length !== 1 ? 'es' : ''}
            </span>
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {barrios.length} barrio{barrios.length !== 1 ? 's' : ''}
            </span>
          </div>

          <p className="text-xs text-gray-600">
            <span className="font-medium text-gray-700">Barrios:</span>{' '}
            {barrios.join(', ')}
          </p>

          {assignedTec && (
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Asignado a: {assignedTec.nombre} {assignedTec.apellido}
              </span>
              <button
                type="button"
                onClick={() => onAssignTecnico(cluster.index, '')}
                className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
                title="Remover asignación"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Botón seleccionar grupo */}
        <div className="flex-shrink-0">
          {!assignedTec ? (
            <button
              type="button"
              onClick={onToggleAssign}
              className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
                isAssigning
                  ? 'bg-indigo-700 text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isAssigning ? 'Cancelar' : 'Seleccionar grupo'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleAssign}
              className="text-xs font-medium px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Reasignar
            </button>
          )}
        </div>
      </div>

      {/* Panel de asignación de técnico */}
      {isAssigning && (
        <div className="px-5 py-3 border-t border-gray-100 bg-indigo-50/50">
          <p className="text-xs font-semibold text-gray-700 mb-2">Asignar técnico visitante a este grupo:</p>
          {loadingTec ? (
            <p className="text-xs text-gray-400">Cargando técnicos…</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tecnicos.map(tec => {
                const alreadyAssigned = Object.entries(tecnicoAssignments).some(
                  ([idx, tid]) => tid === String(tec.id) && Number(idx) !== cluster.index,
                );
                return (
                  <button
                    key={tec.id}
                    type="button"
                    onClick={() => handleTecnicoClick(String(tec.id), `${tec.nombre} ${tec.apellido}`)}
                    disabled={alreadyAssigned}
                    className={`text-xs px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                      alreadyAssigned
                        ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                        : 'border-indigo-300 text-indigo-700 bg-white hover:bg-indigo-100'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {tec.nombre?.[0]}{tec.apellido?.[0]}
                    </span>
                    <span>{tec.nombre} {tec.apellido}</span>
                    {alreadyAssigned && <span className="text-[10px] text-gray-400">(asignado)</span>}
                  </button>
                );
              })}
              {tecnicos.length === 0 && (
                <p className="text-xs text-gray-400">No hay técnicos visitantes activos</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lista de hogares expandible */}
      <div className="px-5 pb-4">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors mt-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Ver hogares del grupo
        </button>

        {isExpanded && (
          <ul className="mt-3 space-y-1.5 max-h-60 overflow-y-auto">
            {cluster.markers.map(m => (
              <li key={m.id} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>
                  <span className="font-medium">{m.solicitante}</span>
                  {' - '}
                  <span className="text-gray-500">{m.direccion}, {extractBarrio(m)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
    </>
  );
});

ClusterGroupCard.displayName = 'ClusterGroupCard';
