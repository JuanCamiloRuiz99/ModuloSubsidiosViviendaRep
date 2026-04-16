/**
 * MisVisitasPage – Panel del técnico visitante para ver sus visitas asignadas
 * y programar nuevas visitas para postulaciones aprobadas.
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMisVisitas } from '../hooks/use-mis-visitas';
import { useProgramas } from '../../../programas/presentation/hooks/useProgramas';
import { HeaderPanel } from '../../../../shared/presentation/components';
import { EstadoVisita } from '../../domain/visita';
import { storageService } from '../../../../core/services';
import { apiService } from '../../../../core/services';

type FiltroEstado = 'TODAS' | EstadoVisita;
type VistaActiva = 'asignadas' | 'porProgramar';

const ESTADO_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  ASIGNADA:    { label: 'Por programar',    bg: 'bg-yellow-100', text: 'text-yellow-700' },
  PROGRAMADA:  { label: 'Visita Programada', bg: 'bg-blue-100',   text: 'text-blue-700' },
  REALIZANDO:  { label: 'En curso',          bg: 'bg-amber-100',  text: 'text-amber-700' },
  COMPLETADA:  { label: 'Visita Realizada',  bg: 'bg-green-100',  text: 'text-green-700' },
  CANCELADA:   { label: 'Cancelada',         bg: 'bg-red-100',    text: 'text-red-700' },
};

const FILTROS: { value: FiltroEstado; label: string }[] = [
  { value: 'TODAS',       label: 'Todas' },
  { value: EstadoVisita.ASIGNADA,    label: 'Por programar' },
  { value: EstadoVisita.PROGRAMADA,  label: 'Programadas' },
  { value: EstadoVisita.REALIZANDO,  label: 'En curso' },
  { value: EstadoVisita.COMPLETADA,  label: 'Realizadas' },
  { value: EstadoVisita.CANCELADA,   label: 'Canceladas' },
];

// ── Tipo minimal para las postulaciones aprobadas ──
interface PostulacionAprobada {
  id: number;               // id de GestionHogarEtapa1
  id_postulacion: number;
  programa_id: number;
  numero_radicado: string;
  direccion: string;
  municipio: string;
  ciudadano: { primer_nombre: string; primer_apellido: string; numero_documento: string } | null;
  visita_id: number | null;
}

export default function MisVisitasPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = storageService.getUser();

  const [selectedProgramaId, setSelectedProgramaId] = useState<string>('');
  const [selectedProgramaNombre, setSelectedProgramaNombre] = useState<string>('');
  const [filtro, setFiltro] = useState<FiltroEstado>('TODAS');
  const [busqueda, setBusqueda] = useState('');
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('asignadas');

  // Fecha por programar (por postulación)
  const [fechasPorProgramar, setFechasPorProgramar] = useState<Record<number, string>>({});
  // Fecha por programar para visitas ASIGNADAS (por visitaId)
  const [fechasVisitaProgramar, setFechasVisitaProgramar] = useState<Record<string, string>>({});

  const { programas, isLoading: loadingProgramas } = useProgramas({ pageSize: 100 });
  const { visitas, isLoading, error, refetch } = useMisVisitas(selectedProgramaId || undefined);

  // ── Postulaciones APROBADAS pendientes de programar visita ──
  const { data: postulacionesAprobadas = [], isLoading: loadingAprobadas, refetch: refetchAprobadas } = useQuery({
    queryKey: ['postulaciones-pendientes-visita', selectedProgramaId],
    queryFn: async () => {
      const { data } = await apiService.get<PostulacionAprobada[]>(
        '/postulaciones/registro-hogar/',
        { params: { estado: 'VISITA_PENDIENTE', programa_id: selectedProgramaId } },
      );
      return Array.isArray(data) ? data : [];
    },
    enabled: !!selectedProgramaId && vistaActiva === 'porProgramar',
  });

  // Solo las que no tienen visita asignada aún
  const pendientesDeProgramar = useMemo(
    () => postulacionesAprobadas.filter(p => !p.visita_id),
    [postulacionesAprobadas],
  );

  // ── Mutación: crear visita desde el panel del técnico ──
  const crearVisitaMutation = useMutation({
    mutationFn: async (p: PostulacionAprobada) => {
      const fecha = fechasPorProgramar[p.id_postulacion];
      if (!fecha) throw new Error('Selecciona una fecha');
      await apiService.post('/visitas/crear/', {
        postulacionId: p.id_postulacion,
        programaId: p.programa_id,
        inspectorId: user?.id ?? user?.usuario_id,
        tipoVisita: 'INICIAL',
        direccion: p.direccion ?? '',
        fechaProgramada: new Date(fecha).toISOString(),
      });
    },
    onSuccess: () => {
      void refetchAprobadas();
      void refetch();
      void queryClient.invalidateQueries({ queryKey: ['visitas', 'mis-visitas'] });
    },
  });

  // ── Mutación: programar fecha de visita ASIGNADA ──
  const programarVisitaMutation = useMutation({
    mutationFn: async ({ visitaId, fecha }: { visitaId: string; fecha: string }) => {
      await apiService.post('/visitas/programar/', {
        visitaId,
        fechaProgramada: new Date(fecha).toISOString(),
      });
    },
    onSuccess: (_data, variables) => {
      setFechasVisitaProgramar(prev => {
        const next = { ...prev };
        delete next[variables.visitaId];
        return next;
      });
      void refetch();
      void queryClient.invalidateQueries({ queryKey: ['visitas', 'mis-visitas'] });
    },
  });

  const handleCambiarPrograma = () => {
    setSelectedProgramaId('');
    setSelectedProgramaNombre('');
    setBusqueda('');
    setFiltro('TODAS');
    setVistaActiva('asignadas');
  };

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
    const c = { total: visitas.length, asignadas: 0, programadas: 0, enCurso: 0, completadas: 0, canceladas: 0 };
    for (const v of visitas) {
      if (v.estado === EstadoVisita.ASIGNADA) c.asignadas++;
      else if (v.estado === EstadoVisita.PROGRAMADA) c.programadas++;
      else if (v.estado === EstadoVisita.REALIZANDO) c.enCurso++;
      else if (v.estado === EstadoVisita.COMPLETADA) c.completadas++;
      else if (v.estado === EstadoVisita.CANCELADA) c.canceladas++;
    }
    return c;
  }, [visitas]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <HeaderPanel title="Mis Visitas Asignadas" subtitle="Gestiona las visitas técnicas que te han sido asignadas" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-lg text-gray-600 mb-4">Error al cargar las visitas</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Encabezado ── */}
      <HeaderPanel
        title="Mis Visitas"
        subtitle={selectedProgramaId ? `Programa: ${selectedProgramaNombre}` : 'Selecciona un programa para gestionar tus visitas'}
        actionLabel="Cambiar programa"
        onAction={selectedProgramaId ? handleCambiarPrograma : undefined}
      />

      {/* ── Selector de programa ── */}
      {!selectedProgramaId && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Selecciona un programa</h2>
          {loadingProgramas ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : programas.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No hay programas disponibles.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {programas.map(programa => (
                <button
                  key={programa.id}
                  onClick={() => { setSelectedProgramaId(String(programa.id)); setSelectedProgramaNombre(programa.nombre); }}
                  className="text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors group"
                >
                  <p className="font-medium text-gray-900 group-hover:text-indigo-700 text-sm leading-snug">{programa.nombre}</p>
                  {programa.entidadResponsable && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{programa.entidadResponsable}</p>
                  )}
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    programa.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {programa.estado}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Contenido del programa seleccionado ── */}
      {selectedProgramaId && (
        <>
          {/* ── Tabs ── */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            <button
              onClick={() => setVistaActiva('asignadas')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                vistaActiva === 'asignadas'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 Mis visitas asignadas
              {contadores.total > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                  {contadores.total}
                </span>
              )}
            </button>
            <button
              onClick={() => setVistaActiva('porProgramar')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                vistaActiva === 'porProgramar'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📅 Programar visitas
              {pendientesDeProgramar.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                  {pendientesDeProgramar.length}
                </span>
              )}
            </button>
          </div>

          {/* ══════════ TAB: Mis visitas asignadas ══════════ */}
          {vistaActiva === 'asignadas' && (
            <>
              {/* ── Tarjetas resumen ── */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <StatCard label="Total" value={contadores.total} color="bg-gray-100 text-gray-700" />
                <StatCard label="Por programar" value={contadores.asignadas} color="bg-yellow-50 text-yellow-700" />
                <StatCard label="Programadas" value={contadores.programadas} color="bg-blue-50 text-blue-700" />
                <StatCard label="En curso" value={contadores.enCurso} color="bg-amber-50 text-amber-700" />
                <StatCard label="Realizadas" value={contadores.completadas} color="bg-green-50 text-green-700" />
                <StatCard label="Canceladas" value={contadores.canceladas} color="bg-red-50 text-red-700" />
              </div>

              {/* ── Filtros ── */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
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

                <div className="flex gap-3 items-center">
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Buscar por dirección o ID..."
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                      className="w-64 pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
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
                      {visitas.length === 0 ? 'No tienes visitas asignadas en este programa' : 'No se encontraron visitas con los filtros aplicados'}
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
                          const esAsignada = v.estado === EstadoVisita.ASIGNADA;
                          const fechaVal = fechasVisitaProgramar[v.id] ?? '';
                          const isProgramando = programarVisitaMutation.isPending &&
                            (programarVisitaMutation.variables as { visitaId: string })?.visitaId === v.id;
                          return (
                            <tr key={v.id} className={`hover:bg-gray-50 transition-colors ${esAsignada ? 'bg-yellow-50/40' : ''}`}>
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
                                {esAsignada ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="datetime-local"
                                      value={fechaVal}
                                      onChange={e =>
                                        setFechasVisitaProgramar(prev => ({ ...prev, [v.id]: e.target.value }))
                                      }
                                      className="px-2 py-1 text-xs border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
                                    />
                                    <button
                                      disabled={!fechaVal || isProgramando}
                                      onClick={() => programarVisitaMutation.mutate({ visitaId: v.id, fecha: fechaVal })}
                                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                      {isProgramando ? (
                                        <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                      ) : '📅'}{' '}
                                      Programar
                                    </button>
                                  </div>
                                ) : (
                                  formatFecha(v.fechaProgramada)
                                )}
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
            </>
          )}

          {/* ══════════ TAB: Programar visitas ══════════ */}
          {vistaActiva === 'porProgramar' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Postulaciones con <span className="font-semibold text-green-700">visita pendiente</span> que aún no tienen visita programada.
                  Selecciona una fecha y haz clic en <strong>Programar</strong> para asignarte la visita.
                </p>
                <button
                  onClick={() => refetchAprobadas()}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Actualizar
                </button>
              </div>

              {loadingAprobadas ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-green-200 border-t-green-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Cargando postulaciones...</p>
                  </div>
                </div>
              ) : pendientesDeProgramar.length === 0 ? (
                <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
                  <div className="text-center">
                    <div className="text-5xl mb-3">✅</div>
                    <p className="text-gray-500 font-medium">No hay postulaciones pendientes de programar visita</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-green-50 border-b border-green-100">
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Solicitante</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Radicado</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Dirección</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Municipio</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha de visita</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-600">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pendientesDeProgramar.map(p => {
                          const nombreCiudadano = p.ciudadano
                            ? `${p.ciudadano.primer_nombre} ${p.ciudadano.primer_apellido}`
                            : '—';
                          const fechaVal = fechasPorProgramar[p.id_postulacion] ?? '';
                          const isPending = crearVisitaMutation.isPending &&
                            (crearVisitaMutation.variables as PostulacionAprobada)?.id_postulacion === p.id_postulacion;

                          return (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-900">{nombreCiudadano}</p>
                                {p.ciudadano && (
                                  <p className="text-xs text-gray-400">{p.ciudadano.numero_documento}</p>
                                )}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.numero_radicado}</td>
                              <td className="px-4 py-3 text-gray-700 max-w-xs truncate" title={p.direccion}>{p.direccion}</td>
                              <td className="px-4 py-3 text-gray-600">{p.municipio}</td>
                              <td className="px-4 py-3">
                                <input
                                  type="datetime-local"
                                  value={fechaVal}
                                  onChange={e =>
                                    setFechasPorProgramar(prev => ({ ...prev, [p.id_postulacion]: e.target.value }))
                                  }
                                  className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  disabled={!fechaVal || isPending}
                                  onClick={() => crearVisitaMutation.mutate(p)}
                                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                  {isPending ? (
                                    <>
                                      <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                      </svg>
                                      Programando…
                                    </>
                                  ) : (
                                    <>📅 Programar</>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                    {pendientesDeProgramar.length} postulación{pendientesDeProgramar.length !== 1 ? 'es' : ''} pendiente{pendientesDeProgramar.length !== 1 ? 's' : ''} de programar visita
                  </div>
                </div>
              )}
            </>
          )}
        </>
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
