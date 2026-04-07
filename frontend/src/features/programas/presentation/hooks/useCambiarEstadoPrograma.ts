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
    onSuccess: (_data, { id }) => {
      // Invalidar la lista de programas
      void queryClient.invalidateQueries({ queryKey: PROGRAMAS_QUERY_KEY });
      // Invalidar el programa individual (usado en GestionarEtapasPage)
      void queryClient.invalidateQueries({ queryKey: ['programa', id] });
      // Invalidar las etapas de este programa (cuando el backend las despublica)
      void queryClient.invalidateQueries({ queryKey: ['etapas', id] });
    },
  });
};
