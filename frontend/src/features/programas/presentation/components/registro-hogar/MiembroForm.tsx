/**
 * MiembroForm — Formulario expandible de un miembro del hogar.
 *
 * Cubre los campos de miembros_hogar organizados en secciones:
 *   1. Datos de la persona     2. Vínculo con el hogar
 *   3. Socioeconómica          4. Afiliación SISBEN
 *   5. Condiciones especiales  6. Documentos del miembro
 */

import React, { useState } from 'react';
import type { MiembroHogarForm, DocumentoMiembroEntry } from '../../../domain/registro-hogar.types';
import {
  PARENTESCO_OPTIONS,
  TIPOS_DOC_PERSONA,
  SITUACION_LABORAL_OPTIONS,
  TIPOS_DOCUMENTO_MIEMBRO,
} from '../../../domain/registro-hogar.types';

export type ErroresMiembro = Partial<Record<keyof MiembroHogarForm, string>>;

interface Props {
  miembro: MiembroHogarForm;
  onChange: (m: MiembroHogarForm) => void;
  errores?: ErroresMiembro;
}

// ── Helpers internos ──────────────────────────────────────────────────────── //

const inputCls = (error?: string) =>
  `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
    error
      ? 'border-red-300 focus:ring-red-300 bg-red-50'
      : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400'
  }`;

