/**
 * Hook useCambiarEstadoUsuario - Cambia estado con useMutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usuarioService } from '../di';
import { CambiarEstadoDTO } from '../../application/dtos';
import { USUARIOS_QUERY_KEY } from './useUsuarios';

export const useCambiarEstadoUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, nuevoEstado }: { id: string; nuevoEstado: string }) =>
      usuarioService.cambiarEstado(new CambiarEstadoDTO(id, nuevoEstado)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
    },
  });
};
