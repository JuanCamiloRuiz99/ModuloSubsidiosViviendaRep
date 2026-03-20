/**
 * Hook useCrearUsuario - Crea usuarios con useMutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usuarioService } from '../di';
import { CrearUsuarioDTO } from '../../application/dtos';
import { USUARIOS_QUERY_KEY } from './useUsuarios';

export const useCrearUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CrearUsuarioDTO) => usuarioService.crearUsuario(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
    },
  });
};
