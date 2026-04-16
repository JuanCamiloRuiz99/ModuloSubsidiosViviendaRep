/**
 * DescargarDocumentosModal – Modal para seleccionar qué tipos de documentos
 * descargar de las postulaciones seleccionadas.
 */

import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useDescargarDocumentos } from '../hooks/use-descargar-documentos';
import type { TiposDocumentoSeleccion } from '../hooks/use-descargar-documentos';

// ── Catálogo de tipos por categoría ─────────────────────────────────────── //

interface TipoDoc { value: string; label: string }

/**
 * Documentos del HOGAR (compartidos por todos los miembros).
 * Coinciden con DocumentoGestionHogar.TIPO_CHOICES en el backend.
 */
const TIPOS_HOGAR: TipoDoc[] = [
  { value: 'RECIBO_PREDIAL',                 label: 'Recibo predial' },
  { value: 'CERTIFICADO_TRADICION_LIBERTAD', label: 'Certificado de tradición y libertad' },
  { value: 'ESCRITURA_PUBLICA_PREDIO',       label: 'Escritura pública del predio' },
  { value: 'RECIBO_SERVICIOS_PUBLICOS',      label: 'Recibo de servicios públicos' },
  { value: 'DECLARACION_JURAMENTADA',        label: 'Declaración juramentada' },
  { value: 'CERTIFICADO_RESIDENCIA',         label: 'Certificado de residencia' },
  { value: 'OTRO',                           label: 'Otros' },
];

/**
 * Documentos por MIEMBRO individual del hogar.
 * Coinciden con DocumentoMiembroHogar.TIPO_CHOICES en el backend.
 */
const TIPOS_MIEMBRO: TipoDoc[] = [
  { value: 'FOTO_CEDULA_FRENTE',       label: 'Foto cédula frente' },
  { value: 'FOTO_CEDULA_REVERSO',      label: 'Foto cédula reverso' },
  { value: 'REGISTRO_CIVIL',           label: 'Registro civil' },
  { value: 'TARJETA_IDENTIDAD',        label: 'Tarjeta de identidad' },
  { value: 'CERTIFICADO_SISBEN',       label: 'Certificado SISBEN' },
  { value: 'CERTIFICADO_DISCAPACIDAD', label: 'Certificado de discapacidad' },
  { value: 'CERTIFICADO_VICTIMA',      label: 'Certificado de víctima' },
  { value: 'OTRO',                     label: 'Otros' },
];

const TIPOS_VISITA: TipoDoc[] = [
  { value: 'RECIBO_PREDIAL',                 label: 'Recibo predial' },
  { value: 'CERTIFICADO_TRADICION_LIBERTAD', label: 'Certificado de tradición y libertad' },
  { value: 'ESCRITURA_PUBLICA',              label: 'Escritura pública' },
  { value: 'CONTRATO_ARRENDAMIENTO',         label: 'Contrato de arrendamiento' },
  { value: 'RECIBO_AGUA',                    label: 'Recibo de agua' },
  { value: 'RECIBO_ENERGIA',                 label: 'Recibo de energía' },
  { value: 'RECIBO_GAS',                     label: 'Recibo de gas' },
  { value: 'FOTO_VISITA',                    label: 'Foto de la visita' },
  { value: 'INFORME_TECNICO',                label: 'Informe técnico' },
  { value: 'ACTA_VISITA',                    label: 'Acta de visita' },
  { value: 'OTRO',                           label: 'Otros' },
];

