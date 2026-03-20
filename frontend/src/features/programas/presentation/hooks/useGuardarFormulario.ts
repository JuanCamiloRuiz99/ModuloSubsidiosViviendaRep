import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const guardar = async ({ programaId, etapaId, selectedIds, configs }: GuardarParams) => {
    if (!etapaId || selectedIds.length === 0) return;
    setSaveError(null);
    setIsSuccess(false);
    setIsSaving(true);
    try {
      const campos = selectedIds.map((id, index) => ({
        campo_catalogo: id,
        orden: index + 1,
        obligatorio: configs[id].obligatorio,
        texto_ayuda: configs[id].texto_ayuda,
      }));
      await etapaRepository.guardarFormulario(Number(etapaId), campos);
      // Invalidate both queries so the page reflects the new PUBLICADO state
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: etapasQueryKey(programaId) }),
        queryClient.invalidateQueries({ queryKey: formularioQueryKey(etapaId) }),
      ]);
      setIsSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar el formulario');
    } finally {
      setIsSaving(false);
    }
  };

  return { guardar, isSaving, saveError, isSuccess };
}
