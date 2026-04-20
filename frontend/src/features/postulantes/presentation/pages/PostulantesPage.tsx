/**
 * PostulantesPage – Vista principal del módulo de Postulantes.
 *
 * Muestra todos los hogares registrados a través del formulario público
 * de Registro del Hogar, con búsqueda en tiempo real y filtro por estado.
 */

import React, { useMemo, useState, useCallback } from 'react';
import { usePostulantes, usePostulanteDetalle, useActualizarPostulante } from '../hooks/use-postulantes';
import type { PostulanteRow, ActualizarPostulanteData } from '../hooks/use-postulantes';
import { HeaderPanel } from '../../../../shared/presentation/components';
import { PostulanteDetalleModal } from '../components/PostulanteDetalleModal';
import { PostulanteEditarModal } from '../components/PostulanteEditarModal';
import { DistribuirPostulacionesModal } from '../components/DistribuirPostulacionesModal';
import { AsignarFuncionarioModal } from '../components/AsignarFuncionarioModal';
import { VisitaInfoModal } from '../components/VisitaInfoModal';
import { DescargarDocumentosModal } from '../components/DescargarDocumentosModal';
import { ReasignarVisitanteModal } from '../components/ReasignarVisitanteModal';
import { useProgramas } from '../../../programas/presentation/hooks/useProgramas';
import { useEtapas } from '../../../programas/presentation/hooks/useEtapas';
import {
  ESTADO_STYLES,
  ESTADOS_FILTRO,
  nombreCompleto as buildNombre,
  formatFecha,
} from '../utils/postulante-ui';

// ── Sub-componentes ───────────────────────────────────────────────────────── //

