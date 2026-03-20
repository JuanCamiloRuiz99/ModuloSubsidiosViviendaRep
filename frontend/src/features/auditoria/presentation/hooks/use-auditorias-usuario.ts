/**
 * useAuditoriasPorUsuario - TanStack Query hook para auditorías de un usuario.
 */

import { useQuery } from '@tanstack/react-query';
import { AxiosAuditoriaRepository } from '../../infrastructure';

const repository = new AxiosAuditoriaRepository();

export const AUDITORIAS_USUARIO_QUERY_KEY = (usuarioId: string) =>
  ['auditorias', 'usuario', usuarioId] as const;

export function useAuditoriasPorUsuario(usuarioId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: AUDITORIAS_USUARIO_QUERY_KEY(usuarioId),
    queryFn: () => repository.findByUsuarioId(usuarioId),
    enabled: !!usuarioId,
  });

  return {
    auditorias: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