const Field: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}> = ({ label, required, error, full, children }) => (
  <div className={full ? 'col-span-2' : ''}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const SeccionHeader: React.FC<{ title: string; badge?: string }> = ({ title, badge }) => (
  <div className="col-span-2 mt-2 -mb-1 flex items-center gap-2">
    <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700">
      {title}
    </p>
    {badge && (
      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
        {badge}
      </span>
    )}
    <div className="flex-1 h-px bg-blue-100" />
  </div>
);

const BooleanSelect: React.FC<{
  value: boolean | null;
  onChange: (v: boolean | null) => void;
  error?: string;
}> = ({ value, onChange, error }) => (
  <select
    value={value === null ? '' : value ? '1' : '0'}
    onChange={e => {
      const v = e.target.value;
      onChange(v === '' ? null : v === '1');
    }}
    className={inputCls(error)}
  >
    <option value="">Seleccione...</option>
    <option value="1">Sí</option>
    <option value="0">No</option>
  </select>
);

const CondicionToggle: React.FC<{
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ id, label, checked, onChange }) => (
  <label
    htmlFor={id}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
      checked ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
    }`}
  >
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
    />
    <span className="text-sm font-medium text-gray-700">{label}</span>
    {checked && (
      <span className="ml-auto text-xs text-amber-600 font-semibold">Completar datos →</span>
    )}
  </label>
);

// ── Componente principal ──────────────────────────────────────────────────── //

export const MiembroForm: React.FC<Props> = ({ miembro, onChange, errores = {} }) => {
  const set = <K extends keyof MiembroHogarForm>(key: K, val: MiembroHogarForm[K]) =>
    onChange({ ...miembro, [key]: val });

  // Estado de secciones colapsables
  const [secAbiertas, setSecAbiertas] = useState<Set<string>>(
    new Set(['persona', 'vinculo']),
  );
  const toggleSec = (id: string) =>
    setSecAbiertas(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const AccordionHeader: React.FC<{ id: string; titulo: string; obligatorio?: boolean }> = ({
    id,
    titulo,
    obligatorio,
  }) => (
    <button
      type="button"
      onClick={() => toggleSec(id)}
      className="w-full flex items-center gap-2 text-left group"
    >
      <span
        className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-transform ${
          secAbiertas.has(id) ? 'rotate-0' : '-rotate-90'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
      <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 flex-1">
        {titulo}
      </p>
      {obligatorio && (
        <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wide flex-shrink-0">
          Obligatorio
        </span>
      )}
    </button>
  );

  // ── Documentos del miembro ─────────────────────────────────────────────── //
  const agregarDocMiembro = () =>
    set('documentos', [
      ...miembro.documentos,
      { tipo_documento: '', file: null, observaciones: '' },
    ]);

  const actualizarDoc = (i: number, partial: Partial<DocumentoMiembroEntry>) =>
    set(
      'documentos',
      miembro.documentos.map((d, idx) => (idx === i ? { ...d, ...partial } : d)),
    );

  const eliminarDoc = (i: number) =>
    set(
      'documentos',
      miembro.documentos.filter((_, idx) => idx !== i),
    );

  return (
    <div className="flex flex-col gap-4">

      {/* ══ 1. DATOS DE LA PERSONA ══════════════════════════════════════ */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <AccordionHeader id="persona" titulo="Datos de la persona" obligatorio />
        </div>
        {secAbiertas.has('persona') && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tipo de documento" required error={errores.tipo_documento}>
              <select
                value={miembro.tipo_documento}
                onChange={e => set('tipo_documento', e.target.value as MiembroHogarForm['tipo_documento'])}
                className={inputCls(errores.tipo_documento)}
              >
                <option value="">Seleccione...</option>
                {TIPOS_DOC_PERSONA.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Número de documento" required error={errores.numero_documento}>
              <input
                type="text"
                value={miembro.numero_documento}
                onChange={e => set('numero_documento', e.target.value)}
                className={inputCls(errores.numero_documento)}
              />
            </Field>

            <Field label="Primer nombre" required error={errores.primer_nombre}>
              <input
                type="text"
                value={miembro.primer_nombre}
                onChange={e => set('primer_nombre', e.target.value)}
                className={inputCls(errores.primer_nombre)}
              />
            </Field>

            <Field label="Segundo nombre" error={errores.segundo_nombre}>
              <input
                type="text"
                value={miembro.segundo_nombre}
                onChange={e => set('segundo_nombre', e.target.value)}
                className={inputCls()}
              />
            </Field>

            <Field label="Primer apellido" required error={errores.primer_apellido}>
              <input
                type="text"
                value={miembro.primer_apellido}
                onChange={e => set('primer_apellido', e.target.value)}
                className={inputCls(errores.primer_apellido)}
              />
            </Field>

            <Field label="Segundo apellido" error={errores.segundo_apellido}>
              <input
                type="text"
                value={miembro.segundo_apellido}
                onChange={e => set('segundo_apellido', e.target.value)}
                className={inputCls()}
              />
            </Field>

            <Field label="Fecha de nacimiento" required error={errores.fecha_nacimiento}>
              <input
                type="date"
                value={miembro.fecha_nacimiento}
                onChange={e => set('fecha_nacimiento', e.target.value)}
                className={inputCls(errores.fecha_nacimiento)}
              />
            </Field>
          </div>
        )}
      </div>

      {/* ══ 2. VÍNCULO CON EL HOGAR ══════════════════════════════════════ */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <AccordionHeader id="vinculo" titulo="Vínculo con el hogar" obligatorio />
        </div>
        {secAbiertas.has('vinculo') && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Parentesco" required error={errores.parentesco}>
              <select
                value={miembro.parentesco}
                onChange={e => set('parentesco', e.target.value as MiembroHogarForm['parentesco'])}
                className={inputCls(errores.parentesco)}
              >
                <option value="">Seleccione...</option>
                {PARENTESCO_OPTIONS.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </Field>

            {miembro.parentesco === 'OTRO' && (
              <Field label="Especifique el parentesco" required error={errores.parentesco_otro}>
                <input
                  type="text"
                  value={miembro.parentesco_otro}
                  onChange={e => set('parentesco_otro', e.target.value)}
                  className={inputCls(errores.parentesco_otro)}
                />
              </Field>
            )}

            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={miembro.es_cabeza_hogar}
                  onChange={e => set('es_cabeza_hogar', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Es cabeza de hogar
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ══ 3. INFORMACIÓN SOCIOECONÓMICA ══════════════════════════════════ */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <AccordionHeader id="socioecon" titulo="Información socioeconómica" />
        </div>
        {secAbiertas.has('socioecon') && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nivel educativo" error={errores.nivel_educativo} full>
              <input
                type="text"
                value={miembro.nivel_educativo}
                onChange={e => set('nivel_educativo', e.target.value)}
                placeholder="Ej. Bachiller, Técnico, Universitario"
                className={inputCls()}
              />
            </Field>

            <Field label="Situación laboral" error={errores.situacion_laboral}>
              <select
                value={miembro.situacion_laboral}
                onChange={e => set('situacion_laboral', e.target.value as MiembroHogarForm['situacion_laboral'])}
                className={inputCls()}
              >
                <option value="">Seleccione...</option>
                {SITUACION_LABORAL_OPTIONS.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Ingresos mensuales (COP)" error={errores.ingresos_mensuales}>
              <input
                type="number"
                min={0}
                step={1000}
                value={miembro.ingresos_mensuales}
                onChange={e => set('ingresos_mensuales', e.target.value)}
                placeholder="Ej. 1160000"
                className={inputCls()}
              />
            </Field>

            <Field label="Fuente de ingresos" error={errores.fuente_ingresos}>
              <input
                type="text"
                value={miembro.fuente_ingresos}
                onChange={e => set('fuente_ingresos', e.target.value)}
                placeholder="Ej. Empleo formal, ventas, etc."
                className={inputCls()}
              />
            </Field>
          </div>
        )}
      </div>

      {/* ══ 4. AFILIACIÓN SISBEN ════════════════════════════════════════════ */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <AccordionHeader id="sisben" titulo="Afiliación SISBEN" />
        </div>
        {secAbiertas.has('sisben') && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="¿Pertenece al SISBEN?" error={errores.pertenece_sisben}>
              <BooleanSelect
                value={miembro.pertenece_sisben}
                onChange={v => set('pertenece_sisben', v)}
                error={errores.pertenece_sisben}
              />
            </Field>

            {miembro.pertenece_sisben === true && (
              <>
                <Field label="Grupo SISBEN" error={errores.grupo_sisben}>
                  <input
                    type="text"
                    value={miembro.grupo_sisben}
                    onChange={e => set('grupo_sisben', e.target.value)}
                    placeholder="Ej. A1, B3, C12"
                    className={inputCls()}
                    maxLength={10}
                  />
                </Field>

                <Field label="Puntaje SISBEN" error={errores.puntaje_sisben}>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={miembro.puntaje_sisben}
                    onChange={e => set('puntaje_sisben', e.target.value)}
                    placeholder="Ej. 35.50"
                    className={inputCls()}
                  />
                </Field>
              </>
            )}
          </div>
        )}
      </div>

      {/* ══ 5. CONDICIONES ESPECIALES ═══════════════════════════════════════ */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <AccordionHeader id="condiciones" titulo="Condiciones especiales" />
        </div>
        {secAbiertas.has('condiciones') && (
          <div className="p-4 flex flex-col gap-4">

            {/* — Discapacidad ————————————————————————————————— */}
            <CondicionToggle
              id={`disc-${miembro._localId}`}
              label="Tiene alguna discapacidad"
              checked={miembro.tiene_discapacidad}
              onChange={v => set('tiene_discapacidad', v)}
            />
            {miembro.tiene_discapacidad && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-amber-300">
                <SeccionHeader title="Discapacidad" />
                <Field label="Grado de discapacidad">
                  <input
                    type="text"
                    value={miembro.grado_discapacidad}
                    onChange={e => set('grado_discapacidad', e.target.value)}
                    placeholder="Ej. Moderada, Severa"
                    className={inputCls()}
                  />
                </Field>
                <Field label="¿Tiene certificado de discapacidad?">
                  <BooleanSelect
                    value={miembro.certificado_discapacidad}
                    onChange={v => set('certificado_discapacidad', v)}
                  />
                </Field>
                {miembro.certificado_discapacidad && (
                  <Field label="Número del certificado">
                    <input
                      type="text"
                      value={miembro.numero_certificado}
                      onChange={e => set('numero_certificado', e.target.value)}
                      className={inputCls()}
                    />
                  </Field>
                )}
              </div>
            )}

            {/* — Víctima del conflicto ———————————————————————— */}
            <CondicionToggle
              id={`vic-${miembro._localId}`}
              label="Es víctima del conflicto armado"
              checked={miembro.es_victima_conflicto}
              onChange={v => set('es_victima_conflicto', v)}
            />
            {miembro.es_victima_conflicto && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-amber-300">
                <SeccionHeader title="Víctima del conflicto" />
                <Field label="Número RUV">
                  <input
                    type="text"
                    value={miembro.numero_ruv}
                    onChange={e => set('numero_ruv', e.target.value)}
                    className={inputCls()}
                  />
                </Field>
                <Field label="Hecho victimizante">
                  <input
                    type="text"
                    value={miembro.hecho_victimizante}
                    onChange={e => set('hecho_victimizante', e.target.value)}
                    placeholder="Ej. Desplazamiento, homicidio"
                    className={inputCls()}
                  />
                </Field>
                <Field label="Fecha del hecho victimizante">
                  <input
                    type="date"
                    value={miembro.fecha_hecho_victimizante}
                    onChange={e => set('fecha_hecho_victimizante', e.target.value)}
                    className={inputCls()}
                  />
                </Field>
              </div>
            )}

            {/* — Desplazamiento —————————————————————————————— */}
            <CondicionToggle
              id={`desp-${miembro._localId}`}
              label="Es persona desplazada"
              checked={miembro.es_desplazado}
              onChange={v => set('es_desplazado', v)}
            />
            {miembro.es_desplazado && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-amber-300">
                <SeccionHeader title="Desplazamiento" />
                <Field label="Fecha de desplazamiento">
                  <input
                    type="date"
                    value={miembro.fecha_desplazamiento}
                    onChange={e => set('fecha_desplazamiento', e.target.value)}
                    className={inputCls()}
                  />
                </Field>
                <Field label="Municipio de origen">
                  <input
                    type="text"
                    value={miembro.municipio_origen}
                    onChange={e => set('municipio_origen', e.target.value)}
                    className={inputCls()}
                  />
                </Field>
                <Field label="Departamento de origen">
                  <input
                    type="text"
                    value={miembro.departamento_origen}
                    onChange={e => set('departamento_origen', e.target.value)}
                    className={inputCls()}
                  />
                </Field>
                <Field label="Motivo del desplazamiento" full>
                  <input
                    type="text"
                    value={miembro.motivo_desplazamiento}
                    onChange={e => set('motivo_desplazamiento', e.target.value)}
                    className={inputCls()}
                  />
                </Field>
              </div>
            )}

            {/* — Firmante de paz ———————————————————————————————— */}
            <CondicionToggle
              id={`paz-${miembro._localId}`}
              label="Es firmante de paz (proceso de reincorporación)"
              checked={miembro.es_firmante_paz}
              onChange={v => set('es_firmante_paz', v)}
            />
            {miembro.es_firmante_paz && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-amber-300">
                <SeccionHeader title="Proceso de reincorporación" />
                <Field label="Código de reincorporación">
                  <input
                    type="text"
                    value={miembro.codigo_reincorporacion}
                    onChange={e => set('codigo_reincorporacion', e.target.value)}
                    className={inputCls()}
                  />
                </Field>
                <Field label="ETCR de procedencia">
                  <input
                    type="text"
                    value={miembro.etcr}
                    onChange={e => set('etcr', e.target.value)}
                    placeholder="Espacio territorial de capacitación y reincorporación"
                    className={inputCls()}
                  />
                </Field>
                <Field label="Estado del proceso" full>
                  <input
                    type="text"
                    value={miembro.estado_proceso_reincorporacion}
                    onChange={e => set('estado_proceso_reincorporacion', e.target.value)}
                    className={inputCls()}
                  />
                </Field>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ 6. DOCUMENTOS DEL MIEMBRO ══════════════════════════════════════ */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <AccordionHeader id="docs-miembro" titulo="Documentos del miembro" />
        </div>
        {secAbiertas.has('docs-miembro') && (
          <div className="p-4 flex flex-col gap-3">
            {miembro.documentos.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-2">
                Sin documentos agregados. Use el botón para adjuntar archivos.
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
                    actualizarDoc(i, {
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
                  <span className="text-sm text-gray-500 truncate">
                    {doc.file ? doc.file.name : 'Seleccionar archivo...'}
                  </span>
                  <input
                    type="file"
                    className="sr-only"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => actualizarDoc(i, { file: e.target.files?.[0] ?? null })}
                  />
                </label>

                <input
                  type="text"
                  value={doc.observaciones}
                  onChange={e => actualizarDoc(i, { observaciones: e.target.value })}
                  placeholder="Observaciones..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <button
                  type="button"
                  onClick={() => eliminarDoc(i)}
                  className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Eliminar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={agregarDocMiembro}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium mt-1 w-fit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Agregar documento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
