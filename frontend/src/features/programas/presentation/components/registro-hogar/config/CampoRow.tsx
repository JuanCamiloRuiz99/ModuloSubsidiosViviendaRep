/**
 * CampoRow — Fila de un campo configurable dentro de una sección.
 * Muestra el nombre del campo y dos toggles: Habilitado y Obligatorio.
 */
import React from 'react';
import type { CampoDefinicion } from './secciones-data';

export interface CampoConfig {
  requerido: boolean;
  habilitado: boolean;
}

interface CampoRowProps {
  campo: CampoDefinicion;
  config: CampoConfig;
  onChange: (campoId: string, next: CampoConfig) => void;
}

const Toggle: React.FC<{
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  label: string;
  colorOn: string;
}> = ({ checked, disabled = false, onChange, label, colorOn }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
      disabled
        ? 'opacity-40 cursor-not-allowed bg-gray-200'
        : checked
        ? `${colorOn} focus:ring-${colorOn.split('-')[1]}-400`
        : 'bg-gray-200 focus:ring-gray-300'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
        checked ? 'translate-x-4' : 'translate-x-0'
      }`}
    />
  </button>
);

export const CampoRow: React.FC<CampoRowProps> = ({ campo, config, onChange }) => {
  const isDisabled = !config.habilitado;

  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isDisabled ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50'}`}>
      {/* Nombre del campo */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${isDisabled ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
          {campo.label}
        </p>
      </div>

      {/* Toggle: Habilitado */}
      <div className="flex flex-col items-center gap-0.5">
        <Toggle
          checked={config.habilitado}
          onChange={(v) => onChange(campo.id, { ...config, habilitado: v, requerido: v ? config.requerido : false })}
          label={`Habilitar ${campo.label}`}
          colorOn="bg-teal-500"
        />
        <span className="text-[10px] text-gray-400">Activo</span>
      </div>

      {/* Toggle: Obligatorio */}
      <div className="flex flex-col items-center gap-0.5">
        <Toggle
          checked={config.requerido}
          disabled={!config.habilitado}
          onChange={(v) => onChange(campo.id, { ...config, requerido: v })}
          label={`Obligatorio ${campo.label}`}
          colorOn="bg-red-400"
        />
        <span className="text-[10px] text-gray-400">Obligatorio</span>
      </div>
    </div>
  );
};
