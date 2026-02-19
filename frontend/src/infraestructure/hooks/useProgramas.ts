/**
 * Hooks personalizados para TanStack Query - Programas
 * Encapsula la lógica de fetching y mutaciones
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProgramas,
  getPrograma,
  createPrograma,
  updatePrograma,
  partialUpdatePrograma,
  deletePrograma,
  cambiarEstadoPrograma,
  getProgramasStatistics,
} from '../api/programas.api';
import type {
  CreateProgramaRequest,
  UpdateProgramaRequest,
  ProgramaResponse,
  ProgramaStatistics,
} from '../api/programas.api';

const PROGRAMAS_KEY = 'programas';
const PROGRAMA_DETAIL_KEY = 'programa-detail';
const PROGRAMAS_STATS_KEY = 'programas-statistics';

/**
 * Hook para obtener todos los programas
 */
export const useProgramas = (estado?: string, page: number = 1) => {
  return useQuery({
    queryKey: [PROGRAMAS_KEY, estado, page],
    queryFn: () => getProgramas(estado, page),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener un programa específico
 */
export const usePrograma = (id: number) => {
  return useQuery({
    queryKey: [PROGRAMA_DETAIL_KEY, id],
    queryFn: () => getPrograma(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener estadísticas de programas
 */
export const useProgramasStatistics = () => {
  return useQuery({
    queryKey: [PROGRAMAS_STATS_KEY],
    queryFn: () => getProgramasStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para crear un programa
 */
export const useCreatePrograma = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProgramaRequest) => createPrograma(data),
    onSuccess: () => {
      // Invalidar la lista de programas para recargar
      queryClient.invalidateQueries({
        queryKey: [PROGRAMAS_KEY],
      });
      // Invalidar estadísticas
      queryClient.invalidateQueries({
        queryKey: [PROGRAMAS_STATS_KEY],
      });
    },
  });
};

/**
 * Hook para actualizar un programa
 */
export const useUpdatePrograma = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProgramaRequest) => updatePrograma(id, data),
    onSuccess: (data) => {
      // Actualizar el detalle específico
      queryClient.setQueryData([PROGRAMA_DETAIL_KEY, id], data);
      // Invalidar lista
      queryClient.invalidateQueries({
        queryKey: [PROGRAMAS_KEY],
      });
      // Invalidar estadísticas si cambió estado
      queryClient.invalidateQueries({
        queryKey: [PROGRAMAS_STATS_KEY],
      });
    },
  });
};

/**
 * Hook para actualización parcial de un programa
 */
export const usePartialUpdatePrograma = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UpdateProgramaRequest>) =>
      partialUpdatePrograma(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData([PROGRAMA_DETAIL_KEY, id], data);
      queryClient.invalidateQueries({
        queryKey: [PROGRAMAS_KEY],
      });
    },
  });
};

/**
 * Hook para eliminar un programa
 */
export const useDeletePrograma = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePrograma(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PROGRAMAS_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [PROGRAMAS_STATS_KEY],
      });
    },
  });
};

/**
 * Hook para cambiar estado de un programa
 */
export const useChangeProgramState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { programId: number; nuevoEstado: 'BORRADOR' | 'ACTIVO' | 'INHABILITADO' }) =>
      cambiarEstadoPrograma(params.programId, params.nuevoEstado),
    onSuccess: (data, variables) => {
      // Actualizar el programa en la lista y en el detalle
      queryClient.setQueryData([PROGRAMA_DETAIL_KEY, variables.programId], data.programa);
      queryClient.invalidateQueries({
        queryKey: [PROGRAMAS_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [PROGRAMAS_STATS_KEY],
      });
    },
  });
};
