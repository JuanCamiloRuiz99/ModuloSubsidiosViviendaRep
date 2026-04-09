/**
 * VisitasRegistradasPage – Pantalla de visitas registradas para una etapa.
 *
 * Permite:
 *  - Filtrar visitas por estado (PROGRAMADA, REALIZANDO, COMPLETADA, CANCELADA).
 *  - Buscar por encuestador, radicado o ID.
 *  - Programar / reprogramar la fecha de visita (fecha_programada) por fila.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVisitasEtapa2 } from '../../../programas/presentation/hooks/useVisitaEtapa2';
import type { VisitaEtapa2Item } from '../../../programas/infrastructure/persistence/axios-visita-etapa2-repository';

const ESTADOS = [
  { value: '', label: 'Todos los estados' },
  { value: 'PROGRAMADA', label: 'Programada' },
  { value: 'REALIZANDO', label: 'Realizando' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

const estadoColor: Record<string, string> = {
  PROGRAMADA: 'bg-blue-100 text-blue-700',
  REALIZANDO: 'bg-amber-100 text-amber-700',
  COMPLETADA: 'bg-green-100 text-green-700',
  CANCELADA: 'bg-red-100 text-red-700',
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export const VisitasRegistradasPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: programaId, etapaId } = useParams<{ id: string; etapaId: string }>();

  const { data: visitas = [], isLoading } = useVisitasEtapa2({ etapa: Number(etapaId) });

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const filtradas = useMemo(() => {
    let resultado = visitas;
    if (filtroEstado) {
      resultado = resultado.filter((v: VisitaEtapa2Item) => v.estado_visita === filtroEstado);
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      resultado = resultado.filter(
        (v: VisitaEtapa2Item) =>
          String(v.id).includes(q) ||
          (v.encuestador_nombre ?? '').toLowerCase().includes(q) ||
          (v.postulacion_radicado ?? '').toLowerCase().includes(q) ||
          (v.nombre_encuestado ?? '').toLowerCase().includes(q),
      );
    }
    return resultado;
  }, [visitas, filtroEstado, busqueda]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = visitas.length;
    const programadas = visitas.filter((v: VisitaEtapa2Item) => v.estado_visita === 'PROGRAMADA').length;
    const realizando = visitas.filter((v: VisitaEtapa2Item) => v.estado_visita === 'REALIZANDO').length;
    const completadas = visitas.filter((v: VisitaEtapa2Item) => v.estado_visita === 'COMPLETADA').length;
    const canceladas = visitas.filter((v: VisitaEtapa2Item) => v.estado_visita === 'CANCELADA').length;
    const efectivas = visitas.filter((v: VisitaEtapa2Item) => v.visita_efectiva).length;
    return { total, programadas, realizando, completadas, canceladas, efectivas };
  }, [visitas]);

  // ── Render ──────────────────────────────────────────────────────────────── //

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 py-6 px-4">
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/visitas')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Volver"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Visitas registradas</h1>
          <p className="text-sm text-gray-500">Programa #{programaId} · Etapa #{etapaId}</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-gray-50 text-gray-800 border-gray-200' },
          { label: 'Programadas', value: stats.programadas, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Realizando', value: stats.realizando, color: 'bg-amber-50 text-amber-700 border-amber-200' },
          { label: 'Completadas', value: stats.completadas, color: 'bg-green-50 text-green-700 border-green-200' },
          { label: 'Canceladas', value: stats.canceladas, color: 'bg-red-50 text-red-700 border-red-200' },
          { label: 'Efectivas', value: stats.efectivas, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        ].map((s) => (
          <div key={s.label} className={`border rounded-xl px-4 py-3 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por ID, encuestador, radicado o encuestado…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[200px]"
        >
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {filtradas.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 font-medium">No se encontraron visitas</p>
          <p className="text-gray-400 text-sm mt-1">
            {visitas.length === 0
              ? 'No hay visitas registradas para esta etapa.'
              : 'Intenta con otros filtros de búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Radicado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Encuestador</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Encuestado</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Fecha programada</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Fecha visita</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs">Efectiva</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs">Datos hogar</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Teléfono</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtradas.map((v: VisitaEtapa2Item) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 font-mono text-xs">#{v.id}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{v.postulacion_radicado ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{v.encuestador_nombre}</td>
                    <td className="px-4 py-3 text-gray-700">{v.nombre_encuestado || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${estadoColor[v.estado_visita] ?? 'bg-gray-100 text-gray-600'}`}>
                        {v.estado_visita}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(v.fecha_programada)}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(v.fecha_visita)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.visita_efectiva ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {v.visita_efectiva ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {v.tiene_datos_hogar ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Completado</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Pendiente</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{v.telefono_contacto || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
            <span>
              Mostrando {filtradas.length} de {visitas.length} visita{visitas.length !== 1 ? 's' : ''}
            </span>
            {filtroEstado && (
              <button
                onClick={() => setFiltroEstado('')}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
