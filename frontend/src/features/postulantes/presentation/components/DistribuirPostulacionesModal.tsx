/**
 * DistribuirPostulacionesModal – Modal para distribuir postulaciones
 * equitativamente entre funcionarios.
 *
 * Flujo:
 * 1. Seleccionar funcionarios (checkbox)
 * 2. Vista previa de cómo quedarán repartidas
 * 3. Confirmar → se ejecuta el endpoint de distribución
 * 4. Se muestra el resultado
 */

import React, { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  useFuncionariosActivos,
  useDistribuirPostulaciones,
} from '../hooks/use-distribuir';
import type { DistribucionResult } from '../hooks/use-distribuir';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  totalPostulaciones: number;
  postulacionIds?: number[];
}

type Step = 'config' | 'result';

export const DistribuirPostulacionesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  totalPostulaciones,
  postulacionIds,
}) => {
  const { funcionarios, isLoading: loadingFuncionarios } = useFuncionariosActivos();
  const distribuir = useDistribuirPostulaciones();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [step, setStep] = useState<Step>('config');
  const [resultado, setResultado] = useState<DistribucionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numGrupos = selectedIds.size;
  const porGrupo = numGrupos > 0 ? Math.floor(totalPostulaciones / numGrupos) : 0;
  const sobrantes = numGrupos > 0 ? totalPostulaciones % numGrupos : 0;

  const toggleFuncionario = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === funcionarios.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(funcionarios.map(f => f.id_usuario)));
    }
  };

  const handleDistribuir = async () => {
    if (numGrupos === 0) return;
    setErrorMsg(null);
    try {
      const result = await distribuir.mutateAsync({
        num_grupos: numGrupos,
        funcionario_ids: Array.from(selectedIds),
        ...(postulacionIds?.length ? { postulacion_ids: postulacionIds } : {}),
      });
      setResultado(result);
      setStep('result');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Error al distribuir postulaciones';
      setErrorMsg(msg);
    }
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setStep('config');
    setResultado(null);
    setErrorMsg(null);
    onClose();
  };

  // Preview: simulated distribution
  const preview = useMemo(() => {
    if (numGrupos === 0) return [];
    const ids = Array.from(selectedIds);
    return ids.map((fId, idx) => {
      const func = funcionarios.find(f => f.id_usuario === fId);
      const cantidad = porGrupo + (idx < sobrantes ? 1 : 0);
      return {
        funcionario_id: fId,
        nombre: func?.nombre_completo ?? `Funcionario ${fId}`,
        cantidad,
      };
    });
  }, [numGrupos, selectedIds, funcionarios, porGrupo, sobrantes]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => { if (!open) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50 p-0">

          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <Dialog.Title className="text-lg font-bold text-gray-900">
              {step === 'config'
                ? 'Distribuir Postulaciones'
                : 'Resultado de la Distribución'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-full p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          <div className="px-6 py-5 space-y-5">

            {/* ─── PASO 1: Configuración ─── */}
            {step === 'config' && (
              <>
                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold">Distribución equitativa</p>
                    <p className="mt-1">
                      Selecciona los funcionarios entre los cuales se repartirán las{' '}
                      <strong>{totalPostulaciones}</strong> postulaciones.
                      Cada uno recibirá aproximadamente la misma cantidad.
                    </p>
                  </div>
                </div>

                {/* Loading funcionarios */}
                {loadingFuncionarios && (
                  <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span className="text-sm">Cargando funcionarios...</span>
                  </div>
                )}

                {/* Lista de funcionarios */}
                {!loadingFuncionarios && funcionarios.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Funcionarios disponibles ({funcionarios.length})
                      </h3>
                      <button
                        onClick={selectAll}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        {selectedIds.size === funcionarios.length
                          ? 'Deseleccionar todos'
                          : 'Seleccionar todos'}
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-52 overflow-y-auto">
                      {funcionarios.map(f => (
                        <label
                          key={f.id_usuario}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(f.id_usuario)}
                            onChange={() => toggleFuncionario(f.id_usuario)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {f.nombre_completo}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{f.correo}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sin funcionarios */}
                {!loadingFuncionarios && funcionarios.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No hay funcionarios activos disponibles.
                  </div>
                )}

                {/* Vista previa */}
                {numGrupos > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Vista previa de distribución
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {preview.map(g => (
                        <div
                          key={g.funcionario_id}
                          className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100"
                        >
                          <span className="text-sm text-gray-800 truncate mr-2">{g.nombre}</span>
                          <span className="text-sm font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                            {g.cantidad} postulaciones
                          </span>
                        </div>
                      ))}
                    </div>
                    {sobrantes > 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        * {sobrantes} postulación{sobrantes > 1 ? 'es' : ''} extra se asignará{sobrantes > 1 ? 'n' : ''} a los primeros funcionarios.
                      </p>
                    )}
                  </div>
                )}

                {/* Error */}
                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {errorMsg}
                  </div>
                )}

                {/* Acciones */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDistribuir}
                    disabled={numGrupos === 0 || totalPostulaciones === 0 || distribuir.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {distribuir.isPending && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    )}
                    Distribuir
                  </button>
                </div>
              </>
            )}

            {/* ─── PASO 2: Resultado ─── */}
            {step === 'result' && resultado && (
              <>
                {/* Success banner */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-green-800">
                    <p className="font-semibold">Distribución completada</p>
                    <p className="mt-1">
                      Se distribuyeron <strong>{resultado.total_distribuidas}</strong> postulaciones
                      entre <strong>{resultado.grupos.length}</strong> funcionarios.
                    </p>
                  </div>
                </div>

                {/* Resultado detallado */}
                <div className="space-y-2">
                  {resultado.grupos.map(g => (
                    <div
                      key={g.funcionario_id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{g.funcionario_nombre}</p>
                        <p className="text-xs text-gray-400">
                          IDs: {g.postulacion_ids.slice(0, 10).join(', ')}
                          {g.postulacion_ids.length > 10 ? ` … (+${g.postulacion_ids.length - 10} más)` : ''}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                        {g.cantidad} asignadas
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cerrar */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Cerrar
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
