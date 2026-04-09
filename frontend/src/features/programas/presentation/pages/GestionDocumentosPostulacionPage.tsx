/**
 * GestionDocumentosPostulacionPage – Pantalla de gestión de documentos
 * para una postulación específica.
 *
 * Recibe el ID de la postulación por URL y muestra las secciones
 * documentales con funcionalidad de subida y eliminación de archivos.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDocumentosProcesoInterno } from '../hooks/useDocumentosProcesoInterno';
import {
  SECCIONES_GESTION,
} from '../components/gestion-documental/config/secciones-data-gestion';
import type {
  TipoDocumentoProcesoInterno,
  DocumentoProcesoInternoData,
} from '../../infrastructure/persistence/axios-documento-proceso-interno-repository';

// ── Helpers ───────────────────────────────────────────────────────────────── //

const ALL_TIPOS: { id: string; label: string }[] = [];
for (const sec of SECCIONES_GESTION) {
  for (const g of sec.grupos) {
    for (const c of g.campos) {
      ALL_TIPOS.push({ id: c.id, label: c.label });
    }
  }
}
const TOTAL_TIPOS = ALL_TIPOS.length;

const Spinner: React.FC<{ className?: string }> = ({ className = 'h-5 w-5 text-purple-500' }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

// ── Componente principal ──────────────────────────────────────────────────── //

export const GestionDocumentosPostulacionPage: React.FC = () => {
  const navigate = useNavigate();
  const { postulacionId } = useParams<{ postulacionId: string }>();
  const postulacionIdNum = postulacionId ? Number(postulacionId) : undefined;

  // Documentos de la postulación
  const {
    documentos,
    isLoading: loadingDocs,
    subir,
    isSubiendo,
    eliminar,
    isEliminando,
  } = useDocumentosProcesoInterno(postulacionIdNum);

  // Mapa tipo → docs
  const docsPorTipo = useMemo(() => {
    const map = new Map<string, DocumentoProcesoInternoData[]>();
    for (const d of documentos) {
      const arr = map.get(d.tipo_documento) ?? [];
      arr.push(d);
      map.set(d.tipo_documento, arr);
    }
    return map;
  }, [documentos]);

  const totalDocsCargados = documentos.length;

  // ── Upload modal state ──────────────────────────────────────────────── //
  const [uploadTipo, setUploadTipo] = useState<TipoDocumentoProcesoInterno | null>(null);
  const [uploadObs, setUploadObs] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Mensaje de estado ───────────────────────────────────────────────── //
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(null), 4000);
    return () => clearTimeout(t);
  }, [mensaje]);

  const openUpload = useCallback((tipo: TipoDocumentoProcesoInterno) => {
    setUploadTipo(tipo);
    setUploadObs('');
  }, []);

  const closeUpload = useCallback(() => setUploadTipo(null), []);

  const handleUpload = useCallback(() => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !uploadTipo || !postulacionIdNum) return;
    subir({
      postulacion: postulacionIdNum,
      tipo_documento: uploadTipo,
      archivo: file,
      observaciones: uploadObs,
    }, {
      onSuccess: () => {
        closeUpload();
        // Check completeness after upload (docs list will re-fetch, but we can estimate)
        const tiposCargadosActuales = new Set(documentos.map(d => d.tipo_documento));
        tiposCargadosActuales.add(uploadTipo);
        if (tiposCargadosActuales.size >= TOTAL_TIPOS) {
          setMensaje({ tipo: 'exito', texto: 'Documentos cargados exitosamente' });
        } else {
          setMensaje({ tipo: 'error', texto: `Documentos incompletos — faltan ${TOTAL_TIPOS - tiposCargadosActuales.size} documentos por cargar` });
        }
      },
      onError: () => {
        setMensaje({ tipo: 'error', texto: 'Error al subir el documento. Intente nuevamente.' });
      },
    });
  }, [uploadTipo, postulacionIdNum, uploadObs, subir, closeUpload, documentos]);

  // ── Confirmación de eliminación ─────────────────────────────────────── //
  const [deleteDocId, setDeleteDocId] = useState<number | null>(null);

  const confirmDelete = useCallback(() => {
    if (deleteDocId == null) return;
    eliminar(deleteDocId, { onSuccess: () => setDeleteDocId(null) });
  }, [deleteDocId, eliminar]);

  // Secciones colapsables
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const toggleSection = useCallback((secId: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(secId) ? next.delete(secId) : next.add(secId);
      return next;
    });
  }, []);

  // ── Render ──────────────────────────────────────────────────────────── //

  if (!postulacionIdNum) {
    return (
      <div className="max-w-5xl mx-auto py-8 text-center text-gray-400 text-sm">
        No se encontró la postulación.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5 py-4">

      {/* ═══ Cabecera ═══ */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Proceso interno</p>
            <h1 className="text-xl font-extrabold text-gray-900 leading-tight">
              Documentos de la Postulación #{postulacionId}
            </h1>
          </div>
        </div>

        {/* Progreso */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
            {totalDocsCargados} / {TOTAL_TIPOS} documentos cargados
          </span>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (totalDocsCargados / TOTAL_TIPOS) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ═══ Secciones documentales ═══ */}
      {loadingDocs ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-6 w-6 text-purple-500" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {SECCIONES_GESTION.map(seccion => {
            const isOpen = openSections.has(seccion.id);
            const secDocsCount = seccion.grupos.reduce(
              (acc, g) => acc + g.campos.reduce((a, c) => a + (docsPorTipo.get(c.id)?.length ?? 0), 0),
              0,
            );
            const secTotalCampos = seccion.grupos.reduce((a, g) => a + g.campos.length, 0);

            return (
              <div key={seccion.id} className={`border rounded-xl overflow-hidden ${seccion.colorClasses.border}`}>
                {/* Encabezado de sección */}
                <button
                  type="button"
                  onClick={() => toggleSection(seccion.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 ${seccion.colorClasses.header} hover:brightness-95 transition-all`}
                >
                  <span className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${seccion.colorClasses.numero}`}>
                    {seccion.numero}
                  </span>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-bold text-gray-800">{seccion.label}</h3>
                    <p className="text-xs text-gray-500">{seccion.descripcion}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 mr-2">
                    {secDocsCount}/{secTotalCampos}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Campos de la sección */}
                {isOpen && (
                  <div className="divide-y divide-gray-100">
                    {seccion.grupos.map(grupo => (
                      <React.Fragment key={grupo.titulo}>
                        {grupo.campos.map(campo => {
                          const docs = docsPorTipo.get(campo.id) ?? [];
                          return (
                            <div key={campo.id} className="px-4 py-3 flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">
                                  {campo.label}
                                  {campo.requeridoPorDefecto && <span className="text-red-500 ml-0.5">*</span>}
                                </p>
                                {docs.length === 0 && campo.requeridoPorDefecto && (
                                  <p className="text-xs text-red-400 mt-0.5">Obligatorio — Debe cargar este documento</p>
                                )}
                                {docs.length > 0 ? (
                                  <div className="mt-1.5 flex flex-col gap-1.5">
                                    {docs.map(doc => (
                                      <div key={doc.id} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-xs">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="truncate text-gray-700 font-medium flex-1">{doc.nombre_archivo}</span>
                                        <button
                                          onClick={() => setDeleteDocId(doc.id)}
                                          className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                                          title="Eliminar documento"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : !campo.requeridoPorDefecto ? (
                                  <p className="text-xs text-gray-400 mt-0.5">Sin documento cargado</p>
                                ) : null}
                              </div>
                              <button
                                onClick={() => openUpload(campo.id as TipoDocumentoProcesoInterno)}
                                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Subir
                              </button>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Barra inferior: Guardar ═══ */}
      {!loadingDocs && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] rounded-t-xl px-5 py-4 flex flex-col gap-3 -mx-0">
          {/* Mensaje de estado */}
          {mensaje && (
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${
              mensaje.tipo === 'exito'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {mensaje.tipo === 'exito' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {mensaje.texto}
            </div>
          )}
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <strong className="text-gray-700">{totalDocsCargados}</strong> de {TOTAL_TIPOS} documentos cargados
            </span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Guardar
          </button>
          </div>
        </div>
      )}

      {/* ── Modal de carga ─────────────────────────────────────────────────── */}
      {uploadTipo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">Subir documento</h2>
            <p className="text-sm text-gray-500">
              {ALL_TIPOS.find(t => t.id === uploadTipo)?.label ?? uploadTipo}
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Archivo *</label>
              <input ref={fileInputRef} type="file" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Observaciones</label>
              <textarea
                value={uploadObs}
                onChange={e => setUploadObs(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none resize-none"
                placeholder="Notas adicionales..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button onClick={closeUpload} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={isSubiendo}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubiendo ? 'Subiendo...' : 'Subir documento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de confirmación de eliminación ───────────────────────────── */}
      {deleteDocId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-red-700">Eliminar documento</h2>
            <p className="text-sm text-gray-600">¿Está seguro de que desea eliminar este documento? Esta acción no se puede deshacer fácilmente.</p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button onClick={() => setDeleteDocId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isEliminando}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
