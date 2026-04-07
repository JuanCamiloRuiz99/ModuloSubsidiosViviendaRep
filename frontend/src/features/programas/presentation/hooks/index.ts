/**
 * Índice de Custom Hooks - Módulo Programas
 */

export { useProgramas, PROGRAMAS_QUERY_KEY, PROGRAMAS_STATS_QUERY_KEY } from './useProgramas';
export { useCrearPrograma } from './useCrearPrograma';
export { useActualizarPrograma } from './useActualizarPrograma';
export { useCambiarEstadoPrograma } from './useCambiarEstadoPrograma';
export { useEliminarPrograma } from './useEliminarPrograma';
export {
  useEtapas,
  useCrearEtapa,
  useActualizarEtapa,
  useEliminarEtapa,
  useTerminarEtapa,
  useReactivarEtapa,
} from './useEtapas';
export { useGuardarFormulario } from './useGuardarFormulario';
export { useTogglePublicacionFormulario, usePublicarFormulario, useInhabilitarFormulario } from './useTogglePublicacionFormulario';
export { useFormularioEtapa, useFormularioPublico, formularioQueryKey } from './useFormularioEtapa';
export type { FormularioData, FormularioPublicoData } from './useFormularioEtapa';
export {
  useVisitasEtapa2,
  useVisitaEtapa2Detail,
  useCrearVisitaEtapa2,
  useGuardarDatosHogarE2,
  useDocumentosVisitaE2,
  useSubirDocumentoE2,
  useEliminarDocumentoE2,
} from './useVisitaEtapa2';
