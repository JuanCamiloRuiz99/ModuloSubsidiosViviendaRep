/**
 * Hook useEliminarUsuario - Elimina usuarios con useMutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usuarioService } from '../di';
import { USUARIOS_QUERY_KEY } from './useUsuarios';

export const useEliminarUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usuarioService.eliminarUsuario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
    },
  });
};
