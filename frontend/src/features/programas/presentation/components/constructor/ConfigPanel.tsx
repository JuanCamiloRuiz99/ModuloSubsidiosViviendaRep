import React from 'react';
import type { CampoCatalogo, CampoConfig } from '../../../domain/formulario';
import { Toggle } from '../../../../../shared/presentation/components/forms/Toggle';

interface ConfigPanelProps {
  activeField: CampoCatalogo | null;
  activeConfig: CampoConfig | null;
  onUpdate: (fieldId: string, patch: Partial<CampoConfig>) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ activeField, activeConfig, onUpdate }) => (
  <div className="w-72 flex-shrink-0 bg-white flex flex-col overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100">
      <h2 className="text-sm font-semibold text-gray-800">Configuración del Campo</h2>
      <p className="text-xs text-gray-400 mt-0.5">Ajuste las propiedades del campo</p>
    </div>

    <div className="flex-1 overflow-y-auto px-5 py-4">
      {!activeField || !activeConfig ? (
        <p className="text-sm text-gray-400 text-center mt-12">
          Seleccione un campo del formulario para configurarlo
        </p>
      ) : (
        <div className="space-y-5">
          {/* Nombre del campo — solo lectura */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Nombre del campo
            </p>
            <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50">
              {activeField.label}
            </div>
          </div>

          {/* Campo obligatorio */}
          <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <span>🔒</span> Campo obligatorio
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                El ciudadano debe completar este campo
              </p>
            </div>
            <Toggle
              checked={activeConfig.obligatorio}
              onChange={v => onUpdate(activeField.id, { obligatorio: v })}
            />
          </div>

          {/* Texto de ayuda */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Texto de ayuda (opcional)
            </label>
            <textarea
              value={activeConfig.texto_ayuda}
              onChange={e => onUpdate(activeField.id, { texto_ayuda: e.target.value })}
              placeholder="Instrucciones adicionales para el ciudadano..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        </div>
      )}
    </div>
  </div>
);
