/**
 * useMisVisitas – TanStack Query hook para las visitas asignadas al técnico actual.
 */

import { useQuery } from '@tanstack/react-query';
import { AxiosVisitaRepository } from '../../infrastructure';
import { storageService } from '../../../../core/services';

export function useMisVisitas() {
  const user = storageService.getUser();
  const userId = user?.id as string | undefined;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['visitas', 'mis-visitas', userId],
    queryFn: () => {
      const repository = new AxiosVisitaRepository();
      return repository.findAll({ page: 1, pageSize: 500, inspectorId: userId }).then(r => r.items);
    },
    enabled: !!userId,
  });

  return {
    visitas: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
