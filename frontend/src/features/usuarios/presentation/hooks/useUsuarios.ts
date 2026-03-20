/**
 * Hook useUsuarios - Lista usuarios con TanStack Query
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usuarioService } from '../di';
import { ListarUsuariosFilterDTO } from '../../application/dtos';

export const USUARIOS_QUERY_KEY = ['usuarios'] as const;

export const useUsuarios = (filter: ListarUsuariosFilterDTO = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...USUARIOS_QUERY_KEY, filter],
    queryFn: () =>
      usuarioService.listarUsuarios({
        page: filter.page || 1,
        pageSize: filter.pageSize || 10,
        search: filter.search,
        rol: filter.rol,
        estado: filter.estado,
      }),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });

  const data = query.data;

  return {
    usuarios: data?.usuarios || data?.items || [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    pageSize: data?.pageSize ?? 10,
    totalPages: data?.totalPages ?? 0,
    stats: data?.stats ?? {
      total: 0,
      activos: 0,
      inactivos: 0,
      admins: 0,
      funcionarios: 0,
      tecnicos: 0,
    },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  };
};
