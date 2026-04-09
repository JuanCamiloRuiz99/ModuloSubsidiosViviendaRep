/**
 * SeccionInfoHogar — Paso 1 del formulario de Registro del Hogar.
 *
 * Cubre los campos de gestion_hogar_etapa1:
 *   Ubicación · Predio · Servicios públicos · Info adicional · Términos
 */

import React from 'react';
import type { InfoHogarForm } from '../../../domain/registro-hogar.types';
import { TIEMPO_RESIDENCIA_OPTIONS, COMUNAS_POPAYAN } from '../../../domain/registro-hogar.types';

export type ErroresInfoHogar = Partial<Record<keyof InfoHogarForm, string>>;

interface Props {
  data: InfoHogarForm;
  onChange: (data: InfoHogarForm) => void;
  errores: ErroresInfoHogar;
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
  <div className={full ? 'sm:col-span-2' : ''}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="sm:col-span-2 mt-2 -mb-1">
    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 pb-2 border-b border-gray-100">
      {title}
    </p>
  </div>
);

const BooleanSelect: React.FC<{
  value: boolean | null;
  onChange: (v: boolean | null) => void;
  error?: string;
  placeholder?: string;
}> = ({ value, onChange, error, placeholder = 'Seleccione...' }) => (
  <select
    value={value === null ? '' : value ? '1' : '0'}
    onChange={e => {
      const v = e.target.value;
      onChange(v === '' ? null : v === '1');
    }}
    className={inputCls(error)}
  >
    <option value="">{placeholder}</option>
    <option value="1">Sí</option>
    <option value="0">No</option>
  </select>
);

// ── Componente principal ──────────────────────────────────────────────────── //

