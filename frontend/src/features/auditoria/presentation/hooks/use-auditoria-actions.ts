/**
 * useCrearAuditoria - TanStack Query mutation para registrar una auditoría.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuditoriaApplicationService } from '../../application';
import { AxiosAuditoriaRepository } from '../../infrastructure';
import { CrearAuditoriaDTO } from '../../application/dtos/auditoria-in';
import { AUDITORIAS_QUERY_KEY } from './use-auditorias';

const service = new AuditoriaApplicationService(new AxiosAuditoriaRepository());

export interface CrearAuditoriaInput {
  tipoAccion: string;
  entidad: string;
  entidadId: string;
  usuarioId: string;
  numeroDocumento?: string;
  cambios?: unknown;
  detalles?: string;
}

export function useCrearAuditoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearAuditoriaInput) =>
      service.crear(
        new CrearAuditoriaDTO(
          input.tipoAccion,
          input.entidad,
          input.entidadId,
          input.usuarioId,
          input.numeroDocumento,
          input.cambios,
          input.detalles,
        ),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: AUDITORIAS_QUERY_KEY() });
    },
  });
}
