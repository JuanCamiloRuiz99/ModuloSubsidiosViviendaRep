/**
 * Hook useEtapas - Lista etapas de un programa con TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  etapaRepository,
  type CrearEtapaPayload,
  type ActualizarEtapaPayload,
} from '../../infrastructure/persistence/axios-etapa-repository';

export const etapasQueryKey = (programaId: string | number) =>
  ['etapas', String(programaId)] as const;

export const useEtapas = (programaId: string | number) => {
  return useQuery({
    queryKey: etapasQueryKey(programaId),
    queryFn: () => etapaRepository.listarPorPrograma(programaId),
    enabled: !!programaId,
  });
};

export const useCrearEtapa = (programaId: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearEtapaPayload) => etapaRepository.crear(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: etapasQueryKey(programaId) });
    },
  });
};

export const useActualizarEtapa = (programaId: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ActualizarEtapaPayload }) =>
      etapaRepository.actualizar(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: etapasQueryKey(programaId) });
    },
  });
};

export const useEliminarEtapa = (programaId: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => etapaRepository.eliminar(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: etapasQueryKey(programaId) });
    },
  });
};
