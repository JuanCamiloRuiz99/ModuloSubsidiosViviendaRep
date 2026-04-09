/**
 * RegistroHogarConfigPage - Vista de configuracion para etapas de tipo REGISTRO_HOGAR.
 *
 * Permite al gestor:
 *  1. Ver/expandir las cuatro secciones del wizard publico.
 *  2. Configurar que campos son obligatorios u opcionales (toggles por campo).
 *  3. Publicar / inhabilitar el acceso ciudadano al formulario.
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { etapaRepository } from '../../infrastructure/persistence/axios-etapa-repository';
import { etapasQueryKey } from '../hooks/useEtapas';
import { useConfigCamposRegistroHogar } from '../hooks/useConfigCamposRegistroHogar';
import { SeccionCard } from '../components/registro-hogar/config/SeccionCard';
import { SECCIONES } from '../components/registro-hogar/config/secciones-data';

export const RegistroHogarConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: programaId, etapaId } = useParams<{ id: string; etapaId: string }>();

  const { data: etapas, isLoading } = useQuery({
    queryKey: etapasQueryKey(programaId!),
    queryFn: () => etapaRepository.listarPorPrograma(programaId!),
    enabled: !!programaId,
  });

  const etapa = etapas?.find(e => String(e.id) === etapaId);
  const isPublicado = etapa?.registro_hogar_publicado === true;

  const {
    configCampos,
    isLoading: isLoadingConfig,
    isSaving,
    saveError,
    isDirty,
    updateCampo,
    saveConfig,
    resetConfig,
  } = useConfigCamposRegistroHogar(etapaId);

  const queryClient = useQueryClient();

  const publicarMutation = useMutation({
    mutationFn: () => etapaRepository.publicarRegistroHogar(Number(etapaId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: etapasQueryKey(programaId!) }),
  });

  const inhabilitarMutation = useMutation({
    mutationFn: () => etapaRepository.inhabilitarRegistroHogar(Number(etapaId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: etapasQueryKey(programaId!) }),
  });



  if (isLoading || isLoadingConfig || !etapa) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <svg className="animate-spin h-7 w-7 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  const urlPublica = `/registro-hogar/${etapaId}`;

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
              Etapa {etapa.numero_etapa} - Registro del Hogar
            </p>
            <h1 className="text-xl font-extrabold text-gray-900 leading-tight">
              Configuracion del formulario
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
        El formulario tiene <strong>4 secciones predefinidas</strong>. Expanda cada seccion para
        configurar que campos son <strong>obligatorios</strong> u opcionales. Guarde antes de publicar.
      </div>

      {/* Secciones */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">Secciones del formulario</h2>
          {isDirty && (
            <span className="text-xs text-amber-600 font-medium">Cambios sin guardar</span>
          )}
        </div>
        {SECCIONES.map(seccion => (
          <SeccionCard
            key={seccion.id}
            seccion={seccion}
            configCampos={configCampos}
            onConfigChange={updateCampo}
            readOnly={isSaving || isPublicado}
          />
        ))}
      </section>

      {/* URL publica */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs text-gray-500 font-medium">URL del formulario publico</p>
          <code className="text-sm text-gray-700 font-mono">{urlPublica}</code>
        </div>
        <a
          href={urlPublica}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors whitespace-nowrap"
        >
          {isPublicado ? 'Ver formulario' : 'Previsualizar'}
        </a>
      </div>

      {/* Barra de acciones */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-200 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!isDirty || isSaving}
            onClick={saveConfig}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-colors"
          >
            {isSaving ? 'Guardando...' : 'Guardar configuracion'}
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