export const SeccionInfoHogar: React.FC<Props> = ({ data, onChange, errores }) => {
  const set = <K extends keyof InfoHogarForm>(key: K, val: InfoHogarForm[K]) =>
    onChange({ ...data, [key]: val });

  const handleZona = (zona: InfoHogarForm['zona']) => {
    // zona y tipo_predio deben coincidir (CHECK constraint)
    onChange({ ...data, zona, tipo_predio: zona });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {/* ── UBICACIÓN ─────────────────────────────────────── */}
      <SectionHeader title="Ubicación del predio" />

      <Field label="Departamento" required error={errores.departamento}>
        <input
          type="text"
          value={data.departamento}
          readOnly
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-400">Campo fijo — Alcaldía de Popayán</p>
      </Field>

      <Field label="Municipio" required error={errores.municipio}>
        <input
          type="text"
          value={data.municipio}
          readOnly
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-400">Campo fijo — Alcaldía de Popayán</p>
      </Field>

      <Field label="Zona" required error={errores.zona}>
        <select
          value={data.zona}
          onChange={e => handleZona(e.target.value as InfoHogarForm['zona'])}
          className={inputCls(errores.zona)}
        >
          <option value="">Seleccione...</option>
          <option value="URBANA">Urbana</option>
          <option value="RURAL">Rural</option>
        </select>
      </Field>

      <Field label="Comuna / Corregimiento" error={errores.comuna}>
        <select
          value={data.comuna}
          onChange={e => set('comuna', e.target.value)}
          className={inputCls(errores.comuna)}
        >
          <option value="">Seleccione...</option>
          {COMUNAS_POPAYAN.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Barrio / Vereda" error={errores.barrio_vereda}>
        <input
          type="text"
          value={data.barrio_vereda}
          onChange={e => set('barrio_vereda', e.target.value)}
          placeholder="Ej. El Poblado"
          className={inputCls(errores.barrio_vereda)}
        />
      </Field>

      <Field label="Dirección" required full error={errores.direccion}>
        <input
          type="text"
          value={data.direccion}
          onChange={e => set('direccion', e.target.value)}
          placeholder="Ej. Cra 50 # 45-12"
          className={inputCls(errores.direccion)}
        />
      </Field>

      <Field label="Observaciones de dirección" full error={errores.observaciones_direccion}>
        <input
          type="text"
          value={data.observaciones_direccion}
          onChange={e => set('observaciones_direccion', e.target.value)}
          placeholder="Punto de referencia, conjunto, apto, etc."
          className={inputCls(errores.observaciones_direccion)}
        />
      </Field>

      {/* ── PREDIO ────────────────────────────────────────── */}
      <SectionHeader title="Información del predio" />

      {data.zona === 'URBANA' && (
        <Field label="Estrato" required error={errores.estrato}>
          <select
            value={data.estrato}
            onChange={e => set('estrato', e.target.value)}
            className={inputCls(errores.estrato)}
          >
            <option value="">Seleccione...</option>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={String(n)}>Estrato {n}</option>
            ))}
          </select>
        </Field>
      )}

      <Field label="¿Es propietario del predio?" error={errores.es_propietario}>
        <BooleanSelect
          value={data.es_propietario}
          onChange={v => set('es_propietario', v)}
          error={errores.es_propietario}
        />
      </Field>

      {data.es_propietario === true && (
        <>
          <Field label="Número predial" error={errores.numero_predial}>
            <input
              type="text"
              value={data.numero_predial}
              onChange={e => set('numero_predial', e.target.value)}
              placeholder="Ej. 05001010001000"
              className={inputCls(errores.numero_predial)}
            />
          </Field>

          <Field label="Matrícula inmobiliaria" error={errores.matricula_inmobiliaria}>
            <input
              type="text"
              value={data.matricula_inmobiliaria}
              onChange={e => set('matricula_inmobiliaria', e.target.value)}
              placeholder="Ej. 001-01234"
              className={inputCls(errores.matricula_inmobiliaria)}
            />
          </Field>

          <Field label="Avalúo catastral (COP)" error={errores.avaluo_catastral}>
            <input
              type="number"
              min={0}
              step={1000}
              value={data.avaluo_catastral}
              onChange={e => set('avaluo_catastral', e.target.value)}
              placeholder="Ej. 85000000"
              className={inputCls(errores.avaluo_catastral)}
            />
          </Field>
        </>
      )}

      {/* ── SERVICIOS PÚBLICOS ────────────────────────────── */}
      <SectionHeader title="Servicios públicos" />

      <Field label="Número matrícula agua" error={errores.numero_matricula_agua}>
        <input
          type="text"
          value={data.numero_matricula_agua}
          onChange={e => set('numero_matricula_agua', e.target.value)}
          placeholder="Ej. 12345678"
          className={inputCls(errores.numero_matricula_agua)}
        />
      </Field>

      <Field label="Número contrato energía" error={errores.numero_contrato_energia}>
        <input
          type="text"
          value={data.numero_contrato_energia}
          onChange={e => set('numero_contrato_energia', e.target.value)}
          placeholder="Ej. 87654321"
          className={inputCls(errores.numero_contrato_energia)}
        />
      </Field>

      {/* ── INFORMACIÓN ADICIONAL ─────────────────────────── */}
      <SectionHeader title="Información adicional" />

      <Field label="Tiempo de residencia en el predio" error={errores.tiempo_residencia}>
        <select
          value={data.tiempo_residencia}
          onChange={e => set('tiempo_residencia', e.target.value)}
          className={inputCls(errores.tiempo_residencia)}
        >
          <option value="">Seleccione...</option>
          {TIEMPO_RESIDENCIA_OPTIONS.map(op => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
      </Field>

      <Field label="¿Tiene personas a cargo (dependientes)?" error={errores.tiene_dependientes}>
        <BooleanSelect
          value={data.tiene_dependientes}
          onChange={v => set('tiene_dependientes', v)}
          error={errores.tiene_dependientes}
        />
      </Field>

      <Field
        label="¿Hay personas con discapacidad en el hogar?"
        error={errores.personas_con_discapacidad_hogar}
      >
        <BooleanSelect
          value={data.personas_con_discapacidad_hogar}
          onChange={v => set('personas_con_discapacidad_hogar', v)}
          error={errores.personas_con_discapacidad_hogar}
        />
      </Field>

      {/* ── TÉRMINOS Y CONDICIONES ────────────────────────── */}
      <div className="sm:col-span-2 mt-4">
        <label
          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
            data.acepta_terminos_condiciones
              ? 'border-blue-400 bg-blue-50'
              : errores.acepta_terminos_condiciones
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="checkbox"
            checked={data.acepta_terminos_condiciones}
            onChange={e => set('acepta_terminos_condiciones', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
          />
          <span className="text-sm text-gray-700 leading-snug">
            Declaro que la información suministrada es verídica y autorizo el tratamiento
            de mis datos personales de conformidad con la Ley 1581 de 2012 y las
            políticas de privacidad de la institución.{' '}
            <span className="text-red-500 font-semibold">*</span>
          </span>
        </label>
        {errores.acepta_terminos_condiciones && (
          <p className="mt-1 text-xs text-red-500">{errores.acepta_terminos_condiciones}</p>
        )}
      </div>
    </div>
  );
};
