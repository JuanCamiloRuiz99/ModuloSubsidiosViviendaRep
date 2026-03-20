import React from 'react';
import { CAMPOS_CATALOGO, SECCIONES } from '../../../domain/formulario';

interface CatalogoPanelProps {
  selectedIds: string[];
  onToggle: (fieldId: string) => void;
}

export const CatalogoPanel: React.FC<CatalogoPanelProps> = ({ selectedIds, onToggle }) => (
  <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
    <div className="px-4 pt-4 pb-3 border-b border-gray-100">
      <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm mb-0.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Catálogo de Campos
      </div>
      <p className="text-xs text-gray-400">Seleccione los campos que desea incluir</p>
    </div>

    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
      {SECCIONES.map(seccion => {
        const campos = CAMPOS_CATALOGO.filter(f => f.seccion === seccion);
        return (
          <div key={seccion}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              {seccion}
            </p>
            <div className="space-y-1">
              {campos.map(campo => {
                const isSelected = selectedIds.includes(campo.id);
                return (
                  <label
                    key={campo.id}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggle(campo.id)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium leading-tight truncate ${
                        isSelected ? 'text-blue-700' : 'text-gray-800'
                      }`}>
                        {campo.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Tipo: {campo.type}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
