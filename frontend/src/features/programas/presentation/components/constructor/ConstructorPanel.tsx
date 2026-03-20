import React from 'react';
import { CAMPOS_CATALOGO } from '../../../domain/formulario';
import type { CampoConfig } from '../../../domain/formulario';

interface ConstructorPanelProps {
  selectedIds: string[];
  configs: Record<string, CampoConfig>;
  activeFieldId: string | null;
  onSelectField: (fieldId: string) => void;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
}

export const ConstructorPanel: React.FC<ConstructorPanelProps> = ({
  selectedIds,
  configs,
  activeFieldId,
  onSelectField,
  onDragStart,
  onDragEnter,
  onDragEnd,
}) => (
  <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 border-r border-gray-200">
    <div className="px-6 py-4 bg-white border-b border-gray-100">
      <h2 className="text-sm font-semibold text-gray-800">Formulario en Construcción</h2>
      <p className="text-xs text-gray-400 mt-0.5">
        {selectedIds.length > 0
          ? `${selectedIds.length} campo${selectedIds.length > 1 ? 's' : ''} seleccionado${selectedIds.length > 1 ? 's' : ''}. Arrastre para reordenar.`
          : 'Seleccione campos del catálogo para comenzar.'}
      </p>
    </div>

    <div className="flex-1 overflow-y-auto p-4">
      {selectedIds.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-12">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 text-sm font-medium">Sin campos seleccionados</p>
          <p className="text-gray-400 text-xs mt-1">Marque campos del catálogo de la izquierda</p>
        </div>
      ) : (
        <div className="space-y-2">
          {selectedIds.map((fieldId, index) => {
            const field = CAMPOS_CATALOGO.find(f => f.id === fieldId)!;
            const isActive = activeFieldId === fieldId;
            // configs is used to show field state in the future; accessed via prop to avoid stale reads
            void configs;
            return (
              <div
                key={fieldId}
                draggable
                onDragStart={() => onDragStart(index)}
                onDragEnter={() => onDragEnter(index)}
                onDragEnd={onDragEnd}
                onDragOver={e => e.preventDefault()}
                onClick={() => onSelectField(fieldId)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-white cursor-pointer transition-all select-none ${
                  isActive
                    ? 'border-2 border-blue-400 shadow-sm'
                    : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <span className="text-gray-300 text-lg cursor-grab leading-none select-none flex-shrink-0">
                  ⠿
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{field.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{field.type}</p>
                </div>
                <span className="text-xs text-gray-400 font-mono flex-shrink-0">
                  #{index + 1}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
