/**
 * Hook useObtenerUsuario - Obtiene un usuario con useQuery
 */

import { useQuery } from '@tanstack/react-query';
import { usuarioService } from '../di';
import { USUARIOS_QUERY_KEY } from './useUsuarios';

export const useObtenerUsuario = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [...USUARIOS_QUERY_KEY, 'detail', id],
    queryFn: () => usuarioService.obtenerUsuario(id),
    enabled: !!id && enabled,
  });
};