const EstadoBadge: React.FC<{ estado: string; label: string }> = ({ estado, label }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap
      ${ESTADO_STYLES[estado] ?? 'bg-gray-100 text-gray-600'}`}
  >
    {label}
  </span>
);

function nombreCompleto(row: PostulanteRow): string {
  if (!row.ciudadano) return '—';
  const { primer_nombre, segundo_nombre, primer_apellido, segundo_apellido } = row.ciudadano;
  return buildNombre(primer_nombre, segundo_nombre, primer_apellido, segundo_apellido);
}

const ITEMS_PER_PAGE = 10;

// ── Página principal ──────────────────────────────────────────────────────── //

export const PostulantesPage: React.FC = () => {
  const [programaSeleccionado, setProgramaSeleccionado] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda]         = useState('');
  const [selectedId, setSelectedId]     = useState<number | null>(null);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen]   = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isDistribuirOpen, setIsDistribuirOpen] = useState(false);
  const [visitaIdModal, setVisitaIdModal] = useState<number | null>(null);
  const [isVisitaInfoOpen, setIsVisitaInfoOpen] = useState(false);
  const [isAsignarOpen, setIsAsignarOpen] = useState(false);
  const [asignarRow, setAsignarRow] = useState<{ postulacionId: number; radicado: string; solicitante: string; funcionarioId: number | null } | null>(null);
  const [seleccionadas, setSeleccionadas] = useState<Set<number>>(new Set());
  const [isDescargarOpen, setIsDescargarOpen] = useState(false);
  const [isReasignarVisitanteOpen, setIsReasignarVisitanteOpen] = useState(false);
  const [reasignarVisitanteRow, setReasignarVisitanteRow] = useState<{ postulacionId: number; radicado: string; solicitante: string; visitanteId: number | null } | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);

  const { programas, isLoading: isLoadingProgramas } = useProgramas();
  const { data: etapas = [] } = useEtapas(programaSeleccionado || '0');
  const { postulantes, isLoading, error, refetch } = usePostulantes(undefined, programaSeleccionado || undefined);
  const {
    detalle: detalleSeleccionado,
    isLoading: isDetalleLoading,
    error: detalleError,
  } = usePostulanteDetalle(selectedId);
  const { mutateAsync: actualizarPostulante, isPending: isActualizando } = useActualizarPostulante();

  const handleActualizar = async (id: number, data: ActualizarPostulanteData) => {
    await actualizarPostulante({ id, data });
    setIsEditarOpen(false);
  };

  // Postulaciones sin funcionario asignado (para distribución)
  const sinFuncionario = useMemo(
    () => postulantes.filter(p => !p.funcionario_asignado),
    [postulantes],
  );

  // Filtrado + búsqueda en el cliente
  const filas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return postulantes.filter(row => {
      if (row.estado === 'NO_BENEFICIARIO') return false;
      const coincideEstado = !filtroEstado || row.estado === filtroEstado;
      if (!coincideEstado) return false;
      if (!q) return true;
      const nombre   = nombreCompleto(row).toLowerCase();
      const doc      = row.ciudadano?.numero_documento?.toLowerCase() ?? '';
      const radicado = row.numero_radicado.toLowerCase();
      const municipio = row.municipio.toLowerCase();
      const programa = row.programa_nombre?.toLowerCase() ?? '';
      return (
        nombre.includes(q)    ||
        doc.includes(q)       ||
        radicado.includes(q)  ||
        municipio.includes(q) ||
        programa.includes(q)
      );
    });
  }, [postulantes, filtroEstado, busqueda]);

  // Reset página al cambiar filtros
  const totalPaginas = Math.max(1, Math.ceil(filas.length / ITEMS_PER_PAGE));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const paginatedFilas = useMemo(() => {
    const inicio = (paginaSegura - 1) * ITEMS_PER_PAGE;
    return filas.slice(inicio, inicio + ITEMS_PER_PAGE);
  }, [filas, paginaSegura]);

  const handleFiltroEstado = useCallback((v: string) => { setFiltroEstado(v); setPaginaActual(1); }, []);
  const handleBusqueda = useCallback((v: string) => { setBusqueda(v); setPaginaActual(1); }, []);

  return (
    <div className="max-w-7xl mx-auto p-8">

      {/* ── Cabecera reutilizada ── */}
      <HeaderPanel
        title="Postulantes"
        subtitle="Registros del Hogar recibidos a través del formulario público"
        actionLabel="Actualizar"
        onAction={() => void refetch()}
      />

      {/* ── Selector de programa ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Seleccione un programa</label>
        <select
          value={programaSeleccionado}
          onChange={e => setProgramaSeleccionado(e.target.value)}
          disabled={isLoadingProgramas}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Todos los programas</option>
          {programas.filter(p => p.estado !== 'CULMINADO').map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      {/* ── Mensaje cuando no hay programa seleccionado ── */}
      {!programaSeleccionado && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-600 mb-1">Seleccione un programa</h3>
          <p className="text-sm text-gray-400">Para ver las postulaciones, primero seleccione un programa del listado anterior.</p>
        </div>
      )}

      {/* ── Contenido visible solo con programa seleccionado ── */}
      {programaSeleccionado && (<>

      {/* ── Barra de selección ── */}
      {seleccionadas.size > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-sm font-medium text-blue-800">
            {seleccionadas.size} postulación{seleccionadas.size !== 1 ? 'es' : ''} seleccionada{seleccionadas.size !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setIsDescargarOpen(true)}
            className="ml-auto px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar documentos
          </button>
          <button
            onClick={() => setSeleccionadas(new Set())}
            className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-blue-100 transition-colors"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* ── Filtros ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={busqueda}
            onChange={e => handleBusqueda(e.target.value)}
            placeholder="Buscar por nombre, documento, radicado o municipio..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Filtro estado */}
        <select
          value={filtroEstado}
          onChange={e => handleFiltroEstado(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[190px]"
        >
          {ESTADOS_FILTRO.map(e => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>

        {/* Botón distribuir – visible cuando hay postulaciones sin funcionario asignado */}
        {sinFuncionario.length > 0 && (
          <button
            onClick={() => setIsDistribuirOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Distribuir ({sinFuncionario.length})
          </button>
        )}
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-500">
            <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm">Cargando registros...</span>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="flex items-center gap-3 p-6 text-red-700 bg-red-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm font-medium">
              {busqueda || filtroEstado
                ? 'No se encontraron registros con ese criterio'
                : 'Aún no hay registros del hogar'}
            </p>
          </div>
        )}

        {/* Tabla con datos */}
        {!isLoading && !error && filas.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={paginatedFilas.length > 0 && paginatedFilas.every(r => r.id_postulacion != null && seleccionadas.has(r.id_postulacion))}
                      onChange={e => {
                        if (e.target.checked) {
                          setSeleccionadas(prev => {
                            const next = new Set(prev);
                            paginatedFilas.forEach(r => { if (r.id_postulacion != null) next.add(r.id_postulacion); });
                            return next;
                          });
                        } else {
                          setSeleccionadas(prev => {
                            const next = new Set(prev);
                            paginatedFilas.forEach(r => { if (r.id_postulacion != null) next.delete(r.id_postulacion); });
                            return next;
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">N.° Radicado</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Fecha</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Solicitante</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Programa</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Documento</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Municipio</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Zona</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-center whitespace-nowrap">Miembros</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Estado</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Funcionario</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Visitante</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-center whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedFilas.map(row => (
                  <tr key={row.id} className={`transition-colors ${
                    row.id_postulacion != null && seleccionadas.has(row.id_postulacion)
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : 'hover:bg-gray-50'
                  }`}>

                    {/* Checkbox */}
                    <td className="px-3 py-3">
                      {row.id_postulacion != null && (
                        <input
                          type="checkbox"
                          checked={seleccionadas.has(row.id_postulacion)}
                          onChange={e => {
                            setSeleccionadas(prev => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(row.id_postulacion!); else next.delete(row.id_postulacion!);
                              return next;
                            });
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      )}
                    </td>

                    {/* Radicado */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {row.numero_radicado}
                      </span>
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatFecha(row.fecha_radicado)}
                    </td>

                    {/* Solicitante */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 leading-tight">{nombreCompleto(row)}</p>
                    </td>

                    {/* Programa */}
                    <td className="px-4 py-3">
                      {row.programa_nombre
                        ? <span className="text-sm text-gray-800" title={row.programa_nombre}>{row.programa_nombre}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>

                    {/* Documento */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.ciudadano ? (
                        <div>
                          <p className="text-gray-900">{row.ciudadano.numero_documento}</p>
                          <p className="text-xs text-gray-400">{row.ciudadano.tipo_documento_label}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Municipio */}
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{row.municipio}</p>
                      <p className="text-xs text-gray-400">{row.departamento}</p>
                    </td>

                    {/* Zona */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        row.zona === 'URBANA'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}>
                        {row.zona_label}
                      </span>
                    </td>

                    {/* Miembros */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-semibold text-xs">
                        {row.total_miembros}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <EstadoBadge estado={row.estado} label={row.estado_label} />
                    </td>

                    {/* Funcionario asignado */}
                    <td className="px-4 py-3">
                      {row.funcionario_asignado
                        ? <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{row.funcionario_asignado.nombre}</span>
                        : <span className="text-gray-300 text-xs">Sin asignar</span>}
                    </td>

                    {/* Visitante asignado */}
                    <td className="px-4 py-3">
                      {row.visitante_asignado
                        ? <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">{row.visitante_asignado.nombre}</span>
                        : <span className="text-gray-300 text-xs">Sin asignar</span>}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="relative flex items-center justify-center gap-2">
                        {/* Botón Ver visita */}
                        {row.visita_id && (
                          <button
                            onClick={() => { setVisitaIdModal(row.visita_id); setIsVisitaInfoOpen(true); }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-600 border border-teal-200 transition-colors"
                            title="Ver información de la visita técnica"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}

                        <button
                          onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                          onBlur={() => setTimeout(() => setOpenMenuId(current => current === row.id ? null : current), 150)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label="Acciones"
                        >
                          <span className="text-lg leading-none">⋮</span>
                        </button>

                        {openMenuId === row.id && (
                          <div className="absolute right-0 top-10 w-40 bg-white border border-gray-200 shadow-lg rounded-lg z-10 py-1 text-sm">
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                              onMouseDown={() => { setSelectedId(row.id); setIsDetalleOpen(true); setOpenMenuId(null); }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                              onMouseDown={() => { setSelectedId(row.id); setIsEditarOpen(true); setOpenMenuId(null); }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </button>
                            {row.id_postulacion && (
                              <button
                                className="w-full text-left px-3 py-2 hover:bg-blue-50 text-blue-700 font-medium flex items-center gap-2"
                                onMouseDown={() => {
                                  setAsignarRow({
                                    postulacionId: row.id_postulacion!,
                                    radicado: row.numero_radicado,
                                    solicitante: nombreCompleto(row),
                                    funcionarioId: row.funcionario_asignado?.id ?? null,
                                  });
                                  setIsAsignarOpen(true);
                                  setOpenMenuId(null);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {row.funcionario_asignado ? 'Reasignar' : 'Asignar'}
                              </button>
                            )}
                            {row.visita_id && row.id_postulacion && (
                              <button
                                className="w-full text-left px-3 py-2 hover:bg-teal-50 text-teal-700 font-medium flex items-center gap-2"
                                onMouseDown={() => {
                                  setReasignarVisitanteRow({
                                    postulacionId: row.id_postulacion!,
                                    radicado: row.numero_radicado,
                                    solicitante: nombreCompleto(row),
                                    visitanteId: row.visitante_asignado?.id ?? null,
                                  });
                                  setIsReasignarVisitanteOpen(true);
                                  setOpenMenuId(null);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                Reasignar visitante
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer con paginación */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Mostrando {(paginaSegura - 1) * ITEMS_PER_PAGE + 1}–{Math.min(paginaSegura * ITEMS_PER_PAGE, filas.length)} de {filas.length} registro{filas.length !== 1 ? 's' : ''}
              </span>
              {totalPaginas > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPaginaActual(1)}
                    disabled={paginaSegura === 1}
                    className="px-2 py-1 rounded text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >«</button>
                  <button
                    onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                    disabled={paginaSegura === 1}
                    className="px-2 py-1 rounded text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >‹</button>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPaginas || Math.abs(p - paginaSegura) <= 2)
                    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === '...' ? (
                        <span key={`dots-${idx}`} className="px-1 text-xs text-gray-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPaginaActual(p)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            p === paginaSegura
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-200'
                          }`}
                        >{p}</button>
                      )
                    )}
                  <button
                    onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                    disabled={paginaSegura === totalPaginas}
                    className="px-2 py-1 rounded text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >›</button>
                  <button
                    onClick={() => setPaginaActual(totalPaginas)}
                    disabled={paginaSegura === totalPaginas}
                    className="px-2 py-1 rounded text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >»</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      </>)}

      {/* ── Modales ── */}
      <PostulanteDetalleModal
        id={selectedId}
        isOpen={isDetalleOpen}
        onClose={() => setIsDetalleOpen(false)}
        onEditClick={() => { setIsDetalleOpen(false); setIsEditarOpen(true); }}
      />
      <PostulanteEditarModal
        detalle={detalleSeleccionado}
        isOpen={isEditarOpen}
        onClose={() => setIsEditarOpen(false)}
        onSubmit={handleActualizar}
        isLoading={isActualizando}
        isDetalleLoading={isDetalleLoading}
        detalleError={detalleError}
      />
      <DistribuirPostulacionesModal
        isOpen={isDistribuirOpen}
        onClose={() => setIsDistribuirOpen(false)}
        totalPostulaciones={sinFuncionario.length}
        postulacionIds={sinFuncionario.map(p => p.id_postulacion).filter((id): id is number => id != null)}
      />
      <VisitaInfoModal
        visitaId={visitaIdModal}
        isOpen={isVisitaInfoOpen}
        onClose={() => setIsVisitaInfoOpen(false)}
      />
      <AsignarFuncionarioModal
        isOpen={isAsignarOpen}
        onClose={() => { setIsAsignarOpen(false); setAsignarRow(null); }}
        postulacionId={asignarRow?.postulacionId ?? null}
        radicado={asignarRow?.radicado ?? ''}
        solicitante={asignarRow?.solicitante ?? ''}
        funcionarioActualId={asignarRow?.funcionarioId}
      />
      <DescargarDocumentosModal
        isOpen={isDescargarOpen}
        onClose={() => setIsDescargarOpen(false)}
        postulacionIds={Array.from(seleccionadas)}
        totalSeleccionadas={seleccionadas.size}
        etapas={etapas}
      />
      <ReasignarVisitanteModal
        isOpen={isReasignarVisitanteOpen}
        onClose={() => { setIsReasignarVisitanteOpen(false); setReasignarVisitanteRow(null); }}
        postulacionId={reasignarVisitanteRow?.postulacionId ?? null}
        radicado={reasignarVisitanteRow?.radicado ?? ''}
        solicitante={reasignarVisitanteRow?.solicitante ?? ''}
        visitanteActualId={reasignarVisitanteRow?.visitanteId ?? null}
      />

    </div>
  );
};
