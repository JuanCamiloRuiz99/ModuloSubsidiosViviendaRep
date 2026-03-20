/**
 * useVisita - TanStack Query hook para obtener una visita por ID.
 */

import { useQuery } from '@tanstack/react-query';
import { AxiosVisitaRepository } from '../../infrastructure';

const repository = new AxiosVisitaRepository();

export const VISITA_QUERY_KEY = (id: string) => ['visita', id] as const;

export function useVisita(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: VISITA_QUERY_KEY(id),
    queryFn: () => repository.findById(id),
    enabled: !!id,
  });

  return {
    visita: data ?? null,
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
