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
import axios from 'axios';
import apiService from '../../../../core/services/api.service';
import type { PostulanteDetalle, ActualizarPostulanteData } from '../hooks/use-postulantes';
import { fmt, fmtBool } from '../utils/postulante-ui';

// ── Estilos base ──────────────────────────────────────────────────────────── //

const readOnlyCls  = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800';
const redReadOnlyCls = 'w-full px-3 py-2 text-sm rounded-lg border border-red-300 bg-red-50 text-red-800';
const editableCls = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400';
const errorCls = 'w-full px-3 py-2 text-sm rounded-lg border border-red-300 bg-white text-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400';

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
    className={`flex-shrink-0 ml-2 px-2 py-1 text-xs font-semibold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
      flagged
        ? 'bg-red-200 text-red-800 hover:bg-red-300 focus:ring-red-400'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300'
    }`}
    aria-pressed={flagged}
  >
    {flagged ? '✗ Incorrecto' : '✓ Correcto'}
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
  const [documentosFlagged, setDocumentosFlagged] = useState<Set<string>>(new Set());
  const [observaciones, setObservaciones] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  // Estado editable para los campos del hogar
  const [hogar, setHogar] = useState<any>({});

  // Estado para errores de validación
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (detalle) {
      console.log('[DEBUG] Modal abierto con detalle:', JSON.stringify({
        estado: detalle.estado,
        campos_incorrectos: detalle.campos_incorrectos,
        documentos_incorrectos: detalle.documentos_incorrectos,
        isEditable,
      }, null, 2));
      setFlagged(new Set(detalle.campos_incorrectos ?? []));
      setDocumentosFlagged(new Set(detalle.documentos_incorrectos ?? []));
      setObservaciones(detalle.observaciones_revision ?? '');
      setValidationErrors({});
      setHogar({
        departamento: detalle.departamento || '',
        municipio: detalle.municipio || '',
        zona: detalle.zona || '',
        tipo_predio: detalle.tipo_predio || '',
        comuna: detalle.comuna || '',
        barrio_vereda: detalle.barrio_vereda || '',
        direccion: detalle.direccion || '',
        observaciones_direccion: detalle.observaciones_direccion || '',
        estrato: detalle.estrato || '',
        es_propietario: detalle.es_propietario ?? '',
        numero_predial: detalle.numero_predial || '',
        matricula_inmobiliaria: detalle.matricula_inmobiliaria || '',
        avaluo_catastral: detalle.avaluo_catastral || '',
        numero_matricula_agua: detalle.numero_matricula_agua || '',
        numero_contrato_energia: detalle.numero_contrato_energia || '',
        tiempo_residencia: detalle.tiempo_residencia || '',
        tiene_dependientes: detalle.tiene_dependientes ?? '',
        personas_con_discapacidad_hogar: detalle.personas_con_discapacidad_hogar ?? '',
        acepta_terminos_condiciones: detalle.acepta_terminos_condiciones ?? false,
      });
    }
  }, [detalle]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setHogar((prev: any) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando el usuario lo modifica
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    // IMPORTANTE: NO desmarcamos automáticamente los flags al editar.
    // El funcionario debe controlar explícitamente si un campo está incorrecto o no.
  };

  const toggleFlag = (campo: string) => {
    setFlagged(prev => {
      const next = new Set(prev);
      next.has(campo) ? next.delete(campo) : next.add(campo);
      console.log(`[DEBUG] toggleFlag("${campo}"):`, {
        action: next.has(campo) ? 'AGREGADO (ahora incorrecto)' : 'REMOVIDO (ahora correcto)',
        flagged_set: Array.from(next),
        flagged_size: next.size,
      });
      return next;
    });
  };

  const toggleDocumentoFlag = (docId: string) => {
    setDocumentosFlagged(prev => {
      const next = new Set(prev);
      next.has(docId) ? next.delete(docId) : next.add(docId);
      return next;
    });
  };

  const getFieldError = (field: string) => {
    return validationErrors[field]?.[0] || '';
  };

  const hasFieldError = (field: string) => {
    return !!validationErrors[field];
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFlagged(new Set());
      setDocumentosFlagged(new Set());
      setObservaciones('');
      setValidationErrors({});
      setIsRejectOpen(false);
      setRejectNote('');
      onClose();
    }
  };

  const handleSave = async () => {
    if (!detalle) return;
    setValidationErrors({});

    const estadoCalculado = flagged.size > 0 || documentosFlagged.size > 0 ? 'SUBSANACION' : 'APROBADA';
    const payload = {
      estado: estadoCalculado,
      campos_incorrectos: Array.from(flagged),
      documentos_incorrectos: Array.from(documentosFlagged),
      observaciones_revision: observaciones,
    };

    console.log('[DEBUG] handleSave:', JSON.stringify({
      flagged_count: flagged.size,
      flagged_items: Array.from(flagged),
      documentosFlagged_count: documentosFlagged.size,
      documentosFlagged_items: Array.from(documentosFlagged),
      estadoCalculado,
      payload,
      detalle_estado: detalle?.estado,
    }, null, 2));

    try {
      await onSubmit(detalle.id, payload);
      // Modal se cierra automáticamente en handleOpenChange si onSubmit es exitoso
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400 && typeof error.response.data === 'object') {
          setValidationErrors(error.response.data);
          return;
        }
      }
      console.error('Error al guardar:', error);
    }
  };

  const handleReject = async () => {
    if (!detalle) return;
    await onSubmit(detalle.id, {
      estado: 'RECHAZADA',
      campos_incorrectos: Array.from(flagged),
      documentos_incorrectos: Array.from(documentosFlagged),
      observaciones_revision: rejectNote || 'Rechazado sin observación',
    });
    setIsRejectOpen(false);
    setRejectNote('');
  };

  const totalFlaggeados = flagged.size + documentosFlagged.size;
  
  // Mejorada: normalizar estado y permitir edición en estados de revisión
  const EDITABLE_STATES = ['EN_REVISION', 'SUBSANACION'];
  const estadoNormalizado = detalle?.estado?.toString?.().toUpperCase?.().replace?.(/\s+/g, '_').replace?.(/-/g, '_').trim?.();
  const isEditable = estadoNormalizado ? EDITABLE_STATES.includes(estadoNormalizado) : false;

  // Debug: log para verificar estado en consola
  console.log('[DEBUG] Estado del modal:', {
    estado_raw: detalle?.estado,
    estado_normalizado: estadoNormalizado,
    isEditable,
    totalFlaggeados,
  });

  if (detalle && !isEditable) {
    console.debug('[PostulanteEditarModal] Estado recibido:', {
      estado_raw: detalle.estado,
      estado_normalizado: estadoNormalizado,
      es_editable: isEditable,
    });
  }

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
                    {totalFlaggeados} elemento{totalFlaggeados !== 1 ? 's' : ''} marcado{totalFlaggeados !== 1 ? 's' : ''}
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
              Presiona el botón
              <svg xmlns="http://www.w3.org/2000/svg" className="inline h-3 w-3 mx-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V4m0 0l8 3 6-3 4 2v10l-4-2-6 3-8-3V4z" />
              </svg>{' '}
              junto a cada campo y documento para marcarlo como <strong>incorrecto</strong>.
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
                    {flagged.size > 0 || documentosFlagged.size > 0 ? 'Subsanación' : 'Aprobada'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Se marca «Subsanación» si hay campos o documentos incorrectos; de lo contrario queda «Aprobada».
                    Para rechazar, usa el botón Rechazar.
                  </p>
                  {isEditable && (
                    <p className="text-xs text-gray-500 mt-2">
                      Usa los botones a la derecha de cada campo para marcarlo como <strong>✗ Incorrecto</strong> si está mal.
                    </p>
                  )}
                </div>
              </Section>

              {/* Ubicación */}
              <Section title="Ubicación">
                <Grid2>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Departamento</label>
                    <div className="flex items-center">
                      <input name="departamento" value={hogar.departamento} onChange={handleInput} className={flagged.has('departamento') || hasFieldError('departamento') ? errorCls : (isEditable ? editableCls : readOnlyCls)} readOnly={!isEditable} />
                      {isEditable && <button onClick={() => toggleFlag('departamento')} className={`ml-2 px-2 py-1 text-xs rounded font-semibold ${flagged.has('departamento') ? 'bg-red-200 text-red-800 hover:bg-red-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{flagged.has('departamento') ? '✗ Incorrecto' : '✓ Correcto'}</button>}
                    </div>
                    {(flagged.has('departamento') || hasFieldError('departamento')) && <p className="text-xs text-red-600 mt-1">{getFieldError('departamento') || '✗ Campo marcado como incorrecto'}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Municipio</label>
                    <div className="flex items-center">
                      <input name="municipio" value={hogar.municipio} onChange={handleInput} className={flagged.has('municipio') || hasFieldError('municipio') ? errorCls : (isEditable ? editableCls : readOnlyCls)} readOnly={!isEditable} />
                      {isEditable && <button onClick={() => toggleFlag('municipio')} className={`ml-2 px-2 py-1 text-xs rounded font-semibold ${flagged.has('municipio') ? 'bg-red-200 text-red-800 hover:bg-red-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{flagged.has('municipio') ? '✗ Incorrecto' : '✓ Correcto'}</button>}
                    </div>
                    {(flagged.has('municipio') || hasFieldError('municipio')) && <p className="text-xs text-red-600 mt-1">{getFieldError('municipio') || '✗ Campo marcado como incorrecto'}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Zona</label>
                    <div className="flex items-center">
                      <select name="zona" value={hogar.zona} onChange={handleInput} className={flagged.has('zona') || hasFieldError('zona') ? errorCls : (isEditable ? editableCls : readOnlyCls)} disabled={!isEditable}>
                        <option value="">Seleccione...</option>
                        <option value="URBANA">Urbana</option>
                        <option value="RURAL">Rural</option>
                      </select>
                      {isEditable && <button onClick={() => toggleFlag('zona')} className={`ml-2 px-2 py-1 text-xs rounded font-semibold ${flagged.has('zona') ? 'bg-red-200 text-red-800 hover:bg-red-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{flagged.has('zona') ? '✗ Incorrecto' : '✓ Correcto'}</button>}
                    </div>
                    {(flagged.has('zona') || hasFieldError('zona')) && <p className="text-xs text-red-600 mt-1">{getFieldError('zona') || '✗ Campo marcado como incorrecto'}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de predio</label>
                    <div className="flex items-center">
                      <input name="tipo_predio" value={hogar.tipo_predio} onChange={handleInput} className={flagged.has('tipo_predio') ? errorCls : (isEditable ? editableCls : readOnlyCls)} readOnly={!isEditable} />
                      {isEditable && <FlagButton campo="tipo_predio" flagged={flagged.has('tipo_predio')} onToggle={toggleFlag} />}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Comuna</label>
                    {hogar.comuna === '' ? (
                      <div className={readOnlyCls}>No diligenciada</div>
                    ) : (
                      <div className="flex items-center">
                        <input name="comuna" value={hogar.comuna} onChange={handleInput} className={flagged.has('comuna') ? errorCls : (isEditable ? editableCls : readOnlyCls)} readOnly={!isEditable} />
                        {isEditable && <FlagButton campo="comuna" flagged={flagged.has('comuna')} onToggle={toggleFlag} />}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Barrio / Vereda</label>
                    {hogar.barrio_vereda === '' ? (
                      <div className={readOnlyCls}>No diligenciada</div>
                    ) : (
                      <div className="flex items-center">
                        <input name="barrio_vereda" value={hogar.barrio_vereda} onChange={handleInput} className={flagged.has('barrio_vereda') ? errorCls : (isEditable ? editableCls : readOnlyCls)} readOnly={!isEditable} />
                        {isEditable && <FlagButton campo="barrio_vereda" flagged={flagged.has('barrio_vereda')} onToggle={toggleFlag} />}
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Dirección</label>
                    <div className="flex items-center">
                      <input name="direccion" value={hogar.direccion} onChange={handleInput} className={flagged.has('direccion') || hasFieldError('direccion') ? errorCls : (isEditable ? editableCls : readOnlyCls)} readOnly={!isEditable} />
                      {isEditable && <button onClick={() => toggleFlag('direccion')} className={`ml-2 px-2 py-1 text-xs rounded font-semibold ${flagged.has('direccion') ? 'bg-red-200 text-red-800 hover:bg-red-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{flagged.has('direccion') ? '✗ Incorrecto' : '✓ Correcto'}</button>}
                    </div>
                    {(flagged.has('direccion') || hasFieldError('direccion')) && <p className="text-xs text-red-600 mt-1">{getFieldError('direccion') || '✗ Campo marcado como incorrecto'}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Observaciones de dirección</label>
                    {hogar.observaciones_direccion === '' ? (
                      <div className={readOnlyCls}>No diligenciada</div>
                    ) : (
                      <div className="flex items-center">
                        <input name="observaciones_direccion" value={hogar.observaciones_direccion} onChange={handleInput} className={flagged.has('observaciones_direccion') ? errorCls : (isEditable ? editableCls : readOnlyCls)} readOnly={!isEditable} />
                        {isEditable && <FlagButton campo="observaciones_direccion" flagged={flagged.has('observaciones_direccion')} onToggle={toggleFlag} />}
                      </div>
                    )}
                  </div>
                </Grid2>
              </Section>
              <Section title="Información del predio">
                <Grid2>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Estrato</label>
                    {hogar.estrato === '' ? (
                      <div className={readOnlyCls}>No diligenciada</div>
                    ) : (
                      <div className="flex items-center">
                        <input name="estrato" value={hogar.estrato} onChange={handleInput} className={flagged.has('estrato') ? errorCls : (isEditable ? editableCls : readOnlyCls)} readOnly={!isEditable} />
                        {isEditable && <FlagButton campo="estrato" flagged={flagged.has('estrato')} onToggle={toggleFlag} />}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Es propietario</label>
                    <div className="flex items-center">
                      <select name="es_propietario" value={hogar.es_propietario} onChange={handleInput} className={flagged.has('es_propietario') ? errorCls : (isEditable ? editableCls : readOnlyCls)} disabled={!isEditable}>
                        <option value="">Seleccione...</option>
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                      </select>
                      {isEditable && <FlagButton campo="es_propietario" flagged={flagged.has('es_propietario')} onToggle={toggleFlag} />}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Número predial</label>
                    {hogar.es_propietario === 'false' ? (
                      <div className={readOnlyCls}>No diligenciada</div>
                    ) : (
                      <div className="flex items-center">
                        <input name="numero_predial" value={hogar.numero_predial} onChange={handleInput} className={flagged.has('numero_predial') || hasFieldError('numero_predial') ? errorCls : (isEditable ? editableCls : readOnlyCls)} readOnly={!isEditable} />
                        {isEditable && <FlagButton campo="numero_predial" flagged={flagged.has('numero_predial')} onToggle={toggleFlag} />}
                      </div>
                    )}
                    {(flagged.has('numero_predial') || hasFieldError('numero_predial')) && hogar.es_propietario !== 'false' && <p className="text-xs text-red-600 mt-1">{getFieldError('numero_predial') || 'Campo marcado como incorrecto'}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Matrícula inmobiliaria</label>
                    {hogar.es_propietario === 'false' ? (
                      <div className={readOnlyCls}>No diligenciada</div>
                    ) : (
                      <div className="flex items-center">
                        <input name="matricula_inmobiliaria" value={hogar.matricula_inmobiliaria} onChange={handleInput} className={flagged.has('matricula_inmobiliaria') || hasFieldError('matricula_inmobiliaria') ? errorCls : (isEditable ? editableCls : readOnlyCls)} readOnly={!isEditable} />
                        {isEditable && <FlagButton campo="matricula_inmobiliaria" flagged={flagged.has('matricula_inmobiliaria')} onToggle={toggleFlag} />}
                      </div>
                    )}
                    {(flagged.has('matricula_inmobiliaria') || hasFieldError('matricula_inmobiliaria')) && hogar.es_propietario !== 'false' && <p className="text-xs text-red-600 mt-1">{getFieldError('matricula_inmobiliaria') || 'Campo marcado como incorrecto'}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Avalúo catastral</label>
                    {hogar.es_propietario === 'false' ? (
                      <div className={readOnlyCls}>No diligenciada</div>
                    ) : (
                      <div className="flex items-center">
                        <input name="avaluo_catastral" value={hogar.avaluo_catastral} onChange={handleInput} className={flagged.has('avaluo_catastral') || hasFieldError('avaluo_catastral') ? errorCls : (isEditable ? editableCls : readOnlyCls)} readOnly={!isEditable} />
                        {isEditable && <button onClick={() => toggleFlag('avaluo_catastral')} className={`ml-2 px-2 py-1 text-xs rounded ${flagged.has('avaluo_catastral') ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>{flagged.has('avaluo_catastral') ? 'Correcto' : 'Incorrecto'}</button>}
                      </div>
                    )}
                    {(flagged.has('avaluo_catastral') || hasFieldError('avaluo_catastral')) && hogar.es_propietario !== 'false' && <p className="text-xs text-red-600 mt-1">{getFieldError('avaluo_catastral') || 'Campo marcado como incorrecto'}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Matrícula agua</label>
                    {hogar.es_propietario === 'false' ? (
                      <div className={readOnlyCls}>No diligenciada</div>
                    ) : (
                      <div className="flex items-center">
                        <input name="numero_matricula_agua" value={hogar.numero_matricula_agua} onChange={handleInput} className={flagged.has('numero_matricula_agua') || hasFieldError('numero_matricula_agua') ? errorCls : (isEditable ? editableCls : readOnlyCls)} readOnly={!isEditable} />
                        {isEditable && <FlagButton campo="numero_matricula_agua" flagged={flagged.has('numero_matricula_agua')} onToggle={toggleFlag} />}
                      </div>
                    )}
                    {(flagged.has('numero_matricula_agua') || hasFieldError('numero_matricula_agua')) && hogar.es_propietario !== 'false' && <p className="text-xs text-red-600 mt-1">{getFieldError('numero_matricula_agua') || 'Campo marcado como incorrecto'}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Contrato energía</label>
                    {hogar.es_propietario === 'false' ? (
                      <div className={readOnlyCls}>No diligenciada</div>
                    ) : (
                      <div className="flex items-center">
                        <input name="numero_contrato_energia" value={hogar.numero_contrato_energia} onChange={handleInput} className={flagged.has('numero_contrato_energia') || hasFieldError('numero_contrato_energia') ? errorCls : (isEditable ? editableCls : readOnlyCls)} readOnly={!isEditable} />
                        {isEditable && <FlagButton campo="numero_contrato_energia" flagged={flagged.has('numero_contrato_energia')} onToggle={toggleFlag} />}
                      </div>
                    )}
                    {(flagged.has('numero_contrato_energia') || hasFieldError('numero_contrato_energia')) && hogar.es_propietario !== 'false' && <p className="text-xs text-red-600 mt-1">{getFieldError('numero_contrato_energia') || 'Campo marcado como incorrecto'}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tiempo de residencia</label>
                    {hogar.tiempo_residencia === '' ? (
                      <div className={readOnlyCls}>No diligenciada</div>
                    ) : (
                      <div className="flex items-center">
                        <input name="tiempo_residencia" value={hogar.tiempo_residencia} onChange={handleInput} className={flagged.has('tiempo_residencia') ? errorCls : (isEditable ? editableCls : readOnlyCls)} readOnly={!isEditable} />
                        {isEditable && <FlagButton campo="tiempo_residencia" flagged={flagged.has('tiempo_residencia')} onToggle={toggleFlag} />}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tiene dependientes</label>
                    <div className="flex items-center">
                      <select name="tiene_dependientes" value={hogar.tiene_dependientes} onChange={handleInput} className={flagged.has('tiene_dependientes') ? errorCls : editableCls}>
                        <option value="">Seleccione...</option>
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                      </select>
                      {isEditable && <FlagButton campo="tiene_dependientes" flagged={flagged.has('tiene_dependientes')} onToggle={toggleFlag} />}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Personas con discapacidad en hogar</label>
                    <div className="flex items-center">
                      <select name="personas_con_discapacidad_hogar" value={hogar.personas_con_discapacidad_hogar} onChange={handleInput} className={flagged.has('personas_con_discapacidad_hogar') ? errorCls : editableCls}>
                        <option value="">Seleccione...</option>
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                      </select>
                      {isEditable && <FlagButton campo="personas_con_discapacidad_hogar" flagged={flagged.has('personas_con_discapacidad_hogar')} onToggle={toggleFlag} />}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Acepta términos y condiciones</label>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" name="acepta_terminos_condiciones" checked={hogar.acepta_terminos_condiciones} onChange={handleInput} className="ml-2" />
                      {isEditable && <FlagButton campo="acepta_terminos_condiciones" flagged={flagged.has('acepta_terminos_condiciones')} onToggle={toggleFlag} />}
                    </div>
                  </div>
                </Grid2>
              </Section>

                  {/* Debug: mostrar estado actual si no es editable */}
              {!isEditable && detalle && (
                <Section title="⚠️ Información de depuración">
                  <div className="text-xs bg-yellow-50 border border-yellow-200 rounded p-2">
                    <p><strong>Estado actual:</strong> {detalle.estado} ({detalle.estado_label})</p>
                    <p className="text-gray-600 mt-1">Los botones de edición solo aparecen en estado "En revisión" o "Subsanación".</p>
                  </div>
                </Section>
              )}

              {/* Documentos de la postulación */}
              <Section title={`Documentos subidos (${detalle.documentos_hogar.length})`}>
                {detalle.documentos_hogar.length > 0 ? (
                  <div className="space-y-2">
                    {detalle.documentos_hogar.map((doc) => (
                      <div key={doc.id} className="border border-gray-200 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between">
                          <div>
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
                          {isEditable && (
                            <button onClick={() => toggleDocumentoFlag('hogar_' + doc.id)} className={`px-2 py-1 text-xs rounded font-semibold ${documentosFlagged.has('hogar_' + doc.id) ? 'bg-red-200 text-red-800 hover:bg-red-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{documentosFlagged.has('hogar_' + doc.id) ? '✗ Incorrecto' : '✓ Correcto'}</button>
                          )}
                        </div>
                        {documentosFlagged.has('hogar_' + doc.id) && <p className="text-xs text-red-600 mt-1">✗ Documento marcado como incorrecto</p>}
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
                              <div key={doc.id} className="flex items-center justify-between">
                                <div>
                                  <span className="text-xs text-gray-600 font-medium">{doc.tipo_documento_label}</span>
                                  {doc.archivo_url && (
                                    <a href={doc.archivo_url} target="_blank" rel="noreferrer" className="ml-2 text-blue-700 hover:text-blue-900">
                                      Ver
                                    </a>
                                  )}
                                </div>
                                {isEditable && (
                                  <button onClick={() => toggleDocumentoFlag('miembro_' + doc.id)} className={`px-2 py-1 text-xs rounded ${documentosFlagged.has('miembro_' + doc.id) ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>{documentosFlagged.has('miembro_' + doc.id) ? 'Correcto' : 'Incorrecto'}</button>
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
