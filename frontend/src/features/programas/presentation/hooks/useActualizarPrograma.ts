/**
 * Hook useActualizarPrograma - Actualiza programas con useMutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { programaService } from '../di';
import { ActualizarProgramaDTO } from '../../application/dtos';
import { PROGRAMAS_QUERY_KEY } from './useProgramas';

export const useActualizarPrograma = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ActualizarProgramaDTO) => programaService.actualizar(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROGRAMAS_QUERY_KEY });
    },
  });
};
