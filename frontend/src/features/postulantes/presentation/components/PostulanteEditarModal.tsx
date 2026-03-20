/**
 * PostulanteEditarModal
 *
 * Modal de revisión de una postulación.  Todos los datos son de solo lectura;
 * el revisor únicamente puede:
 *   1. Marcar campos como «incorrectos» (bandera roja).
 *   2. Agregar observaciones de revisión.
 *   3. Guardar (estado automático: Subsanación / Aprobada).
 *   4. Rechazar (abre confirmación con motivo).
 */

import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { PostulanteDetalle, ActualizarPostulanteData } from '../hooks/use-postulantes';
import { fmt, fmtBool } from '../utils/postulante-ui';

// ── Estilos base ──────────────────────────────────────────────────────────── //

const readOnlyCls  = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800';
const redReadOnlyCls = 'w-full px-3 py-2 text-sm rounded-lg border border-red-300 bg-red-50 text-red-800';

// ── Sub-componentes reutilizables ─────────────────────────────────────────── //

const FlagButton: React.FC<{
  campo: string;
  flagged: boolean;
  onToggle: (campo: string) => void;
}> = ({ campo, flagged, onToggle }) => (
  <button
    type="button"
    title={flagged ? 'Quitar marca de incorrecto' : 'Marcar como incorrecto'}
    onClick={() => onToggle(campo)}
    className={`flex-shrink-0 p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
      flagged
        ? 'bg-red-100 text-red-600 hover:bg-red-200 focus:ring-red-400'
        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:ring-gray-300'
    }`}
    aria-pressed={flagged}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill={flagged ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V4m0 0l8 3 6-3 4 2v10l-4-2-6 3-8-3V4z" />
    </svg>
  </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">
      {title}
    </h3>
    {children}
  </div>
);

const Grid2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
);

/** Campo de solo lectura con botón-bandera para marcarlo como incorrecto */
const ReviewField: React.FC<{
  label: string;
  campo: string;
  value: string;
  flagged: boolean;
  onToggle: (campo: string) => void;
  colSpan2?: boolean;
}> = ({ label, campo, value, flagged, onToggle, colSpan2 }) => (
  <div className={`rounded-lg p-2 -m-2 transition-colors ${flagged ? 'bg-red-50' : ''} ${colSpan2 ? 'sm:col-span-2' : ''}`}>
    <div className="flex items-center gap-1.5 mb-1">
      <span className={`flex-1 text-xs font-semibold ${flagged ? 'text-red-600' : 'text-gray-600'}`}>
        {label}
        {flagged && (
          <span className="ml-1.5 text-[10px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
            Incorrecto
          </span>
        )}
      </span>
      <FlagButton campo={campo} flagged={flagged} onToggle={onToggle} />
    </div>
    <div className={flagged ? redReadOnlyCls : readOnlyCls}>
      {value}
    </div>
  </div>
);

// ── Props ─────────────────────────────────────────────────────────────────── //

interface Props {
  detalle: PostulanteDetalle | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: ActualizarPostulanteData) => Promise<void>;
  isLoading: boolean;
  isDetalleLoading?: boolean;
  detalleError?: string | null;
}

// ── Componente principal ──────────────────────────────────────────────────── //

