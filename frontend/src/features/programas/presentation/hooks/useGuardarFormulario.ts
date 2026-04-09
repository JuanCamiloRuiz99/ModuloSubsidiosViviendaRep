import { useMutation, useQueryClient } from '@tanstack/react-query';
import { etapaRepository } from '../../infrastructure/persistence/axios-etapa-repository';
import type { CampoConfig } from '../../domain/formulario';
import { etapasQueryKey } from './useEtapas';
import { formularioQueryKey } from './useFormularioEtapa';

interface GuardarParams {
  programaId: string;
  etapaId: string;
  selectedIds: string[];
  configs: Record<string, CampoConfig>;
}

export function useGuardarFormulario() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ etapaId, selectedIds, configs }: GuardarParams) => {
      const campos = selectedIds.map((id, index) => ({
        campo_catalogo: id,
        orden: index + 1,
        obligatorio: configs[id].obligatorio,
        texto_ayuda: configs[id].texto_ayuda,
      }));
      return etapaRepository.guardarFormulario(Number(etapaId), campos);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: etapasQueryKey(variables.programaId) });
      void queryClient.invalidateQueries({ queryKey: formularioQueryKey(variables.etapaId) });
    },
  });

  const guardar = (params: GuardarParams) => {
    if (!params.etapaId || params.selectedIds.length === 0) return;
    mutation.mutate(params);
  };

  const saveError = mutation.isError
    ? (mutation.error instanceof Error ? mutation.error.message : 'Error al guardar el formulario')
    : null;

  return {
    guardar,
    isSaving: mutation.isPending,
    saveError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}
