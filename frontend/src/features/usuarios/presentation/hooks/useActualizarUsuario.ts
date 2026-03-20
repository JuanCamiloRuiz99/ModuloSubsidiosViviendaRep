/**
 * Hook useActualizarUsuario - Actualiza usuarios con useMutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usuarioService } from '../di';
import { ActualizarUsuarioDTO } from '../../application/dtos';
import { USUARIOS_QUERY_KEY } from './useUsuarios';

export const useActualizarUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ActualizarUsuarioDTO) => usuarioService.actualizarUsuario(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
    },
  });
};