export const PostulanteEditarModal: React.FC<Props> = ({
  detalle,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  isDetalleLoading = false,
  detalleError = null,
}) => {
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [observaciones, setObservaciones] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  // Sincroniza estado local cuando cambia el detalle
  useEffect(() => {
    if (detalle) {
      setFlagged(new Set(detalle.campos_incorrectos ?? []));
      setObservaciones(detalle.observaciones_revision ?? '');
    }
  }, [detalle]);

  const toggleFlag = (campo: string) => {
    setFlagged(prev => {
      const next = new Set(prev);
      next.has(campo) ? next.delete(campo) : next.add(campo);
      return next;
    });
  };

  const isFlagged = (campo: string) => flagged.has(campo);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFlagged(new Set());
      setObservaciones('');
      setIsRejectOpen(false);
      setRejectNote('');
      onClose();
    }
  };

  const handleSave = async () => {
    if (!detalle) return;
    const estadoCalculado = flagged.size > 0 ? 'SUBSANACION' : 'APROBADA';
    await onSubmit(detalle.id, {
      estado: estadoCalculado,
      campos_incorrectos: Array.from(flagged),
      observaciones_revision: observaciones,
    });
  };

  const handleReject = async () => {
    if (!detalle) return;
    await onSubmit(detalle.id, {
      estado: 'RECHAZADA',
      campos_incorrectos: Array.from(flagged),
      observaciones_revision: rejectNote || 'Rechazado sin observación',
    });
    setIsRejectOpen(false);
    setRejectNote('');
  };

  const totalFlaggeados = flagged.size;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl focus:outline-none">

          {/* ── Header ── */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <Dialog.Title className="text-lg font-bold text-gray-900">
                Editar Postulación
              </Dialog.Title>
              <div className="flex items-center gap-3 mt-0.5">
                {detalle && (
                  <p className="text-xs text-gray-400 font-mono">{detalle.numero_radicado}</p>
                )}
                {totalFlaggeados > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0}>
                      <path d="M3 21V4m0 0l8 3 6-3 4 2v10l-4-2-6 3-8-3V4z" />
                    </svg>
                    {totalFlaggeados} campo{totalFlaggeados !== 1 ? 's' : ''} marcado{totalFlaggeados !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <Dialog.Close
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none focus:outline-none"
              aria-label="Cerrar"
            >
              &times;
            </Dialog.Close>
          </div>

          {/* ── Leyenda de uso ── */}
          <div className="mx-6 mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-xs text-amber-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Presiona el botón{' '}
              <svg xmlns="http://www.w3.org/2000/svg" className="inline h-3 w-3 mx-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V4m0 0l8 3 6-3 4 2v10l-4-2-6 3-8-3V4z" />
              </svg>{' '}
              junto a cada campo para marcarlo como <strong>incorrecto</strong>.
              Los campos marcados se guardan junto con las observaciones al presionar <strong>Guardar cambios</strong>.
            </span>
          </div>

          {/* ── Cuerpo ── */}
          {isDetalleLoading ? (
            <div className="px-6 py-10 flex items-center justify-center gap-3 text-gray-500">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-sm">Cargando detalle de la postulación...</span>
            </div>
          ) : detalleError ? (
            <div className="px-6 py-8">
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {detalleError}
              </div>
            </div>
          ) : !detalle ? (
            <div className="px-6 py-8">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                No se pudo cargar la información de la postulación para edición.
              </div>
            </div>
          ) : (
          <div>
            <div className="px-6 py-5">

              {/* Datos principales (solo lectura, sin flags) */}
              <Section title="Datos principales">
                <Grid2>
                  <div>
                    <span className="block text-xs font-semibold text-gray-600 mb-1">Programa</span>
                    <div className={readOnlyCls}>{fmt(detalle.programa_nombre)}</div>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-600 mb-1">Radicado</span>
                    <div className={`${readOnlyCls} font-mono`}>{fmt(detalle.numero_radicado)}</div>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-600 mb-1">Documentos de postulación</span>
                    <div className={readOnlyCls}>{detalle.documentos_hogar.length}</div>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-600 mb-1">Documentos de miembros</span>
                    <div className={readOnlyCls}>
                      {detalle.miembros.reduce((acc, m) => acc + (m.documentos?.length ?? 0), 0)}
                    </div>
                  </div>
                </Grid2>
              </Section>

              {/* Estado calculado */}
              <Section title="Estado de la postulación">
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-gray-800">
                    {flagged.size > 0 ? 'Subsanación' : 'Aprobada'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Se marca «Subsanación» si hay campos incorrectos; de lo contrario queda «Aprobada».
                    Para rechazar, usa el botón Rechazar.
                  </p>
                </div>
              </Section>

              {/* Ubicación */}
              <Section title="Ubicación">
                <Grid2>
                  <ReviewField label="Departamento"             campo="departamento"              value={fmt(detalle.departamento)}             flagged={isFlagged('departamento')}             onToggle={toggleFlag} />
                  <ReviewField label="Municipio"                campo="municipio"                 value={fmt(detalle.municipio)}                flagged={isFlagged('municipio')}                onToggle={toggleFlag} />
                  <ReviewField label="Zona"                     campo="zona"                      value={fmt(detalle.zona_label)}               flagged={isFlagged('zona')}                     onToggle={toggleFlag} />
                  <ReviewField label="Tipo de predio"           campo="tipo_predio"               value={fmt(detalle.tipo_predio)}              flagged={isFlagged('tipo_predio')}              onToggle={toggleFlag} />
                  <ReviewField label="Comuna"                   campo="comuna"                    value={fmt(detalle.comuna)}                   flagged={isFlagged('comuna')}                   onToggle={toggleFlag} />
                  <ReviewField label="Barrio / Vereda"          campo="barrio_vereda"             value={fmt(detalle.barrio_vereda)}            flagged={isFlagged('barrio_vereda')}            onToggle={toggleFlag} />
                  <ReviewField label="Dirección"                campo="direccion"                 value={fmt(detalle.direccion)}                flagged={isFlagged('direccion')}                onToggle={toggleFlag} colSpan2 />
                  <ReviewField label="Observaciones de dirección" campo="observaciones_direccion" value={fmt(detalle.observaciones_direccion)}  flagged={isFlagged('observaciones_direccion')}  onToggle={toggleFlag} colSpan2 />
                </Grid2>
              </Section>

              {/* Predio */}
              <Section title="Información del predio">
                <Grid2>
                  <ReviewField label="Estrato"                  campo="estrato"                           value={fmt(detalle.estrato)}                                   flagged={isFlagged('estrato')}                           onToggle={toggleFlag} />
                  <ReviewField label="Es propietario"           campo="es_propietario"                    value={fmtBool(detalle.es_propietario)}                        flagged={isFlagged('es_propietario')}                    onToggle={toggleFlag} />
                  <ReviewField label="Número predial"           campo="numero_predial"                    value={fmt(detalle.numero_predial)}                            flagged={isFlagged('numero_predial')}                    onToggle={toggleFlag} />
                  <ReviewField label="Matrícula inmobiliaria"   campo="matricula_inmobiliaria"            value={fmt(detalle.matricula_inmobiliaria)}                    flagged={isFlagged('matricula_inmobiliaria')}            onToggle={toggleFlag} />
                  <ReviewField label="Avalúo catastral"         campo="avaluo_catastral"                  value={fmt(detalle.avaluo_catastral)}                          flagged={isFlagged('avaluo_catastral')}                  onToggle={toggleFlag} />
                  <ReviewField label="Matrícula agua"           campo="numero_matricula_agua"             value={fmt(detalle.numero_matricula_agua)}                     flagged={isFlagged('numero_matricula_agua')}             onToggle={toggleFlag} />
                  <ReviewField label="Contrato energía"         campo="numero_contrato_energia"           value={fmt(detalle.numero_contrato_energia)}                   flagged={isFlagged('numero_contrato_energia')}           onToggle={toggleFlag} />
                  <ReviewField label="Tiempo de residencia"     campo="tiempo_residencia"                 value={fmt(detalle.tiempo_residencia)}                         flagged={isFlagged('tiempo_residencia')}                 onToggle={toggleFlag} />
                  <ReviewField label="Tiene dependientes"       campo="tiene_dependientes"                value={fmtBool(detalle.tiene_dependientes)}                    flagged={isFlagged('tiene_dependientes')}                onToggle={toggleFlag} />
                  <ReviewField label="Personas con discapacidad en hogar" campo="personas_con_discapacidad_hogar" value={fmtBool(detalle.personas_con_discapacidad_hogar)} flagged={isFlagged('personas_con_discapacidad_hogar')} onToggle={toggleFlag} />
                  <ReviewField label="Acepta términos y condiciones" campo="acepta_terminos_condiciones"  value={fmtBool(detalle.acepta_terminos_condiciones)}           flagged={isFlagged('acepta_terminos_condiciones')}      onToggle={toggleFlag} />
                </Grid2>
              </Section>

              {/* Documentos de la postulación */}
              <Section title={`Documentos subidos (${detalle.documentos_hogar.length})`}>
                {detalle.documentos_hogar.length > 0 ? (
                  <div className="space-y-2">
                    {detalle.documentos_hogar.map((doc) => (
                      <div key={doc.id} className="border border-gray-200 rounded-lg px-3 py-2">
                        <p className="text-sm font-semibold text-gray-800">{doc.tipo_documento_label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{doc.ruta_archivo || 'Sin ruta'}</p>
                        {doc.archivo_url && (
                          <a href={doc.archivo_url} target="_blank" rel="noreferrer" className="inline-flex mt-1 text-xs font-medium text-blue-700 hover:text-blue-900">
                            Ver documento
                          </a>
                        )}
                        {doc.observaciones && (
                          <p className="text-xs text-gray-500 mt-1">Obs: {doc.observaciones}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No hay documentos cargados para esta postulación.</p>
                )}
              </Section>

              {/* Documentos de miembros */}
              <Section title="Documentos de miembros del hogar">
                {detalle.miembros.length > 0 ? (
                  <div className="space-y-3">
                    {detalle.miembros.map((miembro) => (
                      <div key={miembro.id} className="border border-gray-200 rounded-lg px-3 py-2">
                        <p className="text-sm font-semibold text-gray-800">
                          {miembro.primer_nombre} {miembro.segundo_nombre} {miembro.primer_apellido} {miembro.segundo_apellido}
                        </p>
                        {miembro.documentos?.length ? (
                          <div className="mt-2 space-y-1.5">
                            {miembro.documentos.map((doc) => (
                              <div key={doc.id} className="text-xs text-gray-600">
                                <span className="font-medium">{doc.tipo_documento_label}</span>
                                {doc.archivo_url && (
                                  <a href={doc.archivo_url} target="_blank" rel="noreferrer" className="ml-2 text-blue-700 hover:text-blue-900">
                                    Ver
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 mt-1">Sin documentos cargados.</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No hay miembros registrados.</p>
                )}
              </Section>

              {/* Observaciones de revisión — único campo editable */}
              <Section title="Observaciones de revisión">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Notas del revisor
                    <span className="ml-1 text-gray-400 font-normal">(visible solo para el equipo interno)</span>
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={3}
                    placeholder="Describe los problemas encontrados o las correcciones necesarias..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                  />
                </div>
              </Section>

            </div>

            {/* ── Footer ── */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-3 flex gap-3 justify-between items-center">
              <div className="text-xs">
                {totalFlaggeados > 0
                  ? <span className="text-red-500 font-semibold">{totalFlaggeados} campo{totalFlaggeados !== 1 ? 's' : ''} marcado{totalFlaggeados !== 1 ? 's' : ''} como incorrecto{totalFlaggeados !== 1 ? 's' : ''}</span>
                  : <span className="text-gray-400">Sin campos marcados</span>
                }
              </div>
              <div className="flex gap-3">
                <Dialog.Close
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </Dialog.Close>
                <button
                  type="button"
                  onClick={() => setIsRejectOpen(true)}
                  disabled={isLoading || !detalle}
                  className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading || !detalle}
                  className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
          )}

          {/* ── Overlay de confirmación de rechazo ── */}
          {isRejectOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-800">Confirmar rechazo</h3>
                <p className="text-sm text-gray-600 mt-2">Ingresa la observación para el rechazo.</p>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  className="mt-3 w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  rows={4}
                  placeholder="Observaciones"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsRejectOpen(false); setRejectNote(''); }}
                    className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isLoading}
                    className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Confirmar rechazo
                  </button>
                </div>
              </div>
            </div>
          )}

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
