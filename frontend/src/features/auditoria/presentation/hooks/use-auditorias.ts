/**
 * useAuditorias - TanStack Query hook para listar auditorías.
 */

import { useQuery } from '@tanstack/react-query';
import { AxiosAuditoriaRepository } from '../../infrastructure';

const repository = new AxiosAuditoriaRepository();

export const AUDITORIAS_QUERY_KEY = (tipoAccion?: string, entidad?: string) =>
  ['auditorias', tipoAccion, entidad] as const;

export function useAuditorias(tipoAccion?: string, entidad?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: AUDITORIAS_QUERY_KEY(tipoAccion, entidad),
    queryFn: () =>
      repository.findAll({ page: 1, pageSize: 100, tipoAccion, entidad }).then((r) => r.items),
  });

  return {
    auditorias: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
