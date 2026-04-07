/**
 * useConfigCamposVisitaTecnica — Hook para cargar y guardar la configuración
 * de campos del formulario de Visita Técnica de una etapa.
 *
 * Gestión local optimista: los cambios son inmediatos en UI y se persisten
 * con el botón "Guardar configuración".
 */
import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  configVisitaTecnicaRepository,
  type ConfigCamposVisitaPayload,
} from '../../infrastructure/persistence/axios-config-visita-tecnica-repository';
import { buildDefaultConfigVisita } from '../components/visita-tecnica/config/secciones-data-visita';
import type { CampoConfig } from '../components/registro-hogar/config/CampoRow';

export const configVisitaTecnicaQueryKey = (etapaId: string | number) =>
  ['config-visita-tecnica', String(etapaId)] as const;

export function useConfigCamposVisitaTecnica(etapaId: string | number | undefined) {
  const queryClient = useQueryClient();
  const [localConfig, setLocalConfig] = useState<ConfigCamposVisitaPayload>({});
  const [isDirty, setIsDirty] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────── //

  const { data, isLoading } = useQuery({
    queryKey: configVisitaTecnicaQueryKey(etapaId ?? ''),
    queryFn: () => configVisitaTecnicaRepository.obtenerConfig(etapaId!),
    enabled: !!etapaId,
  });

  // Merge server data with defaults whenever the query resolves
  useEffect(() => {
    const defaults = buildDefaultConfigVisita();
    const serverCampos = data?.campos ?? {};
    setLocalConfig({ ...defaults, ...serverCampos });
    setIsDirty(false);
  }, [data]);

  // ── Mutations ────────────────────────────────────────────────────────── //

  const saveMutation = useMutation({
    mutationFn: (campos: ConfigCamposVisitaPayload) =>
      configVisitaTecnicaRepository.guardarConfig(etapaId!, campos),
    onSuccess: (result) => {
      void queryClient.setQueryData(configVisitaTecnicaQueryKey(etapaId!), result);
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
    const defaults = buildDefaultConfigVisita();
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
