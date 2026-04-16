/**
 * MisPostulacionesPage – Panel del funcionario para ver las postulaciones
 * que le han sido asignadas.
 */

import React, { useMemo, useState } from 'react';
import { useMisPostulaciones } from '../hooks/use-mis-postulaciones';
import { usePostulanteDetalle, useActualizarPostulante } from '../hooks/use-postulantes';
import type { PostulanteRow, ActualizarPostulanteData } from '../hooks/use-postulantes';
import { PostulanteDetalleModal } from '../components/PostulanteDetalleModal';
import { PostulanteEditarModal } from '../components/PostulanteEditarModal';
import { HeaderPanel } from '../../../../shared/presentation/components';
import { useProgramas } from '../../../programas/presentation/hooks/useProgramas';
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

// ── Página ─────────────────────────────────────────────────────────────────── //

export default function MisPostulacionesPage() {
  const { programas } = useProgramas();
  const programasDisponibles = useMemo(
    () => (programas ?? []).filter((p: any) => p.estado !== 'CULMINADO'),
    [programas],
  );

  const [selectedProgramaId, setSelectedProgramaId] = useState<string>('');
  const { postulantes, isLoading, error, refetch } = useMisPostulaciones(selectedProgramaId || null);

  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda]         = useState('');
  const [selectedId, setSelectedId]     = useState<number | null>(null);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen]   = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

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

  // Filtrado + búsqueda
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-lg text-gray-600 mb-4">Error al cargar las postulaciones</p>
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">

      {/* ── Encabezado ── */}
      <HeaderPanel
        title="Mis Postulaciones Asignadas"
        subtitle="Gestiona las postulaciones que te han sido asignadas"
        actionLabel={selectedProgramaId ? 'Actualizar' : undefined}
        onAction={selectedProgramaId ? () => void refetch() : undefined}
      />

      {/* ── Selector de programa ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Seleccionar programa</label>
        <select
          value={selectedProgramaId}
          onChange={e => setSelectedProgramaId(e.target.value)}
          className="w-full max-w-md px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">— Seleccione un programa —</option>
          {programasDisponibles.map((p: any) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      {!selectedProgramaId ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
          <div className="text-center">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">Selecciona un programa para ver tus postulaciones asignadas</p>
          </div>
        </div>
      ) : (
      <>

      {/* ── Filtros ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[190px]"
        >
          {ESTADOS_FILTRO.map(e => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>

        <div className="relative flex-1 max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, documento, radicado..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* ── Contenido ── */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Cargando postulaciones...</p>
          </div>
        </div>
      ) : filas.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
          <div className="text-center">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">
              {postulantes.length === 0
                ? 'No tienes postulaciones asignadas aún'
                : 'No se encontraron postulaciones con los filtros aplicados'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">N.° Radicado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Fecha</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Solicitante</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Programa</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Documento</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Municipio</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Zona</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Miembros</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Estado</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filas.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {row.numero_radicado}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatFecha(row.fecha_radicado)}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 leading-tight">{nombreCompleto(row)}</p>
                    </td>

                    <td className="px-4 py-3">
                      {row.programa_nombre
                        ? <span className="text-sm text-gray-800">{row.programa_nombre}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>

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

                    <td className="px-4 py-3">
                      <p className="text-gray-900">{row.municipio}</p>
                      <p className="text-xs text-gray-400">{row.departamento}</p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        row.zona === 'URBANA'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}>
                        {row.zona_label}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-semibold text-xs">
                        {row.total_miembros}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <EstadoBadge estado={row.estado} label={row.estado_label} />
                    </td>

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
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
            Mostrando {filas.length} de {postulantes.length} postulación{postulantes.length !== 1 ? 'es' : ''}
          </div>
        </div>
      )}

      </>
      )}

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
    </div>
  );
}