const TIPOS_PROCESO: TipoDoc[] = [
  { value: 'ACTA_VISITA_TECNICA',             label: 'Acta de visita técnica' },
  { value: 'FORMULARIO_UNICO_NACIONAL',       label: 'Formulario único nacional' },
  { value: 'RADICADO_CURADURIA',              label: 'Radicado de curaduría' },
  { value: 'EXPENSA_RADICACION_INICIAL',      label: 'Expensa radicación inicial' },
  { value: 'EXPENSA_LICENCIA_FINAL',          label: 'Expensa licencia final' },
  { value: 'PODER_AUTENTICADO',               label: 'Poder autenticado' },
  { value: 'INFORME_TECNICO_VALIDACION',      label: 'Informe técnico de validación' },
  { value: 'APROBACION_MINVIVIENDA',          label: 'Aprobación MinVivienda' },
  { value: 'OFICIO_CONSTRUCTOR',              label: 'Oficio del constructor' },
  { value: 'TARJETA_PROFESIONAL_CONSTRUCTOR', label: 'Tarjeta profesional constructor' },
  { value: 'CERTIFICACION_EXPERIENCIA',       label: 'Certificación de experiencia' },
  { value: 'PLANOS_LEVANTAMIENTO_PDF',        label: 'Planos de levantamiento (PDF)' },
  { value: 'PLANOS_LEVANTAMIENTO_DWG',        label: 'Planos de levantamiento (DWG)' },
  { value: 'PLANOS_ARQUITECTONICOS_PDF',      label: 'Planos arquitectónicos (PDF)' },
  { value: 'PLANOS_ARQUITECTONICOS_DWG',      label: 'Planos arquitectónicos (DWG)' },
  { value: 'PLANOS_ESTRUCTURALES_PDF',        label: 'Planos estructurales (PDF)' },
  { value: 'PLANOS_ESTRUCTURALES_DWG',        label: 'Planos estructurales (DWG)' },
  { value: 'FOTO_VALLA_CURADURIA',            label: 'Foto de valla de curaduría' },
  { value: 'PRESUPUESTO_PDF',                 label: 'Presupuesto de obra (PDF)' },
  { value: 'PRESUPUESTO_XLSX',                label: 'Presupuesto de obra (Excel)' },
  { value: 'OFICIO_USO_SUELOS',               label: 'Oficio de uso de suelos' },
  { value: 'CONCEPTO_GESTION_RIESGO',         label: 'Concepto de gestión de riesgo' },
  { value: 'RIESGO_INUNDACION_REMOCION',      label: 'Riesgo inundación / remoción' },
  { value: 'CERTIFICACION_AGUA',              label: 'Certificación de agua' },
  { value: 'CERTIFICACION_ENERGIA',           label: 'Certificación de energía' },
];

interface Seccion {
  key: keyof TiposDocumentoSeleccion;
  titulo: string;
  tipos: TipoDoc[];
  /** Módulo de etapa requerido para habilitar esta sección. null = siempre habilitada */
  moduloEtapa: string | null;
}

const SECCIONES: Seccion[] = [
  { key: 'hogar',   titulo: 'Etapa 1 — Documentos del Hogar',     tipos: TIPOS_HOGAR,   moduloEtapa: null },
  { key: 'miembro', titulo: 'Etapa 1 — Documentos de Miembros',   tipos: TIPOS_MIEMBRO, moduloEtapa: null },
  { key: 'visita',  titulo: 'Etapa 2 — Visita Técnica',           tipos: TIPOS_VISITA,  moduloEtapa: 'VISITA_TECNICA' },
  { key: 'proceso', titulo: 'Etapa 3 — Gestión Documental',       tipos: TIPOS_PROCESO, moduloEtapa: 'GESTION_DOCUMENTAL' },
];

// ── Props ───────────────────────────────────────────────────────────────── //

interface Etapa {
  modulo_principal: string;
  finalizada: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  postulacionIds: number[];
  totalSeleccionadas: number;
  etapas?: Etapa[];
}

// ── Componente ──────────────────────────────────────────────────────────── //

