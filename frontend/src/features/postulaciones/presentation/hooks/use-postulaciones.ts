/**
 * usePostulaciones - TanStack Query hook para listar postulaciones.
 */

import { useQuery } from '@tanstack/react-query';
import { AxiosPostulacionRepository } from '../../infrastructure';

const repository = new AxiosPostulacionRepository();

export const POSTULACIONES_QUERY_KEY = (programaId?: string) =>
  ['postulaciones', programaId] as const;

export function usePostulaciones(programaId?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: POSTULACIONES_QUERY_KEY(programaId),
    queryFn: () =>
      repository.findAll({ page: 1, pageSize: 100, programaId }).then((r) => r.items),
  });

  return {
    postulaciones: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
