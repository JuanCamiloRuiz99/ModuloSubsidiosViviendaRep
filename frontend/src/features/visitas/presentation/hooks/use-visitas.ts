/**
 * useVisitas - TanStack Query hook para listar visitas.
 */

import { useQuery } from '@tanstack/react-query';
import { AxiosVisitaRepository } from '../../infrastructure';

export const VISITAS_QUERY_KEY = (programaId?: string, postulanteId?: string) =>
  ['visitas', programaId, postulanteId] as const;

export function useVisitas(programaId?: string, postulanteId?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: VISITAS_QUERY_KEY(programaId, postulanteId),
    queryFn: () => {
      const repository = new AxiosVisitaRepository();
      return repository.findAll({ page: 1, pageSize: 100, programaId, postulanteId }).then((r) => r.items);
    },
  });

  return {
    visitas: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
