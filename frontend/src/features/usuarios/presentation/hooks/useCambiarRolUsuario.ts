/**
 * Hook useCambiarRolUsuario - Cambia rol con useMutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usuarioService } from '../di';
import { CambiarRolDTO } from '../../application/dtos';
import { USUARIOS_QUERY_KEY } from './useUsuarios';

export const useCambiarRolUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CambiarRolDTO) => usuarioService.cambiarRolUsuario(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
    },
  });
};
