/**
 * useMisPostulaciones – Hook para las postulaciones asignadas al funcionario actual.
 *
 * Filtra por funcionario_id = userId del usuario logueado.
 */

import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../../../core/services';
import { storageService } from '../../../../core/services';
import type { PostulanteRow } from './use-postulantes';

export function useMisPostulaciones() {
  const user = storageService.getUser();
  const userId = user?.id as string | undefined;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['postulantes-registro-hogar', 'mis-postulaciones', userId],
    queryFn: () =>
      apiService
        .get<PostulanteRow[]>('postulaciones/registro-hogar/', {
          params: { funcionario_id: userId },
        })
        .then(r => r.data),
    enabled: !!userId,
  });

  return {
    postulantes: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
