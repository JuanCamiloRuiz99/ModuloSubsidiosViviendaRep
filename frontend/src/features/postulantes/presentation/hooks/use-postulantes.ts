/**
 * usePostulantes – lista todos los registros del hogar desde la API.
 * usePostulanteDetalle – detalle completo de un registro (con miembros).
 * useActualizarPostulante – mutación PATCH para editar un registro.
 * GET /api/postulaciones/registro-hogar/
 * GET /api/postulaciones/registro-hogar/{id}/
 * PATCH /api/postulaciones/registro-hogar/{id}/actualizar/
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../../../core/services';

// ── Tipos ────────────────────────────────────────────────────────────────── //

export interface CiudadanoData {
  id_persona?:             number;
  tipo_documento:          string;
  tipo_documento_label:    string;
  numero_documento:        string;
  primer_nombre:           string;
  segundo_nombre:          string;
  primer_apellido:         string;
  segundo_apellido:        string;
  fecha_nacimiento?:       string;
  sexo?:                   string;
  nacionalidad?:           string;
  telefono?:               string;
  correo_electronico?:     string;
  departamento_nacimiento?: string;
  municipio_nacimiento?:   string;
}

export interface MiembroHogar {
  id:                    number;
  tipo_documento:        string;
  tipo_documento_label:  string;
  numero_documento:      string;
  primer_nombre:         string;
  segundo_nombre:        string;
  primer_apellido:       string;
  segundo_apellido:      string;
  fecha_nacimiento:      string;
  parentesco:            string;
  es_cabeza_hogar:       boolean;
  nivel_educativo:       string;
  situacion_laboral:     string;
  ingresos_mensuales:    string | null;
  pertenece_sisben:      boolean | null;
  grupo_sisben:          string;
  tiene_discapacidad:    boolean;
  es_victima_conflicto:  boolean;
  es_desplazado:         boolean;
  parentesco_otro:       string;
  fuente_ingresos:       string;
  puntaje_sisben:        string | null;
  grado_discapacidad:    string;
  certificado_discapacidad: boolean | null;
  numero_certificado:    string;
  numero_ruv:            string;
  hecho_victimizante:    string;
  fecha_hecho_victimizante: string | null;
  fecha_desplazamiento:  string | null;
  municipio_origen:      string;
  departamento_origen:   string;
  motivo_desplazamiento: string;
  es_firmante_paz:       boolean;
  codigo_reincorporacion: string;
  etcr:                  string;
  estado_proceso_reincorporacion: string;
  documentos: DocumentoAdjunto[];
}

export interface DocumentoAdjunto {
  id: number;
  tipo_documento: string;
  tipo_documento_label: string;
  ruta_archivo: string;
  archivo_url: string;
  observaciones: string;
  fecha_carga: string;
}

export interface PostulanteRow {
  id:              number;
  numero_radicado: string;
  fecha_radicado:  string;
  id_postulacion:  number | null;
  estado:          string;
  estado_label:    string;
  programa_nombre: string;
  ciudadano:       CiudadanoData | null;
  departamento:    string;
  municipio:       string;
  zona:            string;
  zona_label:      string;
  tipo_predio:     string;
  direccion:       string;
  total_miembros:  number;
}

export interface PostulanteDetalle extends PostulanteRow {
  comuna:                          string;
  barrio_vereda:                   string;
  observaciones_direccion:         string;
  estrato:                         string;
  es_propietario:                  boolean | null;
  numero_predial:                  string;
  matricula_inmobiliaria:          string;
  avaluo_catastral:                string;
  numero_matricula_agua:           string;
  numero_contrato_energia:         string;
  tiempo_residencia:               string;
  tiene_dependientes:              boolean | null;
  personas_con_discapacidad_hogar: boolean | null;
  acepta_terminos_condiciones:     boolean;
  campos_incorrectos:              string[];
  observaciones_revision:          string;
  documentos_hogar:                DocumentoAdjunto[];
  miembros:                        MiembroHogar[];
}

/** Datos enviados al endpoint PATCH  /registro-hogar/{id}/actualizar/  */
export interface ActualizarPostulanteData {
  estado?:                 string;
  campos_incorrectos?:     string[];
  observaciones_revision?: string;
}

// ── Query keys ────────────────────────────────────────────────────────────── //

export const POSTULANTES_QUERY_KEY = (estado?: string, programaId?: string) =>
  ['postulantes-registro-hogar', estado, programaId] as const;

export const POSTULANTE_DETALLE_KEY = (id: number) =>
  ['postulante-detalle', id] as const;

// ── Hook: lista ───────────────────────────────────────────────────────────── //

export function usePostulantes(estado?: string, programaId?: string) {
  const params: Record<string, string> = {};
  if (estado)     params.estado      = estado;
  if (programaId) params.programa_id = programaId;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: POSTULANTES_QUERY_KEY(estado, programaId),
    queryFn: () =>
      apiService
        .get<PostulanteRow[]>('postulaciones/registro-hogar/', { params })
        .then((r) => r.data),
  });

  return {
    postulantes: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}

// ── Hook: detalle ─────────────────────────────────────────────────────────── //

export function usePostulanteDetalle(id: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: POSTULANTE_DETALLE_KEY(id ?? 0),
    queryFn: () =>
      apiService
        .get<PostulanteDetalle>(`postulaciones/registro-hogar/${id}/`)
        .then((r) => r.data),
    enabled: id !== null && id > 0,
  });

  return {
    detalle: data ?? null,
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}

// ── Hook: actualizar ──────────────────────────────────────────────────────── //

export function useActualizarPostulante() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarPostulanteData }) =>
      apiService
        .patch<{ detail: string }>(
          `postulaciones/registro-hogar/${id}/actualizar/`,
          data,
        )
        .then((r) => r.data),
    onSuccess: (_result, variables) => {
      // Invalida la lista y el detalle del registro actualizado
      void queryClient.invalidateQueries({ queryKey: ['postulantes-registro-hogar'] });
      void queryClient.invalidateQueries({ queryKey: POSTULANTE_DETALLE_KEY(variables.id) });
    },
  });
}
