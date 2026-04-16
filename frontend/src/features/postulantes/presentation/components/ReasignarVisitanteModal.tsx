/**
 * ReasignarVisitanteModal — Permite reasignar el técnico visitante
 * de una postulación que ya tiene visita asignada.
 */

import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../../../core/services';
import { useTecnicos } from '../../../visitas/presentation/hooks/use-tecnicos';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  postulacionId: number | null;
  radicado: string;
  solicitante: string;
  visitanteActualId: number | null;
}

export const ReasignarVisitanteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  postulacionId,
  radicado,
  solicitante,
  visitanteActualId,
}) => {
  const { tecnicos, isLoading: loadingTec } = useTecnicos();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    if (isOpen) setSelectedId(visitanteActualId ? String(visitanteActualId) : '');
  }, [isOpen, visitanteActualId]);

  const mutation = useMutation({
    mutationFn: (inspectorId: string) =>
      apiService.post('visitas/reasignar/', {
        postulacionId,
        inspectorId: Number(inspectorId),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['postulantes-registro-hogar'] });
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-teal-600 px-6 py-4 text-white">
          <h3 className="text-base font-bold">Reasignar visitante</h3>
          <p className="text-teal-100 text-xs mt-0.5">
            {radicado} — {solicitante}
          </p>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Técnico visitante</span>
            {loadingTec ? (
              <p className="text-sm text-gray-400">Cargando técnicos…</p>
            ) : (
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">— Seleccionar —</option>
                {tecnicos.map(t => (
                  <option key={t.id} value={String(t.id)}>
                    {t.nombre} {t.apellido}
                  </option>
                ))}
              </select>
            )}
          </label>

          {mutation.isError && (
            <p className="text-sm text-red-600">
              {(mutation.error as Error)?.message || 'Error al reasignar.'}
            </p>
          )}
        </div>

        <div className="px-6 pb-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            disabled={!selectedId || selectedId === String(visitanteActualId) || mutation.isPending}
            onClick={() => mutation.mutate(selectedId)}
            className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 rounded-lg transition-colors"
          >
            {mutation.isPending ? 'Reasignando…' : 'Reasignar'}
          </button>
        </div>
      </div>
    </div>
  );
};
