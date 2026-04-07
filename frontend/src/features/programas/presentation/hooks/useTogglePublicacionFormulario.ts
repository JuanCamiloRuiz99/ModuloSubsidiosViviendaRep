import { useMutation, useQueryClient } from '@tanstack/react-query';
import { etapaRepository } from '../../infrastructure/persistence/axios-etapa-repository';
import type { ModuloPrincipal } from '../../infrastructure/persistence/axios-etapa-repository';
import { etapasQueryKey } from './useEtapas';

/**
 * Unified hook for toggling the publication state of an etapa formulario.
 * Dispatches to the correct publish/unpublish endpoint based on modulo_principal.
 */
export function useTogglePublicacionFormulario(programaId: string | number) {
  const queryClient = useQueryClient();

  const invalidateEtapas = () =>
    void queryClient.invalidateQueries({ queryKey: etapasQueryKey(programaId) });

  const publicarMutation = useMutation({
    mutationFn: ({ etapaId, modulo }: { etapaId: number; modulo: ModuloPrincipal }) => {
      if (modulo === 'REGISTRO_HOGAR') return etapaRepository.publicarRegistroHogar(etapaId);
      if (modulo === 'VISITA_TECNICA') return etapaRepository.publicarVisitaTecnica(etapaId);
      if (modulo === 'GESTION_DOCUMENTAL_INTERNA') return etapaRepository.publicarGestionDocumental(etapaId);
      return etapaRepository.publicarFormulario(etapaId);
    },
    onSuccess: invalidateEtapas,
  });

  const inhabilitarMutation = useMutation({
    mutationFn: ({ etapaId, modulo }: { etapaId: number; modulo: ModuloPrincipal }) => {
      if (modulo === 'REGISTRO_HOGAR') return etapaRepository.inhabilitarRegistroHogar(etapaId);
      if (modulo === 'VISITA_TECNICA') return etapaRepository.inhabilitarVisitaTecnica(etapaId);
      if (modulo === 'GESTION_DOCUMENTAL_INTERNA') return etapaRepository.inhabilitarGestionDocumental(etapaId);
      return etapaRepository.inhabilitarFormulario(etapaId);
    },
    onSuccess: invalidateEtapas,
  });

  const toggle = (etapaId: number, currentlyPublicado: boolean, modulo: ModuloPrincipal = 'GESTION_DOCUMENTAL_INTERNA') => {
    if (currentlyPublicado) inhabilitarMutation.mutate({ etapaId, modulo });
    else publicarMutation.mutate({ etapaId, modulo });
  };

  return {
    toggle,
    isToggling: publicarMutation.isPending || inhabilitarMutation.isPending,
    error: publicarMutation.error?.message ?? inhabilitarMutation.error?.message ?? null,
  };
}

// Individual hooks kept for other consumers (e.g. ConstructorFormularioPage)
export function usePublicarFormulario(programaId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (etapaId: number) => etapaRepository.publicarFormulario(etapaId),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: etapasQueryKey(programaId) }),
  });
}

export function useInhabilitarFormulario(programaId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (etapaId: number) => etapaRepository.inhabilitarFormulario(etapaId),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: etapasQueryKey(programaId) }),
  });
}
