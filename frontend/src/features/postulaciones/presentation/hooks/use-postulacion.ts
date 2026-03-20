/**
 * usePostulacion - TanStack Query hook para obtener una postulación por ID.
 */

import { useQuery } from '@tanstack/react-query';
import { AxiosPostulacionRepository } from '../../infrastructure';

const repository = new AxiosPostulacionRepository();

export const POSTULACION_QUERY_KEY = (id: string) => ['postulacion', id] as const;

export function usePostulacion(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: POSTULACION_QUERY_KEY(id),
    queryFn: () => repository.findById(id),
    enabled: !!id,
  });

  return {
    postulacion: data ?? null,
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
