/**
 * PostulanteDetalleModal
 * Muestra el detalle completo de una postulación: datos del titular,
 * predio, ubicación y todos los miembros del hogar.
 */

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { usePostulanteDetalle } from '../hooks/use-postulantes';
import {
  ESTADO_STYLES,
  nombreCompleto,
  formatFechaLarga as fmtFecha,
  formatMoneda as fmtMoneda,
  fmtBool,
  fmt,
} from '../utils/postulante-ui';

// ── Sub-componentes ───────────────────────────────────────────────────────── //

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">
      {title}
    </h3>
    {children}
  </div>
);

const Field: React.FC<{ label: string; value: React.ReactNode; incorrect?: boolean }> = ({ label, value, incorrect }) => (
  <div className={`rounded-lg p-2 -m-2 transition-colors ${incorrect ? 'bg-red-50' : ''}`}>
    <div className="flex items-center gap-1.5">
      <p className={`text-xs mb-0.5 ${incorrect ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>{label}</p>
      {incorrect && (
        <span className="text-[10px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide mb-0.5">
          Incorrecto
        </span>
      )}
    </div>
    <p className={`text-sm font-medium ${incorrect ? 'text-red-700' : 'text-gray-800'}`}>{value}</p>
  </div>
);

const Grid: React.FC<{ cols?: 2 | 3; children: React.ReactNode }> = ({ cols = 3, children }) => (
  <div className={`grid grid-cols-1 ${cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
    {children}
  </div>
);

// ── Componente principal ──────────────────────────────────────────────────── //

interface Props {
  id: number | null;
  isOpen: boolean;
  onClose: () => void;
  onEditClick: () => void;
}

export const PostulanteDetalleModal: React.FC<Props> = ({ id, isOpen, onClose, onEditClick }) => {
  const { detalle, isLoading, error } = usePostulanteDetalle(id);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl focus:outline-none">

          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <Dialog.Title className="text-lg font-bold text-gray-900">
                Detalle de Postulación
              </Dialog.Title>
              {detalle && (
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{detalle.numero_radicado}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {detalle && (
                <button
                  onClick={onEditClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
              )}
              <Dialog.Close
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none focus:outline-none"
                aria-label="Cerrar"
              >
                ×
              </Dialog.Close>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-sm">Cargando detalle...</span>
              </div>
            )}

            {/* Error */}
            {!isLoading && error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            {/* Contenido */}
            {!isLoading && detalle && (
              <>
                {/* Estado + programa */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${ESTADO_STYLES[detalle.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                    {detalle.estado_label}
                  </span>
                  <span className="text-sm text-gray-500">{fmt(detalle.programa_nombre)}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    Radicado: {fmtFecha(detalle.fecha_radicado)}
                  </span>
                </div>

                {/* Banner de revisión si hay campos marcados */}
                {detalle.campos_incorrectos.length > 0 && (
                  <div className="mb-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0}>
                        <path d="M3 21V4m0 0l8 3 6-3 4 2v10l-4-2-6 3-8-3V4z" />
                      </svg>
                      <p className="text-sm font-semibold text-red-700">
                        {detalle.campos_incorrectos.length} campo{detalle.campos_incorrectos.length !== 1 ? 's' : ''} marcado{detalle.campos_incorrectos.length !== 1 ? 's' : ''} como incorrecto{detalle.campos_incorrectos.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {detalle.campos_incorrectos.map(c => (
                        <span key={c} className="text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">
                          {c.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                    {detalle.observaciones_revision && (
                      <p className="mt-2 text-xs text-red-700 border-t border-red-200 pt-2">
                        <span className="font-semibold">Observaciones del revisor:</span> {detalle.observaciones_revision}
                      </p>
                    )}
                  </div>
                )}

                {/* Titular */}
                <Section title="Datos del titular">
                  <Grid cols={3}>
                    <Field label="Programa" value={fmt(detalle.programa_nombre)} />
                    <Field label="Nombre completo" value={
                      nombreCompleto(
                        detalle.ciudadano?.primer_nombre,
                        detalle.ciudadano?.segundo_nombre,
                        detalle.ciudadano?.primer_apellido,
                        detalle.ciudadano?.segundo_apellido,
                      )
                    } />
                    <Field label="Tipo de documento"   value={fmt(detalle.ciudadano?.tipo_documento_label)} />
                    <Field label="Número de documento" value={fmt(detalle.ciudadano?.numero_documento)} />
                    <Field label="Fecha de nacimiento" value={detalle.ciudadano?.fecha_nacimiento ? fmtFecha(detalle.ciudadano.fecha_nacimiento) : '—'} />
                    <Field label="Sexo"         value={fmt(detalle.ciudadano?.sexo)} />
                    <Field label="Nacionalidad" value={fmt(detalle.ciudadano?.nacionalidad)} />
                    <Field label="Teléfono"     value={fmt(detalle.ciudadano?.telefono)} />
                    <Field label="Correo electrónico" value={fmt(detalle.ciudadano?.correo_electronico)} />
                    <Field label="Municipio de nacimiento" value={
                      [detalle.ciudadano?.municipio_nacimiento, detalle.ciudadano?.departamento_nacimiento]
                        .filter(Boolean).join(', ') || '—'
                    } />
                  </Grid>
                </Section>

                {/* Ubicación */}
                <Section title="Ubicación del predio">
                  <Grid cols={3}>
                    <Field label="Departamento"  value={fmt(detalle.departamento)}  incorrect={detalle.campos_incorrectos.includes('departamento')} />
                    <Field label="Municipio"     value={fmt(detalle.municipio)}     incorrect={detalle.campos_incorrectos.includes('municipio')} />
                    <Field label="Zona"          value={fmt(detalle.zona_label)}    incorrect={detalle.campos_incorrectos.includes('zona')} />
                    <Field label="Tipo de predio" value={fmt(detalle.tipo_predio)}  incorrect={detalle.campos_incorrectos.includes('tipo_predio')} />
                    <Field label="Comuna"        value={fmt(detalle.comuna)}        incorrect={detalle.campos_incorrectos.includes('comuna')} />
                    <Field label="Barrio / Vereda" value={fmt(detalle.barrio_vereda)} incorrect={detalle.campos_incorrectos.includes('barrio_vereda')} />
                    <Field label="Dirección"     value={fmt(detalle.direccion)}     incorrect={detalle.campos_incorrectos.includes('direccion')} />
                    <Field label="Observaciones" value={fmt(detalle.observaciones_direccion)} incorrect={detalle.campos_incorrectos.includes('observaciones_direccion')} />
                  </Grid>
                </Section>

                {/* Predio */}
                <Section title="Información del predio">
                  <Grid cols={3}>
                    <Field label="Estrato"              value={fmt(detalle.estrato)}              incorrect={detalle.campos_incorrectos.includes('estrato')} />
                    <Field label="Es propietario"       value={fmtBool(detalle.es_propietario)}  incorrect={detalle.campos_incorrectos.includes('es_propietario')} />
                    <Field label="Número predial"       value={fmt(detalle.numero_predial)}       incorrect={detalle.campos_incorrectos.includes('numero_predial')} />
                    <Field label="Matrícula inmobiliaria" value={fmt(detalle.matricula_inmobiliaria)} incorrect={detalle.campos_incorrectos.includes('matricula_inmobiliaria')} />
                    <Field label="Avalúo catastral"     value={fmt(detalle.avaluo_catastral)} />
                    <Field label="Tiempo de residencia" value={fmt(detalle.tiempo_residencia)}   incorrect={detalle.campos_incorrectos.includes('tiempo_residencia')} />
                    <Field label="Matrícula agua"       value={fmt(detalle.numero_matricula_agua)} />
                    <Field label="Contrato energía"     value={fmt(detalle.numero_contrato_energia)} />
                    <Field label="Tiene dependientes"   value={fmtBool(detalle.tiene_dependientes)} incorrect={detalle.campos_incorrectos.includes('tiene_dependientes')} />
                    <Field label="Personas con discapacidad en el hogar" value={fmtBool(detalle.personas_con_discapacidad_hogar)} />
                  </Grid>
                </Section>

                {/* Miembros del hogar */}
                <Section title={`Miembros del hogar (${detalle.miembros.length})`}>
                  {detalle.miembros.length === 0 ? (
                    <p className="text-sm text-gray-400">Sin miembros registrados</p>
                  ) : (
                    <div className="space-y-4">
                      {detalle.miembros.map((m, idx) => (
                        <div key={m.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                              #{idx + 1}
                            </span>
                            <span className="text-sm font-semibold text-gray-800">
                              {nombreCompleto(m.primer_nombre, m.segundo_nombre, m.primer_apellido, m.segundo_apellido)}
                            </span>
                            {m.es_cabeza_hogar && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                Cabeza de hogar
                              </span>
                            )}
                          </div>
                          <Grid cols={3}>
                            <Field label="Documento"      value={`${m.tipo_documento_label}: ${m.numero_documento}`} />
                            <Field label="Nacimiento"     value={fmtFecha(m.fecha_nacimiento)} />
                            <Field label="Parentesco"     value={fmt(m.parentesco)} />
                            <Field label="Nivel educativo" value={fmt(m.nivel_educativo)} />
                            <Field label="Situación laboral" value={fmt(m.situacion_laboral)} />
                            <Field label="Ingresos mensuales" value={fmtMoneda(m.ingresos_mensuales)} />
                            <Field label="SISBEN"  value={m.pertenece_sisben ? `Grupo ${m.grupo_sisben || '—'}` : 'No'} />
                            <Field label="Discapacidad"     value={fmtBool(m.tiene_discapacidad)} />
                            <Field label="Víctima conflicto" value={fmtBool(m.es_victima_conflicto)} />
                          </Grid>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                <Section title={`Documentos de la postulación (${detalle.documentos_hogar.length})`}>
                  {detalle.documentos_hogar.length === 0 ? (
                    <p className="text-sm text-gray-400">No hay documentos cargados.</p>
                  ) : (
                    <div className="space-y-2">
                      {detalle.documentos_hogar.map((doc) => (
                        <div key={doc.id} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-semibold text-gray-800">{doc.tipo_documento_label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{fmt(doc.ruta_archivo)}</p>
                          {doc.archivo_url ? (
                            <a
                              href={doc.archivo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex mt-1 text-xs font-medium text-blue-700 hover:text-blue-900"
                            >
                              Ver documento
                            </a>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-end">
            <Dialog.Close
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </Dialog.Close>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
