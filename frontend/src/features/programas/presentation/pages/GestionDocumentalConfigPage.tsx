/**
 * GestionDocumentalConfigPage – Configuración de la etapa 3 (Gestión Documental Interna).
 *
 * Vista del gestor/admin:
 *  1. Configura qué campos son obligatorios/activos (toggles por campo).
 *  2. Activar / Inhabilitar la gestión documental para los funcionarios.
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { etapaRepository } from '../../infrastructure/persistence/axios-etapa-repository';
import { etapasQueryKey } from '../hooks/useEtapas';
import { useConfigCamposGestionDocumental } from '../hooks/useConfigCamposGestionDocumental';
import { SeccionCard } from '../components/registro-hogar/config/SeccionCard';
import { SECCIONES_GESTION } from '../components/gestion-documental/config/secciones-data-gestion';

// ── Página principal ──────────────────────────────────────────────────────── //

export const GestionDocumentalConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: programaId, etapaId } = useParams<{ id: string; etapaId: string }>();

  // Datos de la etapa
  const { data: etapas, isLoading: isLoadingEtapas } = useQuery({
    queryKey: etapasQueryKey(programaId!),
    queryFn: () => etapaRepository.listarPorPrograma(programaId!),
    enabled: !!programaId,
  });

  const etapa = etapas?.find(e => String(e.id) === etapaId);
  const isPublicado = etapa?.gestion_documental_publicado === true;

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
  } = useConfigCamposGestionDocumental(etapaId);

  if (isLoadingEtapas || isLoadingConfig || !etapa) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <svg className="animate-spin h-7 w-7 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 py-4">

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
              Etapa {etapa.numero_etapa} — Gestión Documental Interna
            </p>
            <h1 className="text-xl font-extrabold text-gray-900 leading-tight">
              Configuración del formulario
            </h1>
          </div>
        </div>
        <span className={`flex-shrink-0 mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${isPublicado ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {isPublicado ? 'Activada' : 'Sin activar'}
        </span>
      </div>

      {/* Banner error */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      {/* Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-purple-700">
        El formulario tiene <strong>{SECCIONES_GESTION.length} secciones</strong>. Expanda cada sección para
        configurar qué campos son <strong>obligatorios</strong> u opcionales y cuáles están <strong>activos</strong>.
        Guarde antes de activar la etapa. Una vez activada, los funcionarios podrán gestionar los documentos
        de las postulaciones.
      </div>

      {/* Secciones configurables */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">Secciones del formulario</h2>
          {isDirty && (
            <span className="text-xs text-amber-600 font-medium">Cambios sin guardar</span>
          )}
        </div>
        {SECCIONES_GESTION.map(seccion => (
          <SeccionCard
            key={seccion.id}
            seccion={seccion}
            configCampos={configCampos}
            onConfigChange={updateCampo}
            readOnly={isSaving}
          />
        ))}
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
