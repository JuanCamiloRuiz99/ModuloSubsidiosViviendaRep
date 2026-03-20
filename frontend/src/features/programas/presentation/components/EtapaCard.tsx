import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { EtapaData } from '../../infrastructure/persistence/axios-etapa-repository';
import { MODULO_CONFIG } from '../etapa-config';
import { useTogglePublicacionFormulario } from '../hooks';

interface EtapaCardProps {
  etapa: EtapaData;
  programaId: string | number;
}

export const EtapaCard: React.FC<EtapaCardProps> = ({ etapa, programaId }) => {
  const navigate = useNavigate();
  const cfg = MODULO_CONFIG[etapa.modulo_principal] ?? MODULO_CONFIG.REGISTRO_HOGAR;
  const isConfigurado =
    etapa.modulo_principal === 'REGISTRO_HOGAR' ||
    etapa.modulo_principal === 'VISITA_TECNICA' ||
    etapa.formulario_configurado;
  const isPublicado =
    etapa.formulario_estado === 'PUBLICADO' ||
    (etapa.modulo_principal === 'REGISTRO_HOGAR' && etapa.registro_hogar_publicado === true);

  const { toggle, isToggling, error: toggleError } = useTogglePublicacionFormulario(programaId);

  const handleTogglePublicacion = () => {
    if (!isToggling) toggle(etapa.id, isPublicado, etapa.modulo_principal);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 border-2 ${isPublicado ? 'border-green-300' : isConfigurado ? 'border-amber-200' : 'border-blue-200'}`}>
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
            <p className={`text-sm ${isPublicado ? 'text-green-600 font-medium' : isConfigurado ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
              {isPublicado ? 'Publicada' : isConfigurado ? 'Formulario configurado (borrador)' : 'Sin configurar'}
            </p>
          </div>
        </div>

        {isPublicado ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Publicada
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
        <button
          onClick={() => {
            const ruta = etapa.modulo_principal === 'REGISTRO_HOGAR'
              ? `/programas/${programaId}/etapas/${etapa.id}/registro-hogar`
              : etapa.modulo_principal === 'VISITA_TECNICA'
              ? `/programas/${programaId}/etapas/${etapa.id}/visita-tecnica`
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
        </button>

        {isPublicado && (
          etapa.modulo_principal === 'VISITA_TECNICA' ? (
            <button
              onClick={() => navigate(`/programas/${programaId}/etapas/${etapa.id}/visita-tecnica`)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              title="Ver configuración y visitas registradas"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver visitas
            </button>
          ) : (
            <a
              href={etapa.modulo_principal === 'REGISTRO_HOGAR' ? `/registro-hogar/${etapa.id}` : `/formulario/${etapa.id}`}
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
          )
        )}

        <button
          onClick={handleTogglePublicacion}
          disabled={!isConfigurado || isToggling}
          title={
            !isConfigurado
              ? 'Primero configura el formulario'
              : isPublicado
              ? 'Inhabilitar: quitar el acceso público al formulario'
              : 'Publicar: hacer accesible el formulario al público'
          }
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${
            !isConfigurado || isToggling
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
          {isToggling ? 'Procesando...' : isPublicado ? 'Inhabilitar' : 'Publicar Etapa'}
        </button>
      </div>
    </div>
  );
};
