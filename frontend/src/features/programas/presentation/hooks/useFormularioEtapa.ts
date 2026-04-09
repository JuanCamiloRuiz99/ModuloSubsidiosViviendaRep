import { useQuery } from '@tanstack/react-query';
import { etapaRepository } from '../../infrastructure/persistence/axios-etapa-repository';
import type { FormularioData, FormularioPublicoData, EtapaInfoPublica } from '../../infrastructure/persistence/axios-etapa-repository';

export type { FormularioData, FormularioPublicoData, EtapaInfoPublica };

export function formularioQueryKey(etapaId: string | number) {
  return ['formulario', String(etapaId)] as const;
}

/** Carga la configuración guardada del formulario de una etapa (requiere auth). */
export function useFormularioEtapa(etapaId: string | undefined) {
  return useQuery({
    queryKey: formularioQueryKey(etapaId ?? ''),
    queryFn: () => etapaRepository.obtenerFormulario(Number(etapaId)),
    enabled: !!etapaId,
    staleTime: 0,
  });
}

/** Carga el formulario publicado de una etapa (endpoint público, sin auth). */
export function useFormularioPublico(etapaId: string | undefined) {
  return useQuery({
    queryKey: ['formulario-publico', etapaId ?? ''],
    queryFn: () => etapaRepository.obtenerFormularioPublico(Number(etapaId)),
    enabled: !!etapaId,
    retry: false,
  });
}

/** Carga información básica pública de la etapa (nombre del programa, número). */
export function useEtapaInfoPublica(etapaId: string | undefined) {
  return useQuery({
    queryKey: ['etapa-info-publica', etapaId ?? ''],
    queryFn: () => etapaRepository.obtenerInfoPublica(Number(etapaId)),
    enabled: !!etapaId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
