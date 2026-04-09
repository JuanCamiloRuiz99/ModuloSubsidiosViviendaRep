/**
 * useMisVisitas – TanStack Query hook para las visitas asignadas al técnico actual.
 */

import { useQuery } from '@tanstack/react-query';
import { AxiosVisitaRepository } from '../../infrastructure';
import { storageService } from '../../../../core/services';

export function useMisVisitas(programaId?: string) {
  const user = storageService.getUser();
  const userId = user?.id as string | undefined;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['visitas', 'mis-visitas', userId, programaId],
    queryFn: () => {
      const repository = new AxiosVisitaRepository();
      const criteria: Record<string, unknown> = { page: 1, pageSize: 500, inspectorId: userId };
      if (programaId) criteria.programaId = programaId;
      return repository.findAll(criteria).then(r => r.items);
    },
    enabled: !!userId && !!programaId,
  });

  return {
    visitas: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
