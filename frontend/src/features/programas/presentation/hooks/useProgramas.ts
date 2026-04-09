/**
 * Hook useProgramas - Lista programas con TanStack Query
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { programaService } from '../di';
import apiService from '../../../../core/services/api.service';
import { ListarProgramasDTO } from '../../application/dtos';

export const PROGRAMAS_QUERY_KEY = ['programas'] as const;
export const PROGRAMAS_STATS_QUERY_KEY = ['programas', 'estadisticas'] as const;

interface UseProgramasFilter {
  estado?: string;
  page?: number;
  pageSize?: number;
}

export const useProgramas = (filter: UseProgramasFilter = {}) => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: [...PROGRAMAS_QUERY_KEY, filter],
    queryFn: () =>
      programaService.listar(
        new ListarProgramasDTO(
          filter.page ?? 1,
          filter.pageSize ?? 20,
          filter.estado,
        )
      ),
  });

  const statsQuery = useQuery({
    queryKey: PROGRAMAS_STATS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiService.get<any>('programas/estadisticas/');
      return data;
    },
    staleTime: 30_000,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: PROGRAMAS_QUERY_KEY });

  const rawStats = statsQuery.data;

  return {
    programas: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    error: listQuery.error,
    refetch: listQuery.refetch,
    invalidate,
    stats: {
      total: rawStats?.total ?? 0,
      activos: rawStats?.por_estado?.ACTIVO ?? 0,
      borradores: rawStats?.por_estado?.BORRADOR ?? 0,
      inhabilitados: rawStats?.por_estado?.INHABILITADO ?? 0,
      culminados: rawStats?.por_estado?.CULMINADO ?? 0,
    },
  };
};
