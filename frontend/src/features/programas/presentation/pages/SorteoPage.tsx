/**
 * SorteoPage – Sorteo aleatorio de beneficiarios para un programa.
 *
 * Muestra las postulaciones con estado APROBADA y permite ejecutar un
 * sorteo aleatorio ÚNICO e IRREVERSIBLE para asignar BENEFICIADO / NO_BENEFICIARIO.
 * El sorteo se habilita cuando la Etapa 1 está finalizada.
 */

import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../../../core/services';
import { useEtapas } from '../hooks/useEtapas';

// ── Tipos ─────────────────────────────────────────────────────────────────── //

interface Elegible {
  id: number;
  numero_radicado: string;
  nombre: string;
  documento: string;
  fecha_postulacion: string;
}

interface SorteoEstado {
  elegibles: number;
  ya_sorteadas: number;
  sorteo_realizado: boolean;
}

interface SorteoResultado {
  total_elegibles: number;
  total_beneficiados: number;
  total_no_beneficiarios: number;
  beneficiados: { id: number; numero_radicado: string; nombre: string; estado: string }[];
  no_beneficiarios: { id: number; numero_radicado: string; nombre: string; estado: string }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────── //

const Spinner: React.FC<{ className?: string }> = ({ className = 'h-5 w-5 text-amber-500' }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

// ── Componente principal ──────────────────────────────────────────────────── //

export const SorteoPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: programaId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [cantidad, setCantidad] = useState<number>(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resultado, setResultado] = useState<SorteoResultado | null>(null);
  const [tabResultado, setTabResultado] = useState<'beneficiados' | 'no_beneficiarios'>('beneficiados');

  // ── Queries ─────────────────────────────────────────────────────────── //

  const { data: etapas = [], isLoading: loadingEtapas } = useEtapas(programaId!);
  const etapa1 = etapas.find((e: any) => e.numero_etapa === 1);
  const etapa1Finalizada = etapa1?.finalizada === true;

  const { data: estado, isLoading: loadingEstado } = useQuery<SorteoEstado>({
    queryKey: ['sorteo-estado', programaId],
    queryFn: () =>
      apiService
        .get<SorteoEstado>('postulaciones/sorteo/estado/', { params: { programa_id: programaId } })
        .then(r => r.data),
    enabled: !!programaId,
  });

  const { data: elegibles = [], isLoading: loadingElegibles } = useQuery<Elegible[]>({
    queryKey: ['sorteo-elegibles', programaId],
    queryFn: () =>
      apiService
        .get<Elegible[]>('postulaciones/sorteo/elegibles/', { params: { programa_id: programaId } })
        .then(r => r.data),
    enabled: !!programaId && estado !== undefined && !estado.sorteo_realizado && etapa1Finalizada,
  });

  const { data: resultadosPrevios, isLoading: loadingResultados } = useQuery<SorteoResultado>({
    queryKey: ['sorteo-resultados', programaId],
    queryFn: () =>
      apiService
        .get<SorteoResultado>('postulaciones/sorteo/resultados/', { params: { programa_id: programaId } })
        .then(r => r.data),
    enabled: !!programaId && estado?.sorteo_realizado === true && resultado === null,
  });

  // ── Mutation ────────────────────────────────────────────────────────── //

  const ejecutarMutation = useMutation({
    mutationFn: () =>
      apiService
        .post<SorteoResultado>('postulaciones/sorteo/ejecutar/', {
          programa_id: Number(programaId),
          cantidad_beneficiarios: cantidad,
        })
        .then(r => r.data),
    onSuccess: (data) => {
      setResultado(data);
      setShowConfirm(false);
      void queryClient.invalidateQueries({ queryKey: ['sorteo-estado', programaId] });
      void queryClient.invalidateQueries({ queryKey: ['sorteo-elegibles', programaId] });
      void queryClient.invalidateQueries({ queryKey: ['postulantes-registro-hogar'] });
      void queryClient.invalidateQueries({ queryKey: ['programas'] });
      void queryClient.invalidateQueries({ queryKey: ['etapas'] });
    },
  });

  const handleEjecutar = useCallback(() => {
    ejecutarMutation.mutate();
  }, [ejecutarMutation]);

  // ── Derivados ───────────────────────────────────────────────────────── //

  const resultadoFinal = resultado ?? resultadosPrevios ?? null;
  const sorteoYaHecho = estado?.sorteo_realizado || resultado !== null;
  const totalElegibles = elegibles.length;

  // ── Render ──────────────────────────────────────────────────────────── //

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5 py-4">

      {/* ═══ Cabecera ═══ */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/programas/${programaId}`)}
          className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Programa #{programaId}</p>
          <h1 className="text-xl font-extrabold text-gray-900 leading-tight flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Sorteo de Beneficiarios
          </h1>
        </div>
      </div>

      {/* ═══ Loading ═══ */}
      {(loadingEstado || loadingElegibles || loadingResultados || loadingEtapas) && (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-6 w-6 text-amber-500" />
        </div>
      )}

      {/* ═══ Sorteo ya realizado (sin resultado local) ═══ */}
      {!loadingEstado && !loadingResultados && estado?.sorteo_realizado && !resultado && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-bold text-indigo-800 mb-1">Programa Culminado — Sorteo realizado</h2>
          <p className="text-sm text-indigo-700">
            El sorteo para este programa ya fue ejecutado. Se asignaron <strong>{estado.ya_sorteadas}</strong> postulaciones.
          </p>
        </div>
      )}

      {/* ═══ Etapa 1 no finalizada ═══ */}
      {!loadingEstado && !loadingEtapas && !sorteoYaHecho && !etapa1Finalizada && etapas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-800 mb-1">No se puede ejecutar el sorteo</h2>
              <p className="text-sm text-amber-700">
                Para ejecutar el sorteo, la <strong>Etapa 1 (Registro del Hogar)</strong> debe estar finalizada.
                Una vez finalizada, podrá sortear entre las postulaciones con estado <strong>Aprobada</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Sin elegibles ═══ */}
      {!loadingEstado && !loadingElegibles && !loadingEtapas && !sorteoYaHecho && etapa1Finalizada && totalElegibles === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-bold text-amber-800 mb-1">Sin postulaciones elegibles</h2>
          <p className="text-sm text-amber-700">
            No hay postulaciones con estado <strong>Aprobada</strong> para este programa.
            Asegúrese de que la revisión de la Etapa 1 esté completa.
          </p>
        </div>
      )}

      {/* ═══ Panel de sorteo (antes de ejecutar) ═══ */}
      {!loadingEstado && !loadingElegibles && !loadingEtapas && !sorteoYaHecho && etapa1Finalizada && totalElegibles > 0 && (
        <>
          {/* Advertencia */}
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold">Advertencia: el sorteo es irreversible</p>
              <p className="mt-1 text-xs text-red-700">
                Una vez ejecutado, el sorteo <strong>no se puede deshacer ni repetir</strong>. Se seleccionarán aleatoriamente
                los beneficiarios del total de postulaciones aprobadas. Asegúrese de que la Etapa 1 esté
                completa antes de proceder.
              </p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{totalElegibles}</p>
              <p className="text-xs text-gray-500 mt-1">Postulaciones elegibles</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 text-center">
                Beneficiarios a seleccionar
              </label>
              <input
                type="number"
                min={1}
                max={totalElegibles}
                value={cantidad}
                onChange={e => setCantidad(Math.max(1, Math.min(totalElegibles, Number(e.target.value) || 1)))}
                className="w-full text-center text-2xl font-bold text-emerald-600 border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-rose-600">{Math.max(0, totalElegibles - cantidad)}</p>
              <p className="text-xs text-gray-500 mt-1">No beneficiarios</p>
            </div>
          </div>

          {/* Lista de elegibles */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Postulaciones elegibles ({totalElegibles})
              </h3>
              <span className="text-xs text-gray-400">Estado: Aprobada</span>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {elegibles.map((e, i) => (
                <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{e.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {e.documento && <span>{e.documento} · </span>}
                      Rad. {e.numero_radicado}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                    Aprobada
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Botón ejecutar */}
          <div className="flex justify-center">
            <button
              type="button"
              disabled={ejecutarMutation.isPending}
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-8 py-3 text-base font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Ejecutar Sorteo
            </button>
          </div>
        </>
      )}

      {/* ═══ Resultado del sorteo ═══ */}
      {resultadoFinal && (
        <>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <h2 className="text-lg font-bold text-emerald-800 mb-1">
              {resultado ? '¡Sorteo realizado exitosamente!' : 'Resultados del sorteo'}
            </h2>
            <p className="text-sm text-emerald-700">
              Se sortearon <strong>{resultadoFinal.total_elegibles}</strong> postulaciones:
              <strong className="text-emerald-800"> {resultadoFinal.total_beneficiados}</strong> beneficiados y
              <strong className="text-rose-700"> {resultadoFinal.total_no_beneficiarios}</strong> no beneficiarios.
            </p>
          </div>

          {/* Tabs resultado */}
          <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setTabResultado('beneficiados')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                tabResultado === 'beneficiados'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Beneficiados ({resultadoFinal.total_beneficiados})
            </button>
            <button
              type="button"
              onClick={() => setTabResultado('no_beneficiarios')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                tabResultado === 'no_beneficiarios'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No beneficiarios ({resultadoFinal.total_no_beneficiarios})
            </button>
          </div>

          {/* Lista de resultado */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
              {(tabResultado === 'beneficiados' ? resultadoFinal.beneficiados : resultadoFinal.no_beneficiarios).map((r, i) => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    tabResultado === 'beneficiados'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.nombre}</p>
                    <p className="text-xs text-gray-500">Rad. {r.numero_radicado}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    tabResultado === 'beneficiados'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {tabResultado === 'beneficiados' ? 'Beneficiado' : 'No beneficiario'}
                  </span>
                </div>
              ))}
              {(tabResultado === 'beneficiados' ? resultadoFinal.beneficiados : resultadoFinal.no_beneficiarios).length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No hay registros en esta categoría.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ═══ Modal de confirmación ═══ */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            <div className="bg-red-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Confirmar Sorteo
              </h3>
            </div>
            <div className="px-6 py-5">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 font-semibold mb-2">⚠️ Esta acción es IRREVERSIBLE</p>
                <ul className="text-xs text-red-700 space-y-1">
                  <li>• Se sortearán <strong>{totalElegibles}</strong> postulaciones</li>
                  <li>• <strong>{cantidad}</strong> serán marcadas como <span className="font-semibold text-emerald-700">Beneficiado</span></li>
                  <li>• <strong>{totalElegibles - cantidad}</strong> serán marcadas como <span className="font-semibold text-rose-700">No Beneficiario</span></li>
                  <li>• El sorteo <strong>NO se puede deshacer ni repetir</strong></li>
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                ¿Está completamente seguro de ejecutar el sorteo con estos parámetros?
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={ejecutarMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleEjecutar}
                disabled={ejecutarMutation.isPending}
                className="px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {ejecutarMutation.isPending ? (
                  <>
                    <Spinner className="h-4 w-4 text-white" />
                    Ejecutando sorteo...
                  </>
                ) : (
                  'Sí, ejecutar sorteo'
                )}
              </button>
            </div>

            {/* Error */}
            {ejecutarMutation.isError && (
              <div className="px-6 pb-4">
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
                  {(ejecutarMutation.error as any)?.response?.data?.detail ?? 'Error al ejecutar el sorteo.'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
