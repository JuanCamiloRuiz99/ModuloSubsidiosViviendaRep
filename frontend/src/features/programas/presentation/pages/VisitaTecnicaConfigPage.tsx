/**
 * VisitaTecnicaConfigPage – Configuración de la etapa 2 (Visita Técnica).
 *
 * Vista del gestor/admin:
 *  1. Configura qué campos son obligatorios/activos (toggles por campo).
 *  2. Lista las visitas registradas para esta etapa.
 *  3. Publicar / Inhabilitar el acceso del técnico al formulario.
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { etapaRepository } from '../../infrastructure/persistence/axios-etapa-repository';
import { etapasQueryKey } from '../hooks/useEtapas';
import { useVisitasEtapa2 } from '../hooks/useVisitaEtapa2';
import { useConfigCamposVisitaTecnica } from '../hooks/useConfigCamposVisitaTecnica';
import { SeccionCard } from '../components/registro-hogar/config/SeccionCard';
import { SECCIONES_VISITA } from '../components/visita-tecnica/config/secciones-data-visita';

// ── Página principal ──────────────────────────────────────────────────────── //

export const VisitaTecnicaConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: programaId, etapaId } = useParams<{ id: string; etapaId: string }>();

  // Datos de la etapa
  const { data: etapas, isLoading: isLoadingEtapas } = useQuery({
    queryKey: etapasQueryKey(programaId!),
    queryFn: () => etapaRepository.listarPorPrograma(programaId!),
    enabled: !!programaId,
  });

  const etapa = etapas?.find(e => String(e.id) === etapaId);
  const isPublicado = etapa?.visita_tecnica_publicado === true;

  // Configuración de campos
  const {
    configCampos,
    isLoading: isLoadingConfig,
    isSaving,
    saveError,
    isDirty,
    updateCampo,
    saveConfig,
    resetConfig,
  } = useConfigCamposVisitaTecnica(etapaId);

  const queryClient = useQueryClient();

  const publicarMutation = useMutation({
    mutationFn: () => etapaRepository.publicarVisitaTecnica(Number(etapaId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: etapasQueryKey(programaId!) }),
  });

  const inhabilitarMutation = useMutation({
    mutationFn: () => etapaRepository.inhabilitarVisitaTecnica(Number(etapaId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: etapasQueryKey(programaId!) }),
  });

  // Lista de visitas de esta etapa
  const { data: visitas = [] } = useVisitasEtapa2(
    etapaId ? { etapa: Number(etapaId) } : undefined,
  );

  if (isLoadingEtapas || isLoadingConfig || !etapa) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <svg className="animate-spin h-7 w-7 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 py-4">

      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
              Etapa {etapa.numero_etapa} — Visita Técnica
            </p>
            <h1 className="text-xl font-extrabold text-gray-900 leading-tight">
              Configuración del formulario
            </h1>
          </div>
        </div>
        <span className={`flex-shrink-0 mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${isPublicado ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {isPublicado ? 'Publicada' : 'Sin publicar'}
        </span>
      </div>

      {/* Banner error */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
        El formulario tiene <strong>{SECCIONES_VISITA.length} secciones</strong>. Expanda cada sección para
        configurar qué campos son <strong>obligatorios</strong> u opcionales y cuáles están <strong>activos</strong>.
        Guarde antes de publicar. Una vez publicada, los técnicos con visitas asignadas podrán acceder
        desde <strong>Mis Visitas</strong>.
      </div>

      {/* Secciones configurables */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">Secciones del formulario</h2>
          {isDirty && (
            <span className="text-xs text-amber-600 font-medium">Cambios sin guardar</span>
          )}
        </div>
        {SECCIONES_VISITA.map(seccion => (
          <SeccionCard
            key={seccion.id}
            seccion={seccion}
            configCampos={configCampos}
            onConfigChange={updateCampo}
            readOnly={isSaving || isPublicado}
          />
        ))}
      </section>

      {/* Resumen de visitas */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-800">Visitas registradas</h2>
          {visitas.length > 0 && (
            <button
              onClick={() => navigate(`/programas/${programaId}/etapas/${etapaId}/visitas-registradas`)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
            >
              Ver todas
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        {visitas.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-gray-500 font-medium text-sm">No hay visitas registradas aún</p>
            <p className="text-gray-400 text-xs mt-1">
              Las visitas se crean desde el módulo de gestión de visitas cuando se asignan a técnicos.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs">ID</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs">Encuestador</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs">Fecha</th>
                    <th className="text-center px-4 py-2.5 font-semibold text-gray-600 text-xs">Efectiva</th>
                    <th className="text-center px-4 py-2.5 font-semibold text-gray-600 text-xs">Datos Hogar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visitas.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-900 font-mono text-xs">#{v.id}</td>
                      <td className="px-4 py-2.5 text-gray-700">{v.encuestador_nombre}</td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {new Date(v.fecha_visita).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.visita_efectiva ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {v.visita_efectiva ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {v.tiene_datos_hogar ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Completado</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
              {visitas.length} visita{visitas.length !== 1 ? 's' : ''} registrada{visitas.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </section>

      {/* Barra de acciones */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-200 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!isDirty || isSaving}
            onClick={saveConfig}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-colors"
          >
            {isSaving ? 'Guardando...' : 'Guardar configuración'}
          </button>
          {isDirty && (
            <button
              type="button"
              disabled={isSaving}
              onClick={resetConfig}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              Descartar
            </button>
          )}
          {!isDirty && !isPublicado && (
            <button
              type="button"
              disabled={publicarMutation.isPending}
              onClick={() => publicarMutation.mutate()}
              className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              {publicarMutation.isPending ? 'Publicando...' : 'Publicar'}
            </button>
          )}
          {isPublicado && (
            <button
              type="button"
              disabled={inhabilitarMutation.isPending}
              onClick={() => inhabilitarMutation.mutate()}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              {inhabilitarMutation.isPending ? 'Inhabilitando...' : 'Inhabilitar'}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Volver
        </button>
      </div>
    </div>
  );
};