export const DescargarDocumentosModal: React.FC<Props> = ({
  isOpen,
  onClose,
  postulacionIds,
  totalSeleccionadas,
  etapas = [],
}) => {
  const descargar = useDescargarDocumentos();

  /** Una sección se habilita si no requiere etapa o si su etapa está finalizada */
  const seccionHabilitada = (seccion: Seccion): boolean => {
    if (!seccion.moduloEtapa) return true;
    return etapas.some(e => e.modulo_principal === seccion.moduloEtapa && e.finalizada);
  };

  const [seleccion, setSeleccion] = useState<TiposDocumentoSeleccion>({
    hogar: [], miembro: [], visita: [], proceso: [],
  });
  const [expandida, setExpandida] = useState<string | null>('hogar');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalTipos = seleccion.hogar.length + seleccion.miembro.length +
    seleccion.visita.length + seleccion.proceso.length;

  const toggleTipo = (seccion: keyof TiposDocumentoSeleccion, valor: string) => {
    setSeleccion(prev => {
      const arr = prev[seccion];
      return {
        ...prev,
        [seccion]: arr.includes(valor) ? arr.filter(v => v !== valor) : [...arr, valor],
      };
    });
  };

  const toggleSeccion = (seccion: Seccion, todos: boolean) => {
    setSeleccion(prev => ({
      ...prev,
      [seccion.key]: todos ? seccion.tipos.map(t => t.value) : [],
    }));
  };

  const handleDescargar = () => {
    if (totalTipos === 0) {
      setErrorMsg('Seleccione al menos un tipo de documento.');
      return;
    }
    setErrorMsg(null);
    descargar.mutate(
      { postulacion_ids: postulacionIds, tipos_documento: seleccion },
      {
        onError: () => setErrorMsg('Error al generar la descarga. Intente nuevamente.'),
      },
    );
  };

  const handleClose = () => {
    if (!descargar.isPending) {
      setSeleccion({ hogar: [], miembro: [], visita: [], proceso: [] });
      setExpandida('hogar');
      setErrorMsg(null);
      descargar.reset();
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => { if (!open) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content aria-describedby={undefined} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">

          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-lg font-bold text-gray-900">Descargar documentos</Dialog.Title>
              <p className="text-sm text-gray-500 mt-0.5">
                {totalSeleccionadas} postulacion{totalSeleccionadas !== 1 ? 'es' : ''} seleccionada{totalSeleccionadas !== 1 ? 's' : ''}
              </p>
            </div>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Cerrar">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          {/* Body scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            <p className="text-sm text-gray-600 mb-2">
              Seleccione los tipos de documentos que desea descargar. Se obtendrán los
              mismos documentos para todas las postulaciones seleccionadas.
            </p>

            {SECCIONES.map(seccion => {
              const habilitada = seccionHabilitada(seccion);
              const isOpen = expandida === seccion.key && habilitada;
              const count = seleccion[seccion.key].length;
              const allSelected = count === seccion.tipos.length;

              return (
                <div key={seccion.key} className={`border rounded-lg overflow-hidden ${habilitada ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                  {/* Cabecera acordeón */}
                  <button
                    onClick={() => habilitada && setExpandida(isOpen ? null : seccion.key)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${habilitada ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer' : 'bg-gray-50 cursor-not-allowed'}`}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      <span className={`text-sm font-semibold ${habilitada ? 'text-gray-700' : 'text-gray-400'}`}>{seccion.titulo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!habilitada && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Etapa no finalizada
                        </span>
                      )}
                      {habilitada && count > 0 && (
                        <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {count} seleccionado{count !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Contenido */}
                  {isOpen && (
                    <div className="px-4 py-3 space-y-2">
                      {/* Seleccionar / deseleccionar todos */}
                      <label className="flex items-center gap-2 text-xs text-blue-600 font-medium cursor-pointer mb-1">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => toggleSeccion(seccion, !allSelected)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {seccion.tipos.map(tipo => (
                          <label
                            key={tipo.value}
                            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={seleccion[seccion.key].includes(tipo.value)}
                              onChange={() => toggleTipo(seccion.key, tipo.value)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{tipo.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {totalTipos > 0
                ? <span className="font-medium text-gray-700">{totalTipos} tipo{totalTipos !== 1 ? 's' : ''} de documento</span>
                : 'Ningún documento seleccionado'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                disabled={descargar.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDescargar}
                disabled={totalTipos === 0 || descargar.isPending}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
              >
                {descargar.isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Generando ZIP...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mensajes */}
          {errorMsg && (
            <div className="mx-6 mb-4 px-4 py-2 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          {descargar.isSuccess && (
            <div className="mx-6 mb-4 px-4 py-2 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
              Descarga completada exitosamente.
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
