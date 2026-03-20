import React, { useState, useEffect, useMemo } from 'react';
import type { EtapaData, ModuloPrincipal } from '../../infrastructure/persistence/axios-etapa-repository';
import { MODULO_CONFIG, ETAPAS_DISPONIBLES, MODULOS_OPCIONES, ETAPA_MODULO } from '../etapa-config';

interface FormState {
  numero_etapa: string;
  modulo_principal: ModuloPrincipal;
}

export interface ModalNuevaEtapaProps {
  editando: EtapaData | null;
  onClose: () => void;
  onSave: (form: FormState) => Promise<void>;
  isSaving: boolean;
  /** Número de la siguiente etapa a crear. Determina cuáles botones están habilitados. */
  nextNumero: number;
}

export type { FormState as EtapaFormState };

export const ModalNuevaEtapa: React.FC<ModalNuevaEtapaProps> = ({
  editando,
  onClose,
  onSave,
  isSaving,
  nextNumero,
}) => {
  const formInicial = useMemo<FormState>(
    () => ({
      numero_etapa: String(nextNumero),
      modulo_principal: ETAPA_MODULO[nextNumero] ?? 'REGISTRO_HOGAR',
    }),
    [nextNumero],
  );

  const [form, setForm] = useState<FormState>(
    editando
      ? { numero_etapa: String(editando.numero_etapa), modulo_principal: editando.modulo_principal }
      : formInicial,
  );

  useEffect(() => {
    setForm(
      editando
        ? { numero_etapa: String(editando.numero_etapa), modulo_principal: editando.modulo_principal }
        : formInicial,
    );
  }, [editando, formInicial]);

  const handleSelectEtapa = (numero: number) => {
    setForm({ numero_etapa: String(numero), modulo_principal: ETAPA_MODULO[numero] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  const etapaSeleccionada = parseInt(form.numero_etapa, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {editando ? 'Editar etapa' : 'Nueva etapa'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Selector de etapa */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Número de etapa <span className="text-red-500">*</span>
            </p>
            <div className="flex gap-2">
              {ETAPAS_DISPONIBLES.map(({ numero }) => {
                const habilitada = numero <= nextNumero;
                const seleccionada = etapaSeleccionada === numero;
                return (
                  <button
                    key={numero}
                    type="button"
                    disabled={!habilitada || isSaving}
                    onClick={() => habilitada && handleSelectEtapa(numero)}
                    className={[
                      'flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all',
                      seleccionada
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : habilitada
                          ? 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                          : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed',
                    ].join(' ')}
                  >
                    Etapa {numero}
                    {!habilitada && (
                      <span className="block text-[10px] font-normal mt-0.5 text-gray-300">
                        Próximamente
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de módulo */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Módulo principal <span className="text-red-500">*</span>
            </p>
            <div className="flex flex-col gap-2">
              {MODULOS_OPCIONES.map(({ value, label, etapa }) => {
                const habilitada = etapa <= nextNumero;
                const seleccionado = form.modulo_principal === value;
                const cfg = MODULO_CONFIG[value];
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!habilitada || isSaving}
                    onClick={() => habilitada && handleSelectEtapa(etapa)}
                    className={[
                      'flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all',
                      seleccionado
                        ? `${cfg.cardBorder} ${cfg.iconBg} shadow-sm`
                        : habilitada
                          ? 'border-gray-200 hover:border-blue-300 bg-white'
                          : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50',
                    ].join(' ')}
                  >
                    <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${seleccionado ? cfg.iconBg : 'bg-gray-100'} ${seleccionado ? cfg.iconColor : 'text-gray-300'}`}>
                      {cfg.icon}
                    </div>
                    <span className={`flex-1 text-sm font-medium ${seleccionado ? 'text-gray-900' : habilitada ? 'text-gray-700' : 'text-gray-400'}`}>
                      {label}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${seleccionado ? cfg.badge : 'bg-gray-100 text-gray-400'}`}>
                        Etapa {etapa}
                      </span>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${seleccionado ? 'border-blue-600' : 'border-gray-300'}`}>
                        {seleccionado && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear etapa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
