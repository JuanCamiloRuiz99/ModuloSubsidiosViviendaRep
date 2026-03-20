/**
 * SeccionDocumentos — Paso 3 del formulario de Registro del Hogar.
 *
 * Gestiona la carga de archivos para:
 *   - documentos_gestion_hogar_etapa1  (del hogar completo)
 *   - documentos_miembro_hogar         (por cada miembro agregado)
 */

import React from 'react';
import type {
  DocumentoHogarEntry,
  MiembroHogarForm,
} from '../../../domain/registro-hogar.types';
import { TIPOS_DOCUMENTO_HOGAR, TIPOS_DOCUMENTO_MIEMBRO } from '../../../domain/registro-hogar.types';
import type { DocumentoMiembroEntry } from '../../../domain/registro-hogar.types';

interface Props {
  documentosHogar: DocumentoHogarEntry[];
  onChangeDocHogar: (docs: DocumentoHogarEntry[]) => void;
  miembros: MiembroHogarForm[];
  onChangeDocMiembro: (miembroLocalId: string, docs: DocumentoMiembroEntry[]) => void;
}

// ── Fila de documento ─────────────────────────────────────────────────────── //

const FilaDocumento: React.FC<{
  label: string;
  requerido?: boolean;
  file: File | null;
  observaciones: string;
  onFile: (f: File | null) => void;
  onObs: (v: string) => void;
}> = ({ label, requerido, file, observaciones, onFile, onObs }) => (
  <div className={`flex flex-col sm:flex-row gap-3 p-3 rounded-xl border transition-colors ${
    file ? 'border-green-300 bg-green-50' : requerido ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'
  }`}>
    {/* Indicador */}
    <div className="flex items-center gap-2 sm:w-64 flex-shrink-0">
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
        file ? 'bg-green-200' : requerido ? 'bg-amber-200' : 'bg-gray-200'
      }`}>
        {file ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        )}
      </div>
      <p className="text-sm font-medium text-gray-700 leading-tight">
        {label}
        {requerido && <span className="text-red-500 ml-1">*</span>}
      </p>
    </div>

    {/* Selector de archivo */}
    <label className="flex-1 flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-blue-400 hover:bg-white transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      <span className={`text-sm truncate ${file ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
        {file ? file.name : 'Seleccionar archivo…'}
      </span>
      <input
        type="file"
        className="sr-only"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={e => onFile(e.target.files?.[0] ?? null)}
      />
    </label>

    {/* Observaciones */}
    <input
      type="text"
      value={observaciones}
      onChange={e => onObs(e.target.value)}
      placeholder="Observaciones (opcional)"
      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
    />

    {/* Limpiar */}
    {file && (
      <button
        type="button"
        onClick={() => onFile(null)}
        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
        title="Quitar archivo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
);

// ── Componente principal ──────────────────────────────────────────────────── //

export const SeccionDocumentos: React.FC<Props> = ({
  documentosHogar,
  onChangeDocHogar,
  miembros,
  onChangeDocMiembro,
}) => {
  const updateHogar = (tipo: string, partial: Partial<DocumentoHogarEntry>) =>
    onChangeDocHogar(
      documentosHogar.map(d => (d.tipo_documento === tipo ? { ...d, ...partial } : d)),
    );

  const updateMiembroDoc = (
    miembroLocalId: string,
    docs: DocumentoMiembroEntry[],
    idx: number,
    partial: Partial<DocumentoMiembroEntry>,
  ) => {
    const updated = docs.map((d, i) => (i === idx ? { ...d, ...partial } : d));
    onChangeDocMiembro(miembroLocalId, updated);
  };

  const addMiembroDoc = (miembro: MiembroHogarForm) =>
    onChangeDocMiembro(miembro._localId, [
      ...miembro.documentos,
      { tipo_documento: '', file: null, observaciones: '' },
    ]);

  const removeMiembroDoc = (miembro: MiembroHogarForm, idx: number) =>
    onChangeDocMiembro(
      miembro._localId,
      miembro.documentos.filter((_, i) => i !== idx),
    );

  const subidosHogar = documentosHogar.filter(d => d.file !== null).length;
  const requierenHogar = TIPOS_DOCUMENTO_HOGAR.filter(t => t.requerido).length;

  return (
    <div className="flex flex-col gap-8">

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-sm text-amber-700">
          Los archivos marcados con <span className="font-bold">*</span> son obligatorios para
          completar la postulación. Formatos aceptados: PDF, JPG, PNG. Tamaño máximo: 5 MB.
        </p>
      </div>

      {/* ── Documentos del hogar ─────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">Documentos del hogar</h3>
          <span className="text-xs text-gray-400 font-medium">
            {subidosHogar} / {documentosHogar.length} archivos cargados
            {subidosHogar >= requierenHogar && (
              <span className="ml-1 text-green-600">✓ mínimo requerido</span>
            )}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {TIPOS_DOCUMENTO_HOGAR.map(tipo => {
            const entrada = documentosHogar.find(d => d.tipo_documento === tipo.value)!;
            return (
              <FilaDocumento
                key={tipo.value}
                label={tipo.label}
                requerido={tipo.requerido}
                file={entrada.file}
                observaciones={entrada.observaciones}
                onFile={f => updateHogar(tipo.value, { file: f })}
                onObs={v => updateHogar(tipo.value, { observaciones: v })}
              />
            );
          })}
        </div>
      </section>

      {/* ── Documentos por miembro ───────────────────────── */}
      {miembros.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-gray-800 mb-3">Documentos por miembro</h3>
          <div className="flex flex-col gap-6">
            {miembros.map((miembro, idx) => {
              const nombre = [miembro.primer_nombre, miembro.primer_apellido]
                .filter(Boolean)
                .join(' ') || `Miembro ${idx + 1}`;

              return (
                <div key={miembro._localId} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{nombre}</p>
                    {miembro.numero_documento && (
                      <span className="text-xs text-gray-400">— {miembro.numero_documento}</span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col gap-2">
                    {miembro.documentos.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-2">
                        Sin documentos. Use el botón para adjuntar.
                      </p>
                    )}

                    {miembro.documentos.map((doc, i) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <select
                          value={doc.tipo_documento}
                          onChange={e =>
                            updateMiembroDoc(miembro._localId, miembro.documentos, i, {
                              tipo_documento: e.target.value as DocumentoMiembroEntry['tipo_documento'],
                            })
                          }
                          className="flex-shrink-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 sm:w-52"
                        >
                          <option value="">Tipo de documento...</option>
                          {TIPOS_DOCUMENTO_MIEMBRO.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>

                        <label className="flex-1 flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-blue-400 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className={`text-sm truncate ${doc.file ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
                            {doc.file ? doc.file.name : 'Seleccionar archivo...'}
                          </span>
                          <input
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={e =>
                              updateMiembroDoc(miembro._localId, miembro.documentos, i, {
                                file: e.target.files?.[0] ?? null,
                              })
                            }
                          />
                        </label>

                        <input
                          type="text"
                          value={doc.observaciones}
                          onChange={e =>
                            updateMiembroDoc(miembro._localId, miembro.documentos, i, {
                              observaciones: e.target.value,
                            })
                          }
                          placeholder="Observaciones..."
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />

                        <button
                          type="button"
                          onClick={() => removeMiembroDoc(miembro, i)}
                          className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addMiembroDoc(miembro)}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium mt-1 w-fit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Agregar documento
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
