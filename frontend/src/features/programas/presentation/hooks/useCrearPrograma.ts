/**
 * Hook useCrearPrograma - Crea programas con useMutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { programaService } from '../di';
import { CrearProgramaDTO } from '../../application/dtos';
import { PROGRAMAS_QUERY_KEY } from './useProgramas';

export const useCrearPrograma = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CrearProgramaDTO) => programaService.crear(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROGRAMAS_QUERY_KEY });
    },
  });
};
