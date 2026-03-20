/**
 * Visita mutations - TanStack Query hooks para acciones sobre visitas.
 *
 * Usa el prefijo ['visitas'] para invalidar todas las queries
 * de visitas sin importar los parámetros de filtro.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VisitaApplicationService } from '../../application';
import { AxiosVisitaRepository } from '../../infrastructure';
import {
  CrearVisitaDTO,
  IniciarVisitaDTO,
  CompletarVisitaDTO,
  CancelarVisitaDTO,
} from '../../application/dtos/visita-in';

/** Prefijo compartido. Invalidar con este array coincide con cualquier queryKey
 *  que empiece con 'visitas', sin importar programaId ni postulanteId. */
const VISITAS_PREFIX = ['visitas'] as const;

function createService() {
  return new VisitaApplicationService(new AxiosVisitaRepository());
}

export function useCrearVisita() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearVisitaDTO) => createService().crear(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VISITAS_PREFIX });
    },
  });
}

export function useIniciarVisita() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, inspectorId }: { id: string; inspectorId: string }) =>
      createService().iniciar(new IniciarVisitaDTO(id, inspectorId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VISITAS_PREFIX });
    },
  });
}

export function useCompletarVisita() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      calificacion,
      observaciones,
      fotosUrl,
    }: {
      id: string;
      calificacion: number;
      observaciones?: string;
      fotosUrl?: string;
    }) => createService().completar(new CompletarVisitaDTO(id, calificacion, observaciones, fotosUrl)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VISITAS_PREFIX });
    },
  });
}

export function useCancelarVisita() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      createService().cancelar(new CancelarVisitaDTO(id, motivo)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VISITAS_PREFIX });
    },
  });
}


