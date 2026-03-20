/**
 * EtapasManager — Gestión manual de etapas de proceso de un programa
 */

import React, { useState } from 'react';
import { useEtapas, useCrearEtapa, useActualizarEtapa } from '../hooks';
import type { EtapaData } from '../../infrastructure/persistence/axios-etapa-repository';
import { EtapaCard } from './EtapaCard';
import { ModalNuevaEtapa } from './ModalNuevaEtapa';
import { Toast } from '../../../../shared/presentation/components/alerts/Toast';
import type { EtapaFormState } from './ModalNuevaEtapa';

interface EtapasManagerProps {
  programaId: string | number;
  programaNombre: string;
  programaDescripcion: string;
  onVolver?: () => void;
}

export const EtapasManager: React.FC<EtapasManagerProps> = ({
  programaId,
  programaNombre,
  programaDescripcion,
  onVolver,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editandoEtapa, setEditandoEtapa] = useState<EtapaData | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const { data: etapas = [], isLoading, error } = useEtapas(programaId);

  // Número de la siguiente etapa disponible para crear
  const nextNumero = etapas.length + 1;
  const ultimaEtapa = etapas[etapas.length - 1];
  const ultimaEtapaPublicada =
    ultimaEtapa?.formulario_estado === 'PUBLICADO' ||
    ultimaEtapa?.registro_hogar_publicado === true;
  const puedeCrearNuevaEtapa =
    etapas.length === 0 || ultimaEtapaPublicada;

  const crearMutation = useCrearEtapa(programaId);
  const actualizarMutation = useActualizarEtapa(programaId);
  const isSaving = crearMutation.isPending || actualizarMutation.isPending;

  const handleCerrarModal = () => {
    setShowModal(false);
    setEditandoEtapa(null);
  };

  const handleSave = async (form: EtapaFormState) => {
    const numero = parseInt(form.numero_etapa, 10);
    if (isNaN(numero) || numero < 1) return;
    try {
      if (editandoEtapa) {
        await actualizarMutation.mutateAsync({
          id: editandoEtapa.id,
          payload: { numero_etapa: numero, modulo_principal: form.modulo_principal },
        });
        showToast('✅ Etapa actualizada exitosamente');
      } else {
        await crearMutation.mutateAsync({
          programa: Number(programaId),
          numero_etapa: numero,
          modulo_principal: form.modulo_principal,
        });
        showToast('✅ Etapa creada exitosamente');
      }
      handleCerrarModal();
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Error al guardar etapa'}`, 'error');
    }
  };

  return (
    <>
      {showModal && (
        <ModalNuevaEtapa
          editando={editandoEtapa}
          onClose={handleCerrarModal}
          onSave={handleSave}
          isSaving={isSaving}
          nextNumero={editandoEtapa ? editandoEtapa.numero_etapa : nextNumero}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}

      <button
        onClick={onVolver}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-6 transition-colors font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver a Programas
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{programaNombre}</h1>
        <p className="text-gray-500 text-sm leading-relaxed">{programaDescripcion}</p>
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Gestión de etapas</h2>
        <div className="relative group">
          <button
            onClick={() => { if (puedeCrearNuevaEtapa) { setEditandoEtapa(null); setShowModal(true); } }}
            disabled={!puedeCrearNuevaEtapa}
            title={puedeCrearNuevaEtapa ? undefined : `Publica la Etapa ${ultimaEtapa?.numero_etapa ?? ''} antes de crear una nueva`}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${
              puedeCrearNuevaEtapa
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                : 'bg-blue-300 cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva etapa
          </button>
          {!puedeCrearNuevaEtapa && (
            <div className="absolute right-0 top-full mt-1 z-10 hidden group-hover:block w-max max-w-xs bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none">
              Publica la Etapa {ultimaEtapa?.numero_etapa} para poder crear la siguiente
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando etapas...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          Error al cargar etapas: {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      ) : etapas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="text-3xl mb-3">📋</div>
          <p className="text-gray-500 font-medium mb-1">No hay etapas configuradas</p>
          <p className="text-gray-400 text-sm">Crea la primera etapa usando el botón "Nueva etapa".</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {etapas.map(etapa => (
            <EtapaCard key={etapa.id} etapa={etapa} programaId={programaId} />
          ))}
        </div>
      )}
    </>
  );
};


