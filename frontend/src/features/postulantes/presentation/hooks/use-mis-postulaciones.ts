/**
 * useMisPostulaciones – Hook para las postulaciones asignadas al funcionario actual.
 *
 * Filtra por funcionario_id = userId del usuario logueado y opcionalmente por programa_id.
 */

import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../../../core/services';
import { storageService } from '../../../../core/services';
import type { PostulanteRow } from './use-postulantes';

export function useMisPostulaciones(programaId?: string | number | null) {
  const user = storageService.getUser();
  const userId = user?.id as string | undefined;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['postulantes-registro-hogar', 'mis-postulaciones', userId, programaId],
    queryFn: () => {
      const params: Record<string, string> = { funcionario_id: userId! };
      if (programaId) params.programa_id = String(programaId);
      return apiService
        .get<PostulanteRow[]>('postulaciones/registro-hogar/', { params })
        .then(r => r.data);
    },
    enabled: !!userId && !!programaId,
  });

  return {
    postulantes: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
