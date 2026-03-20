import React from 'react';
import type { CampoPreview } from '../../../domain/formulario';
import { SECCIONES, SELECT_OPTIONS } from '../../../domain/formulario';

interface PreviewModalProps {
  camposPreview: CampoPreview[];
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ camposPreview, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div>
          <h2 className="text-base font-bold text-gray-900">Vista Previa del Formulario</h2>
          <p className="text-xs text-gray-400 mt-0.5">Así verá el ciudadano el formulario</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {SECCIONES.map(seccion => {
          const camposSec = camposPreview.filter(c => c.seccion === seccion);
          if (camposSec.length === 0) return null;
          return (
            <div key={seccion} className="mb-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                {seccion}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {camposSec.map(campo => (
                  <div key={campo.id} className={campo.type === 'email' ? 'col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {campo.label}
                      {campo.obligatorio && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {campo.type === 'select' ? (
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <option value="">Seleccione una opción...</option>
                        {(SELECT_OPTIONS[campo.id] ?? []).map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : campo.type === 'date' ? (
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    ) : campo.type === 'email' ? (
                      <input
                        type="email"
                        placeholder={`Ingrese ${campo.label.toLowerCase()}`}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={campo.texto_ayuda || `Ingrese ${campo.label.toLowerCase()}`}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    )}
                    {campo.texto_ayuda && (
                      <p className="text-xs text-gray-400 mt-1">{campo.texto_ayuda}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-6 py-4 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cerrar previsualización
        </button>
      </div>
    </div>
  </div>
);
