/**
 * VisitaInfoModal – Muestra la información de una visita técnica
 * asociada a una postulación.
 */

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { visitaEtapa2Repository } from '../../../programas/infrastructure/persistence/axios-visita-etapa2-repository';
import type { VisitaEtapa2Detail } from '../../../programas/infrastructure/persistence/axios-visita-etapa2-repository';

interface Props {
  visitaId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">
      {title}
    </h3>
    {children}
  </div>
);

const CALIDAD_TENENCIA_LABELS: Record<string, string> = {
  PROPIETARIO: 'Propietario',
  ARRENDATARIO: 'Arrendatario',
  POSEEDOR: 'Poseedor',
  OCUPANTE: 'Ocupante',
  '': '—',
};

const USO_INMUEBLE_LABELS: Record<string, string> = {
  VIVIENDA: 'Vivienda',
  COMERCIO: 'Comercio',
  MIXTO: 'Mixto',
  '': '—',
};

const fmtBool = (v: boolean | null | undefined) =>
  v === true ? 'Sí' : v === false ? 'No' : '—';

export const VisitaInfoModal: React.FC<Props> = ({ visitaId, isOpen, onClose }) => {
  const { data: visita, isLoading, error } = useQuery<VisitaEtapa2Detail>({
    queryKey: ['visita-etapa2-info', visitaId],
    queryFn: () => visitaEtapa2Repository.obtener(visitaId!),
    enabled: !!visitaId && isOpen,
  });

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50 p-0">

          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <Dialog.Title className="text-lg font-bold text-gray-900">
              Información de la Visita Técnica
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-full p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          <div className="px-6 py-5">

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
                <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-sm">Cargando información de la visita...</span>
              </div>
            )}

            {/* Error */}
            {!isLoading && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                Error al cargar la información de la visita.
              </div>
            )}

            {/* Contenido */}
            {!isLoading && visita && (
              <>
                {/* Datos generales de la visita */}
                <Section title="Datos de la visita">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Radicado" value={visita.postulacion_radicado} />
                    <Field label="Encuestador" value={visita.encuestador_nombre} />
                    <Field label="Fecha de visita" value={new Date(visita.fecha_visita).toLocaleDateString('es-CO')} />
                    <Field
                      label="Visita efectiva"
                      value={
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          visita.visita_efectiva
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {visita.visita_efectiva ? 'Sí' : 'No'}
                        </span>
                      }
                    />
                    {!visita.visita_efectiva && visita.motivo_no_efectiva && (
                      <Field label="Motivo no efectiva" value={visita.motivo_no_efectiva} />
                    )}
                    <Field label="Nombre encuestado" value={visita.nombre_encuestado} />
                    <Field label="Teléfono contacto" value={visita.telefono_contacto} />
                  </div>
                  {visita.observaciones_generales && (
                    <div className="mt-3">
                      <Field label="Observaciones generales" value={visita.observaciones_generales} />
                    </div>
                  )}
                </Section>

                {/* Datos del hogar */}
                {visita.datos_hogar && (
                  <>
                    <Section title="Información del predio">
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Calidad de tenencia" value={CALIDAD_TENENCIA_LABELS[visita.datos_hogar.calidad_tenencia] ?? visita.datos_hogar.calidad_tenencia} />
                        <Field label="Uso del inmueble" value={USO_INMUEBLE_LABELS[visita.datos_hogar.uso_inmueble] ?? visita.datos_hogar.uso_inmueble} />
                        <Field label="Tiene escrituras" value={fmtBool(visita.datos_hogar.tiene_escrituras)} />
                        <Field label="Certificado libertad" value={fmtBool(visita.datos_hogar.tiene_certificado_libertad)} />
                        <Field label="N.° habitaciones" value={visita.datos_hogar.numero_habitaciones ?? '—'} />
                        <Field label="Rango ingresos hogar" value={visita.datos_hogar.rango_ingresos_hogar || '—'} />
                      </div>
                    </Section>

                    <Section title="Materiales de la vivienda">
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Material pisos" value={visita.datos_hogar.material_pisos || '—'} />
                        <Field label="Material paredes" value={visita.datos_hogar.material_paredes || '—'} />
                      </div>
                    </Section>

                    <Section title="Servicios públicos">
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Agua" value={fmtBool(visita.datos_hogar.tiene_agua)} />
                        <Field label="Energía" value={fmtBool(visita.datos_hogar.tiene_energia)} />
                        <Field label="Gas" value={fmtBool(visita.datos_hogar.tiene_gas)} />
                        <Field label="Alcantarillado" value={fmtBool(visita.datos_hogar.tiene_alcantarillado)} />
                      </div>
                    </Section>

                    <Section title="Condiciones sociales y riesgos">
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Adultos mayores" value={fmtBool(visita.datos_hogar.hay_adultos_mayores)} />
                        <Field label="Personas con discapacidad" value={fmtBool(visita.datos_hogar.hay_personas_discapacidad)} />
                        <Field label="Madre cabeza de hogar" value={fmtBool(visita.datos_hogar.hay_madre_cabeza_hogar)} />
                        <Field label="Víctimas del conflicto" value={fmtBool(visita.datos_hogar.hay_victimas_conflicto)} />
                        <Field label="Riesgo inundación" value={fmtBool(visita.datos_hogar.riesgo_inundacion)} />
                        <Field label="Riesgo deslizamiento" value={fmtBool(visita.datos_hogar.riesgo_deslizamiento)} />
                        <Field label="Riesgo estructural" value={fmtBool(visita.datos_hogar.riesgo_estructural)} />
                        <Field label="Percepción seguridad" value={visita.datos_hogar.percepcion_seguridad || '—'} />
                      </div>
                    </Section>
                  </>
                )}

                {/* Documentos */}
                {visita.documentos && visita.documentos.length > 0 && (
                  <Section title="Documentos adjuntos">
                    <div className="space-y-2">
                      {visita.documentos.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{doc.nombre_archivo}</p>
                            <p className="text-xs text-gray-400">{doc.tipo_documento}</p>
                          </div>
                          {doc.ruta_archivo && (
                            <a
                              href={doc.ruta_archivo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                              Descargar
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
