/**
 * Hook useEliminarPrograma - Elimina programas con useMutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { programaService } from '../di';
import { EliminarProgramaDTO } from '../../application/dtos';
import { PROGRAMAS_QUERY_KEY } from './useProgramas';

export const useEliminarPrograma = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => programaService.eliminar(new EliminarProgramaDTO(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROGRAMAS_QUERY_KEY });
    },
  });
};
