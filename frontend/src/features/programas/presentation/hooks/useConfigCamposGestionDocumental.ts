/**
 * useConfigCamposGestionDocumental — Hook para cargar y guardar la configuración
 * de campos del formulario de Gestión Documental Interna de una etapa.
 *
 * Gestión local optimista: los cambios son inmediatos en UI y se persisten
 * con el botón "Guardar configuración".
 */
import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  configGestionDocumentalRepository,
  type ConfigCamposGestionPayload,
} from '../../infrastructure/persistence/axios-config-gestion-documental-repository';
import { buildDefaultConfigGestion } from '../components/gestion-documental/config/secciones-data-gestion';
import type { CampoConfig } from '../components/registro-hogar/config/CampoRow';

export const configGestionDocumentalQueryKey = (etapaId: string | number) =>
  ['config-gestion-documental', String(etapaId)] as const;

export function useConfigCamposGestionDocumental(etapaId: string | number | undefined) {
  const queryClient = useQueryClient();
  const [localConfig, setLocalConfig] = useState<ConfigCamposGestionPayload>({});
  const [isDirty, setIsDirty] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────── //

  const { data, isLoading } = useQuery({
    queryKey: configGestionDocumentalQueryKey(etapaId ?? ''),
    queryFn: () => configGestionDocumentalRepository.obtenerConfig(etapaId!),
    enabled: !!etapaId,
  });

  // Merge server data with defaults whenever the query resolves
  useEffect(() => {
    const defaults = buildDefaultConfigGestion();
    const serverCampos = data?.campos ?? {};
    setLocalConfig({ ...defaults, ...serverCampos });
    // If never saved (empty campos), mark dirty so user can save defaults
    const hasBeenSaved = Object.keys(serverCampos).length > 0;
    setIsDirty(!hasBeenSaved);
  }, [data]);

  // ── Mutations ────────────────────────────────────────────────────────── //

  const saveMutation = useMutation({
    mutationFn: (campos: ConfigCamposGestionPayload) =>
      configGestionDocumentalRepository.guardarConfig(etapaId!, campos),
    onSuccess: (result) => {
      void queryClient.setQueryData(configGestionDocumentalQueryKey(etapaId!), result);
      void queryClient.invalidateQueries({ queryKey: ['etapas'] });
      setIsDirty(false);
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────── //

  const updateCampo = useCallback((campoId: string, next: CampoConfig) => {
    setLocalConfig(prev => ({ ...prev, [campoId]: next }));
    setIsDirty(true);
  }, []);

  const saveConfig = useCallback(() => {
    saveMutation.mutate(localConfig);
  }, [localConfig, saveMutation]);

  const resetConfig = useCallback(() => {
    const defaults = buildDefaultConfigGestion();
    const serverCampos = data?.campos ?? {};
    setLocalConfig({ ...defaults, ...serverCampos });
    const hasBeenSaved = Object.keys(serverCampos).length > 0;
    setIsDirty(!hasBeenSaved);
  }, [data]);

  return {
    configCampos: localConfig,
    isLoading,
    isSaving: saveMutation.isPending,
    saveSuccess: saveMutation.isSuccess,
    saveError: saveMutation.isError
      ? (saveMutation.error instanceof Error ? saveMutation.error.message : 'Error al guardar')
      : null,
    isDirty,
    updateCampo,
    saveConfig,
    resetConfig,
  };
}
