import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { EtapaData } from '../../infrastructure/persistence/axios-etapa-repository';
import { MODULO_CONFIG } from '../etapa-config';
import { useTogglePublicacionFormulario, useTerminarEtapa, useReactivarEtapa } from '../hooks';

interface EtapaCardProps {
  etapa: EtapaData;
  programaId: string | number;
  programaEstado?: string;
}

export const EtapaCard: React.FC<EtapaCardProps> = ({ etapa, programaId, programaEstado }) => {
  const isProgramaActivo = programaEstado === 'ACTIVO';
  const isProgramaCulminado = programaEstado === 'CULMINADO';
  const navigate = useNavigate();
  const cfg = MODULO_CONFIG[etapa.modulo_principal] ?? MODULO_CONFIG.REGISTRO_HOGAR;
  const isConfigurado =
    etapa.modulo_principal === 'REGISTRO_HOGAR' ||
    etapa.modulo_principal === 'VISITA_TECNICA' ||
    etapa.modulo_principal === 'GESTION_DOCUMENTAL_INTERNA' ||
    etapa.formulario_configurado;
  const isPublicado =
    etapa.formulario_estado === 'PUBLICADO' ||
    (etapa.modulo_principal === 'REGISTRO_HOGAR' && etapa.registro_hogar_publicado === true) ||
    (etapa.modulo_principal === 'VISITA_TECNICA' && etapa.visita_tecnica_publicado === true) ||
    (etapa.modulo_principal === 'GESTION_DOCUMENTAL_INTERNA' && etapa.gestion_documental_publicado === true);

  const { toggle, isToggling, error: toggleError } = useTogglePublicacionFormulario(programaId);
  const terminarMutation = useTerminarEtapa(programaId);
  const reactivarMutation = useReactivarEtapa(programaId);

  const handleTogglePublicacion = () => {
    if (!isToggling) toggle(etapa.id, isPublicado, etapa.modulo_principal);
  };

  const [showTerminarModal, setShowTerminarModal] = useState(false);

  const handleTerminarEtapa = () => {
    setShowTerminarModal(true);
  };

  const confirmarTerminar = () => {
    terminarMutation.mutate(etapa.id);
    setShowTerminarModal(false);
  };

  const handleReactivarEtapa = () => {
    if (window.confirm('La etapa ya finalizó, ¿seguro que desea volverla a reabrir?')) {
      reactivarMutation.mutate(etapa.id);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 border-2 ${etapa.finalizada ? 'border-red-400' : isPublicado ? 'border-green-300' : isConfigurado ? 'border-amber-200' : 'border-blue-200'}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${isPublicado ? 'bg-green-100' : isConfigurado ? 'bg-amber-100' : 'bg-blue-50'}`}>
            {isPublicado ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : isConfigurado ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900">
              Etapa {etapa.numero_etapa}: {cfg.label}
            </h4>
            <p className={`text-sm ${etapa.finalizada ? 'text-purple-600 font-medium' : isPublicado ? 'text-green-600 font-medium' : isConfigurado ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
              {etapa.finalizada ? 'Finalizada' : isPublicado ? (etapa.modulo_principal === 'GESTION_DOCUMENTAL_INTERNA' ? 'Activada' : 'Publicada') : isConfigurado ? 'Formulario configurado (borrador)' : 'Sin configurar'}
            </p>
          </div>
        </div>

        {etapa.finalizada ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Finalizada
          </span>
        ) : isPublicado ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {etapa.modulo_principal === 'GESTION_DOCUMENTAL_INTERNA' ? 'Activada' : 'Publicada'}
          </span>
        ) : isConfigurado ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Borrador
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Sin configurar
          </span>
        )}
      </div>

      <div className="border-t border-gray-100 mb-4" />

      {toggleError && (
        <p className="text-xs text-red-600 mb-3">{toggleError}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {!isProgramaCulminado && <button
          onClick={() => {
            const ruta = etapa.modulo_principal === 'REGISTRO_HOGAR'
              ? `/programas/${programaId}/etapas/${etapa.id}/registro-hogar`
              : etapa.modulo_principal === 'VISITA_TECNICA'
              ? `/programas/${programaId}/etapas/${etapa.id}/visita-tecnica`
              : etapa.modulo_principal === 'GESTION_DOCUMENTAL_INTERNA'
              ? `/programas/${programaId}/etapas/${etapa.id}/gestion-documental`
              : `/programas/${programaId}/etapas/${etapa.id}/formulario`;
            navigate(ruta);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {isConfigurado ? 'Editar Formulario' : 'Configurar Formulario'}
        </button>}

        {!isProgramaCulminado && isPublicado && etapa.modulo_principal === 'REGISTRO_HOGAR' && (
            <a
              href={`/registro-hogar/${etapa.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              title="Abrir el formulario público en una nueva pestaña"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver formulario
            </a>
        )}

        {!isProgramaCulminado && !etapa.finalizada && <button
          onClick={handleTogglePublicacion}
          disabled={!isConfigurado || isToggling || (!isProgramaActivo && !isPublicado)}
          title={
            !isProgramaActivo && !isPublicado
              ? 'No se puede publicar: el programa no está activo'
              : !isConfigurado
              ? 'Primero configura el formulario'
              : isPublicado
              ? etapa.modulo_principal === 'GESTION_DOCUMENTAL_INTERNA'
                ? 'Inhabilitar: desactivar la gestión documental interna'
                : 'Inhabilitar: quitar el acceso público al formulario'
              : etapa.modulo_principal === 'GESTION_DOCUMENTAL_INTERNA'
              ? 'Activar: habilitar la gestión documental para los funcionarios'
              : 'Publicar: hacer accesible el formulario al público'
          }
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${
            !isConfigurado || isToggling || (!isProgramaActivo && !isPublicado)
              ? 'opacity-50 cursor-not-allowed bg-gray-400'
              : isPublicado
              ? 'bg-amber-500 hover:bg-amber-600 cursor-pointer'
              : 'bg-green-500 hover:bg-green-600 cursor-pointer'
          }`}
        >
          {isToggling ? (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : isPublicado ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {isToggling ? 'Procesando...' : isPublicado
            ? (etapa.modulo_principal === 'GESTION_DOCUMENTAL_INTERNA' ? 'Inhabilitar gestión' : 'Inhabilitar formulario')
            : (etapa.modulo_principal === 'GESTION_DOCUMENTAL_INTERNA' ? 'Activar Etapa' : 'Publicar Etapa')}
        </button>}

        {/* Terminar Etapa: solo cuando programa ACTIVO, etapa publicada y NO finalizada */}
        {!isProgramaCulminado && isProgramaActivo && isPublicado && !etapa.finalizada && (
          <button
            onClick={handleTerminarEtapa}
            disabled={terminarMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Finalizar esta etapa"
          >
            {terminarMutation.isPending ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {terminarMutation.isPending ? 'Finalizando...' : 'Terminar Etapa'}
          </button>
        )}

        {/* Reactivar Etapa: solo cuando la etapa está finalizada y programa NO culminado */}
        {etapa.finalizada && !isProgramaCulminado && (
          <button
            onClick={handleReactivarEtapa}
            disabled={reactivarMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reactivar esta etapa"
          >
            {reactivarMutation.isPending ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {reactivarMutation.isPending ? 'Reactivando...' : 'Reactivar Etapa'}
          </button>
        )}

        {/* Sorteo: solo cuando GESTION_DOCUMENTAL_INTERNA está finalizada */}
        {etapa.finalizada && etapa.modulo_principal === 'GESTION_DOCUMENTAL_INTERNA' && (
          <button
            onClick={() => navigate(`/programas/${programaId}/sorteo`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition-colors cursor-pointer"
            title={isProgramaCulminado ? 'Ver resultados del sorteo' : 'Realizar sorteo de beneficiarios'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Sorteo
          </button>
        )}

        {/* Banner cuando programa está culminado */}
        {isProgramaCulminado && etapa.modulo_principal !== 'GESTION_DOCUMENTAL_INTERNA' && (
          <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200">
            Programa culminado
          </span>
        )}
      </div>

      {/* Modal de confirmación para Terminar Etapa */}
      {showTerminarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-red-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Terminar Etapa</h3>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700">
                  ¿Está seguro que desea terminar esta etapa? Una vez finalizada, no se podrán realizar cambios hasta que sea reactivada.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setShowTerminarModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarTerminar}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Sí, terminar etapa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
