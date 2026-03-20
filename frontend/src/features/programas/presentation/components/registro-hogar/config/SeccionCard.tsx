/**
 * SeccionCard — Tarjeta expandible para una seccion del formulario de Registro del Hogar.
 *
 * - Campos configurables: se muestran con toggles Activo / Obligatorio.
 * - Campos fijos del sistema (camposFijos): se listan como chips de referencia.
 * - Secciones solo informativas (soloInformativa): muestran un aviso en lugar de campos.
 */
import React, { useState } from 'react';
import type { SeccionConfig } from './secciones-data';
import { CampoRow, type CampoConfig } from './CampoRow';

export type ConfigCampos = Record<string, CampoConfig>;

interface SeccionCardProps {
  seccion: SeccionConfig;
  configCampos: ConfigCampos;
  onConfigChange: (campoId: string, next: CampoConfig) => void;
  readOnly?: boolean;
}

export const SeccionCard: React.FC<SeccionCardProps> = ({
  seccion,
  configCampos,
  onConfigChange,
  readOnly = false,
}) => {
  const [abierto, setAbierto] = useState(false);
  const cc = seccion.colorClasses;
  const totalConfigurables = seccion.grupos.reduce((s, g) => s + g.campos.length, 0);

  return (
    <div className={`rounded-xl border-2 ${cc.border} overflow-hidden transition-shadow hover:shadow-md`}>
      {/* Cabecera */}
      <button
        type="button"
        onClick={() => setAbierto(prev => !prev)}
        className={`w-full flex items-center gap-4 px-5 py-4 ${cc.header} text-left`}
      >
        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${cc.numero}`}>
          {seccion.numero}
        </span>
        <span className={`flex-shrink-0 ${cc.icon}`}>{seccion.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-gray-800 text-sm">{seccion.label}</span>
            {seccion.obligatoria ? (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cc.badge}`}>Obligatoria</span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-500">Opcional</span>
            )}
            {seccion.soloInformativa ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-semibold">
                Solo informativa
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 text-gray-500 font-medium">
                {totalConfigurables} campo{totalConfigurables !== 1 ? 's' : ''} configurables
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{seccion.descripcion}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-gray-400 hidden sm:block font-mono">{seccion.tabla}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Contenido expandido */}
      {abierto && (
        <div className="px-5 pb-5 pt-3 bg-white">
          {seccion.soloInformativa ? (
            /* Seccion solo informativa */
            <div className="flex flex-col items-center gap-3 py-6 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-center">
                Esta seccion es un paso de confirmacion automatico.
                <br />
                <span className="text-xs">No tiene campos configurables.</span>
              </p>
            </div>
          ) : (
            /* Seccion con campos configurables */
            <div className="flex flex-col gap-5">
              {/* Chips de campos fijos */}
              {seccion.camposFijos && seccion.camposFijos.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mr-1 shrink-0">
                    Fijos del sistema:
                  </span>
                  {seccion.camposFijos.map(cf => (
                    <span
                      key={cf.label}
                      className="text-[11px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full"
                    >
                      {cf.label}
                    </span>
                  ))}
                  <span className="text-[11px] text-gray-400 italic mt-0.5 w-full sm:w-auto sm:ml-1">
                    — siempre activos y obligatorios
                  </span>
                </div>
              )}

              {/* Leyenda */}
              <div className="flex items-center gap-4 justify-end text-[11px] text-gray-400 border-b border-gray-100 pb-2">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-2.5 rounded-full bg-teal-500" /> Activo
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-2.5 rounded-full bg-red-400" /> Obligatorio
                </span>
              </div>

              {/* Grupos de campos */}
              {seccion.grupos.map(grupo => (
                <div key={grupo.titulo}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{grupo.titulo}</p>
                  <div className="flex flex-col divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                    {grupo.campos.map(campo => {
                      const cfg = configCampos[campo.id] ?? { requerido: campo.requeridoPorDefecto, habilitado: true };
                      return (
                        <CampoRow
                          key={campo.id}
                          campo={campo}
                          config={cfg}
                          onChange={readOnly ? () => undefined : onConfigChange}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
