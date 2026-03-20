/**
 * useConfigCamposRegistroHogar — Hook para cargar y guardar la configuración
 * de campos del formulario de Registro del Hogar de una etapa.
 *
 * Gestión local optimista: los cambios son inmediatos en UI y se persisten
 * con el botón "Guardar configuración".
 */
import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  configRegistroHogarRepository,
  type ConfigCamposPayload,
} from '../../infrastructure/persistence/axios-config-registro-hogar-repository';
import { buildDefaultConfig } from '../components/registro-hogar/config/secciones-data';
import type { CampoConfig } from '../components/registro-hogar/config/CampoRow';

export const configRegistroHogarQueryKey = (etapaId: string | number) =>
  ['config-registro-hogar', String(etapaId)] as const;

export function useConfigCamposRegistroHogar(etapaId: string | number | undefined) {
  const queryClient = useQueryClient();
  const [localConfig, setLocalConfig] = useState<ConfigCamposPayload>({});
  const [isDirty, setIsDirty] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────── //

  const { data, isLoading } = useQuery({
    queryKey: configRegistroHogarQueryKey(etapaId ?? ''),
    queryFn: () => configRegistroHogarRepository.obtenerConfig(etapaId!),
    enabled: !!etapaId,
  });

  // Merge server data with defaults whenever the query resolves
  useEffect(() => {
    const defaults = buildDefaultConfig();
    const serverCampos = data?.campos ?? {};
    setLocalConfig({ ...defaults, ...serverCampos });
    setIsDirty(false);
  }, [data]);

  // ── Mutations ────────────────────────────────────────────────────────── //

  const saveMutation = useMutation({
    mutationFn: (campos: ConfigCamposPayload) =>
      configRegistroHogarRepository.guardarConfig(etapaId!, campos),
    onSuccess: (result) => {
      void queryClient.setQueryData(configRegistroHogarQueryKey(etapaId!), result);
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
    const defaults = buildDefaultConfig();
    const serverCampos = data?.campos ?? {};
    setLocalConfig({ ...defaults, ...serverCampos });
    setIsDirty(false);
  }, [data]);

  return {
    configCampos: localConfig,
    isLoading,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.isError
      ? (saveMutation.error instanceof Error ? saveMutation.error.message : 'Error al guardar')
      : null,
    isDirty,
    updateCampo,
    saveConfig,
    resetConfig,
  };
}
