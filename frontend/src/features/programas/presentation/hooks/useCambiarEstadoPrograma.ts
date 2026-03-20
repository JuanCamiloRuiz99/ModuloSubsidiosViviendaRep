/**
 * Hook useCambiarEstadoPrograma - Cambia estado con useMutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { programaService } from '../di';
import { CambiarEstadoProgramaDTO } from '../../application/dtos';
import { PROGRAMAS_QUERY_KEY } from './useProgramas';

export const useCambiarEstadoPrograma = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, nuevoEstado }: { id: string; nuevoEstado: string }) =>
      programaService.cambiarEstado(new CambiarEstadoProgramaDTO(id, nuevoEstado)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROGRAMAS_QUERY_KEY });
    },
  });
};
