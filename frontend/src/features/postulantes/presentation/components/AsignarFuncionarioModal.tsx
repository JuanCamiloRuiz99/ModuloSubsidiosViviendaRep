/**
 * AsignarFuncionarioModal – Modal para asignar una postulación
 * individual a un funcionario específico.
 */

import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  useFuncionariosActivos,
  useAsignarIndividual,
} from '../hooks/use-distribuir';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  postulacionId: number | null;
  radicado: string;
  solicitante: string;
  funcionarioActualId?: number | null;
}

export const AsignarFuncionarioModal: React.FC<Props> = ({
  isOpen,
  onClose,
  postulacionId,
  radicado,
  solicitante,
  funcionarioActualId,
}) => {
  const { funcionarios, isLoading: loadingFuncionarios } = useFuncionariosActivos();
  const asignar = useAsignarIndividual();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAsignar = async () => {
    if (!selectedId || !postulacionId) return;
    setErrorMsg(null);
    try {
      await asignar.mutateAsync({
        postulacion_id: postulacionId,
        funcionario_id: selectedId,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Error al asignar la postulación',
      );
    }
  };

  const handleClose = () => {
    setSelectedId(null);
    setSuccess(false);
    setErrorMsg(null);
    onClose();
  };

  const funcionarioSeleccionado = funcionarios.find(f => f.id_usuario === selectedId);

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => { if (!open) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto z-50 p-0">

          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <Dialog.Title className="text-lg font-bold text-gray-900">
              Asignar Funcionario
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-full p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          <div className="px-6 py-5 space-y-4">

            {/* Info de la postulación */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-1">
              <p className="text-xs text-gray-500">Postulación</p>
              <p className="text-sm font-semibold text-gray-900">{radicado}</p>
              <p className="text-sm text-gray-600">{solicitante}</p>
            </div>

            {success ? (
              /* ── Resultado exitoso ── */
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-green-800">
                    <p className="font-semibold">Asignación exitosa</p>
                    <p className="mt-1">
                      Postulación asignada a <strong>{funcionarioSeleccionado?.nombre_completo}</strong>.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            ) : (
              /* ── Selección de funcionario ── */
              <>
                {loadingFuncionarios ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span className="text-sm">Cargando funcionarios...</span>
                  </div>
                ) : funcionarios.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No hay funcionarios activos disponibles.
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Seleccione un funcionario
                    </label>
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-52 overflow-y-auto">
                      {funcionarios.map(f => {
                        const isCurrentlyAssigned = f.id_usuario === funcionarioActualId;
                        return (
                          <label
                            key={f.id_usuario}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                              selectedId === f.id_usuario
                                ? 'bg-blue-50'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="funcionario"
                              checked={selectedId === f.id_usuario}
                              onChange={() => setSelectedId(f.id_usuario)}
                              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {f.nombre_completo}
                                {isCurrentlyAssigned && (
                                  <span className="ml-2 text-xs font-normal text-emerald-600">(actual)</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-400 truncate">{f.correo}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {errorMsg}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAsignar}
                    disabled={!selectedId || asignar.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {asignar.isPending && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    )}
                    Asignar
                  </button>
                </div>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
