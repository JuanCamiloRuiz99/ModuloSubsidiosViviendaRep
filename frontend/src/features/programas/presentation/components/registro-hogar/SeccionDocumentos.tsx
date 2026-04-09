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
  TipoDocumentoMiembro,
} from '../../../domain/registro-hogar.types';
import {
  TIPOS_DOCUMENTO_HOGAR,
  DOCS_REQUERIDOS_MIEMBRO,
  TIPOS_DOCUMENTO_MIEMBRO,
} from '../../../domain/registro-hogar.types';
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

/** Set de tipos que siempre son fijos (foto cédula frente/reverso). */
const FIXED_TIPOS = new Set<string>(DOCS_REQUERIDOS_MIEMBRO.map(d => d.value));

/** Documentos condicionales que se requieren según las características del miembro. */
function getConditionalDocs(miembro: MiembroHogarForm): Array<{ value: TipoDocumentoMiembro; label: string }> {
  const docs: Array<{ value: TipoDocumentoMiembro; label: string }> = [];
  if (miembro.pertenece_sisben)
    docs.push({ value: 'CERTIFICADO_SISBEN', label: 'Certificado SISBEN' });
  if (miembro.tiene_discapacidad)
    docs.push({ value: 'CERTIFICADO_DISCAPACIDAD', label: 'Certificado de discapacidad' });
  if (miembro.es_victima_conflicto || miembro.es_desplazado)
    docs.push({ value: 'CERTIFICADO_VICTIMA', label: 'Certificado registro de víctima (RUV)' });
  return docs;
}

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

  /** Actualiza un doc requerido fijo buscando por tipo_documento.
   *  Si el tipo no existe aún en el array, lo agrega (para condicionales). */
  const updateFixedMiembroDoc = (
    miembro: MiembroHogarForm,
    tipo: string,
    partial: Partial<DocumentoMiembroEntry>,
  ) => {
    const exists = miembro.documentos.some(d => d.tipo_documento === tipo);
    const updated = exists
      ? miembro.documentos.map(d => d.tipo_documento === tipo ? { ...d, ...partial } : d)
      : [...miembro.documentos, { tipo_documento: tipo as DocumentoMiembroEntry['tipo_documento'], file: null, observaciones: '', ...partial }];
    onChangeDocMiembro(miembro._localId, updated);
  };

  /** Actualiza un doc opcional por su índice real en el array completo. */
  const updateOptionalDoc = (
    miembro: MiembroHogarForm,
    realIdx: number,
    partial: Partial<DocumentoMiembroEntry>,
  ) => {
    const updated = miembro.documentos.map((d, i) => (i === realIdx ? { ...d, ...partial } : d));
    onChangeDocMiembro(miembro._localId, updated);
  };

  const addRegistroCivil = (miembro: MiembroHogarForm) =>
    onChangeDocMiembro(miembro._localId, [
      ...miembro.documentos,
      { tipo_documento: 'REGISTRO_CIVIL' as DocumentoMiembroEntry['tipo_documento'], file: null, observaciones: '' },
    ]);

  const addDocByType = (miembro: MiembroHogarForm, tipo: TipoDocumentoMiembro) =>
    onChangeDocMiembro(miembro._localId, [
      ...miembro.documentos,
      { tipo_documento: tipo, file: null, observaciones: '' },
    ]);

  const removeOptionalDoc = (miembro: MiembroHogarForm, realIdx: number) =>
    onChangeDocMiembro(
      miembro._localId,
      miembro.documentos.filter((_, i) => i !== realIdx),
    );

  const subidosHogar = documentosHogar.filter(d => d.file !== null).length;

  return (
    <div className="flex flex-col gap-8">

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-sm text-amber-700">
          Los archivos marcados con <span className="font-bold">*</span> son obligatorios.
          Formatos aceptados: PDF, JPG, PNG. Tamaño máximo: 5 MB.
        </p>
      </div>

      {/* ── Documentos del hogar ─────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Documentos del hogar</h3>
            <p className="text-xs text-gray-500 mt-0.5">Documentos del predio y servicios públicos</p>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {subidosHogar} / {documentosHogar.length} cargados
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {TIPOS_DOCUMENTO_HOGAR.map(tipo => {
            const entrada = documentosHogar.find(d => d.tipo_documento === tipo.value)!;
            return (
              <FilaDocumento
                key={tipo.value}
                label={tipo.label}
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
          <div className="mb-3">
            <h3 className="text-sm font-bold text-gray-800">Documentos por miembro</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              La foto de cédula se solicita a cada persona. Puede adjuntar documentos adicionales (SISBEN, discapacidad, etc.) según corresponda.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            {miembros.map((miembro, idx) => {
              const nombre = [miembro.primer_nombre, miembro.primer_apellido]
                .filter(Boolean)
                .join(' ') || `Miembro ${idx + 1}`;

              const conditionalDocs = getConditionalDocs(miembro);
              const requiredTipos = new Set<string>([
                ...DOCS_REQUERIDOS_MIEMBRO.map(d => d.value),
                ...conditionalDocs.map(d => d.value),
              ]);

              // Tipos opcionales ya agregados (excluye los requeridos del estado)
              const optionalDocs = miembro.documentos
                .map((doc, realIdx) => ({ doc, realIdx }))
                .filter(({ doc }) => !requiredTipos.has(doc.tipo_documento as string));

              // Tipos disponibles para agregar: los no requeridos y no presentes (salvo REGISTRO_CIVIL)
              const tiposYaAgregados = new Set<string>(
                optionalDocs
                  .filter(({ doc }) => doc.tipo_documento !== 'REGISTRO_CIVIL')
                  .map(({ doc }) => doc.tipo_documento as string),
              );
              const tiposDisponibles = TIPOS_DOCUMENTO_MIEMBRO.filter(
                t => !requiredTipos.has(t.value) && !tiposYaAgregados.has(t.value),
              );

              const rcDocs = optionalDocs.filter(({ doc }) => doc.tipo_documento === 'REGISTRO_CIVIL');

              const requiredUploaded =
                DOCS_REQUERIDOS_MIEMBRO.every(t =>
                  miembro.documentos.find(d => d.tipo_documento === t.value)?.file !== null,
                ) &&
                conditionalDocs.every(t =>
                  miembro.documentos.find(d => d.tipo_documento === t.value)?.file !== null,
                );

              return (
                <div key={miembro._localId} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{nombre}</p>
                    {miembro.numero_documento && (
                      <span className="text-xs text-gray-400">— {miembro.numero_documento}</span>
                    )}
                    {requiredUploaded && (
                      <span className="ml-auto text-xs text-green-600 font-medium">✓ docs requeridos</span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col gap-4">
                    {/* Documentos requeridos (foto cédula + condicionales) */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        Identificación — requerido
                      </p>
                      <div className="flex flex-col gap-2">
                        {DOCS_REQUERIDOS_MIEMBRO.map(tipo => {
                          const doc = miembro.documentos.find(d => d.tipo_documento === tipo.value);
                          return (
                            <FilaDocumento
                              key={tipo.value}
                              label={tipo.label}
                              requerido
                              file={doc?.file ?? null}
                              observaciones={doc?.observaciones ?? ''}
                              onFile={f => updateFixedMiembroDoc(miembro, tipo.value, { file: f })}
                              onObs={v => updateFixedMiembroDoc(miembro, tipo.value, { observaciones: v })}
                            />
                          );
                        })}
                        {conditionalDocs.map(tipo => {
                          const doc = miembro.documentos.find(d => d.tipo_documento === tipo.value);
                          return (
                            <FilaDocumento
                              key={tipo.value}
                              label={tipo.label}
                              requerido
                              file={doc?.file ?? null}
                              observaciones={doc?.observaciones ?? ''}
                              onFile={f => updateFixedMiembroDoc(miembro, tipo.value, { file: f })}
                              onObs={v => updateFixedMiembroDoc(miembro, tipo.value, { observaciones: v })}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Documentos opcionales (sin duplicar + REGISTRO_CIVIL múltiple) */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        Documentos adicionales
                      </p>
                      <div className="flex flex-col gap-2">
                        {optionalDocs.length === 0 && (
                          <p className="text-xs text-gray-400 py-1">
                            Puede agregar documentos adicionales usando el selector de abajo.
                          </p>
                        )}
                        {optionalDocs.map(({ doc, realIdx }, i) => {
                          const tipoLabel =
                            TIPOS_DOCUMENTO_MIEMBRO.find(t => t.value === doc.tipo_documento)?.label
                            ?? doc.tipo_documento;
                          return (
                            <div key={realIdx} className="flex items-start gap-2">
                              <div className="flex-1">
                                <FilaDocumento
                                  label={doc.tipo_documento === 'REGISTRO_CIVIL' && rcDocs.length > 1
                                    ? `Registro civil (${rcDocs.findIndex(r => r.realIdx === realIdx) + 1})`
                                    : tipoLabel}
                                  file={doc.file}
                                  observaciones={doc.observaciones}
                                  onFile={f => updateOptionalDoc(miembro, realIdx, { file: f })}
                                  onObs={v => updateOptionalDoc(miembro, realIdx, { observaciones: v })}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeOptionalDoc(miembro, realIdx)}
                                className="flex-shrink-0 mt-2 p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                title="Eliminar"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                        {tiposDisponibles.length > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <select
                              defaultValue=""
                              onChange={e => {
                                if (e.target.value) {
                                  addDocByType(miembro, e.target.value as TipoDocumentoMiembro);
                                  e.target.value = '';
                                }
                              }}
                              className="border border-dashed border-blue-300 text-blue-600 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white cursor-pointer"
                            >
                              <option value="">+ Agregar documento...</option>
                              {tiposDisponibles.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
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
