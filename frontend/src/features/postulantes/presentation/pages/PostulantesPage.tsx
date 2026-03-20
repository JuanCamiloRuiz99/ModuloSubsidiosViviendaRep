/**
 * PostulantesPage – Vista principal del módulo de Postulantes.
 *
 * Muestra todos los hogares registrados a través del formulario público
 * de Registro del Hogar, con búsqueda en tiempo real y filtro por estado.
 */

import React, { useMemo, useState } from 'react';
import { usePostulantes, usePostulanteDetalle, useActualizarPostulante } from '../hooks/use-postulantes';
import type { PostulanteRow, ActualizarPostulanteData } from '../hooks/use-postulantes';
import { StatCard, HeaderPanel } from '../../../../shared/presentation/components';
import { PostulanteDetalleModal } from '../components/PostulanteDetalleModal';
import { PostulanteEditarModal } from '../components/PostulanteEditarModal';
import { VisitaTecnicaMapaModal } from '../components/VisitaTecnicaMapaModal';
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

// ── Página principal ──────────────────────────────────────────────────────── //

export const PostulantesPage: React.FC = () => {
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda]         = useState('');
  const [selectedId, setSelectedId]     = useState<number | null>(null);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen]   = useState(false);
  const [isMapaOpen, setIsMapaOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const { postulantes, isLoading, error, refetch } = usePostulantes();
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

  // Estadísticas
  const stats = useMemo(() => ({
    total:           postulantes.length,
    registradas:     postulantes.filter(p => p.estado === 'REGISTRADA').length,
    revision:        postulantes.filter(p => p.estado === 'EN_REVISION').length,
    subsanacion:     postulantes.filter(p => p.estado === 'SUBSANACION').length,
    visitaPendiente: postulantes.filter(p => p.estado === 'VISITA_PENDIENTE').length,
    aprobadas:       postulantes.filter(p => p.estado === 'APROBADA').length,
    rechazadas:      postulantes.filter(p => p.estado === 'RECHAZADA').length,
  }), [postulantes]);

  // Filtrado + búsqueda en el cliente
  const filas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return postulantes.filter(row => {
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

  return (
    <div className="p-8">

      {/* ── Cabecera reutilizada ── */}
      <HeaderPanel
        title="Postulantes"
        subtitle="Registros del Hogar recibidos a través del formulario público"
        actionLabel="Actualizar"
        onAction={() => void refetch()}
      />

      {/* ── Tarjetas estadísticas reutilizadas ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Registros"
          value={stats.total}
          color="blue"
          description="Todos los hogares registrados"
          onClick={() => setFiltroEstado('')}
        />
        <StatCard
          title="Registradas"
          value={stats.registradas}
          color="purple"
          description="Nuevas solicitudes pendientes"
          onClick={() => setFiltroEstado('REGISTRADA')}
        />
        <StatCard
          title="En Revisión"
          value={stats.revision}
          color="orange"
          description="En proceso de evaluación"
          onClick={() => setFiltroEstado('EN_REVISION')}
        />
        <StatCard
          title="Subsanación"
          value={stats.subsanacion}
          color="red"
          description="A la espera de ajustes"
          onClick={() => setFiltroEstado('SUBSANACION')}
        />
        <StatCard
          title="Aprobadas"
          value={stats.aprobadas}
          color="green"
          description="Postulaciones aprobadas"
          onClick={() => setFiltroEstado('APROBADA')}
        />
      </div>

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
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, documento, radicado o municipio..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Filtro estado */}
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[190px]"
        >
          {ESTADOS_FILTRO.map(e => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setIsMapaOpen(true)}
          className="px-4 py-2 rounded-lg border border-blue-200 text-blue-700 text-sm font-semibold bg-white hover:bg-blue-50 transition-colors"
        >
          Mapa visitas técnicas
        </button>
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
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">N.° Radicado</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Fecha</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Solicitante</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Programa</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Documento</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Municipio</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Zona</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-center whitespace-nowrap">Miembros</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Estado</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-center whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filas.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">

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

                    {/* Acciones */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="relative flex justify-center">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                          onBlur={() => setTimeout(() => setOpenMenuId(current => current === row.id ? null : current), 150)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label="Acciones"
                        >
                          <span className="text-lg leading-none">⋮</span>
                        </button>

                        {openMenuId === row.id && (
                          <div className="absolute right-0 top-10 w-32 bg-white border border-gray-200 shadow-lg rounded-lg z-10 py-1 text-sm">
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700"
                              onMouseDown={() => { setSelectedId(row.id); setIsDetalleOpen(true); setOpenMenuId(null); }}
                            >
                              Ver
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700"
                              onMouseDown={() => { setSelectedId(row.id); setIsEditarOpen(true); setOpenMenuId(null); }}
                            >
                              Editar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer con conteo */}
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400 bg-gray-50">
              Mostrando {filas.length} de {postulantes.length} registro{postulantes.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

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

      <VisitaTecnicaMapaModal
        isOpen={isMapaOpen}
        onClose={() => setIsMapaOpen(false)}
      />
    </div>
  );
};
