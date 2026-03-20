/**
 * MisVisitasPage – Panel del técnico visitante para ver sus visitas asignadas.
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMisVisitas } from '../hooks/use-mis-visitas';
import { EstadoVisita } from '../../domain/visita';

type FiltroEstado = 'TODAS' | EstadoVisita;

const ESTADO_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  PROGRAMADA:  { label: 'Programada',  bg: 'bg-blue-100',   text: 'text-blue-700' },
  REALIZANDO:  { label: 'En curso',    bg: 'bg-amber-100',  text: 'text-amber-700' },
  COMPLETADA:  { label: 'Completada',  bg: 'bg-green-100',  text: 'text-green-700' },
  CANCELADA:   { label: 'Cancelada',   bg: 'bg-red-100',    text: 'text-red-700' },
};

const FILTROS: { value: FiltroEstado; label: string }[] = [
  { value: 'TODAS',       label: 'Todas' },
  { value: EstadoVisita.PROGRAMADA,  label: 'Programadas' },
  { value: EstadoVisita.REALIZANDO,  label: 'En curso' },
  { value: EstadoVisita.COMPLETADA,  label: 'Completadas' },
  { value: EstadoVisita.CANCELADA,   label: 'Canceladas' },
];

export default function MisVisitasPage() {
  const { visitas, isLoading, error, refetch } = useMisVisitas();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<FiltroEstado>('TODAS');
  const [busqueda, setBusqueda] = useState('');

  const filtradas = useMemo(() => {
    let list = visitas;
    if (filtro !== 'TODAS') list = list.filter(v => v.estado === filtro);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      list = list.filter(
        v =>
          v.direccion.toLowerCase().includes(q) ||
          v.postulacionId.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q),
      );
    }
    return list;
  }, [visitas, filtro, busqueda]);

  // ── Contadores por estado ──
  const contadores = useMemo(() => {
    const c = { total: visitas.length, programadas: 0, enCurso: 0, completadas: 0, canceladas: 0 };
    for (const v of visitas) {
      if (v.estado === EstadoVisita.PROGRAMADA) c.programadas++;
      else if (v.estado === EstadoVisita.REALIZANDO) c.enCurso++;
      else if (v.estado === EstadoVisita.COMPLETADA) c.completadas++;
      else if (v.estado === EstadoVisita.CANCELADA) c.canceladas++;
    }
    return c;
  }, [visitas]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-lg text-gray-600 mb-4">Error al cargar las visitas</p>
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Visitas Asignadas</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona las visitas técnicas que te han sido asignadas</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* ── Tarjetas resumen ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total" value={contadores.total} color="bg-gray-100 text-gray-700" />
        <StatCard label="Programadas" value={contadores.programadas} color="bg-blue-50 text-blue-700" />
        <StatCard label="En curso" value={contadores.enCurso} color="bg-amber-50 text-amber-700" />
        <StatCard label="Completadas" value={contadores.completadas} color="bg-green-50 text-green-700" />
        <StatCard label="Canceladas" value={contadores.canceladas} color="bg-red-50 text-red-700" />
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {FILTROS.map(f => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filtro === f.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por dirección o ID..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* ── Lista de visitas ── */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Cargando visitas...</p>
          </div>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
          <div className="text-center">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">
              {visitas.length === 0 ? 'No tienes visitas asignadas aún' : 'No se encontraron visitas con los filtros aplicados'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Dirección</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha programada</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Calificación</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">ID Postulación</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtradas.map(v => {
                  const cfg = ESTADO_CONFIG[v.estado] ?? { label: v.estado, bg: 'bg-gray-100', text: 'text-gray-600' };
                  return (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 max-w-xs truncate font-medium text-gray-900" title={v.direccion}>
                        {v.direccion}
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{v.tipoVisita.toLowerCase()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatFecha(v.fechaProgramada)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {v.calificacion != null ? (
                          <span className={v.calificacion >= 60 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {v.calificacion}/100
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{v.postulacionId}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => navigate(`/mis-visitas/${v.id}/formulario`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
            Mostrando {filtradas.length} de {visitas.length} visitas
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componentes auxiliares ──

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

function formatFecha(fecha: Date | string | undefined): string {
  if (!fecha) return '—';
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}
