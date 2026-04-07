/**
 * Repositorio para Documentos de Proceso Interno (Etapa 3 – Gestión Documental).
 */

import apiService from '../../../../core/services/api.service';

// ── Tipos ─────────────────────────────────────────────────────────────────── //

export type TipoDocumentoProcesoInterno =
  | 'ACTA_VISITA_TECNICA'
  | 'FORMULARIO_UNICO_NACIONAL'
  | 'RADICADO_CURADURIA'
  | 'EXPENSA_RADICACION_INICIAL'
  | 'EXPENSA_LICENCIA_FINAL'
  | 'PODER_AUTENTICADO'
  | 'INFORME_TECNICO_VALIDACION'
  | 'APROBACION_MINVIVIENDA'
  | 'OFICIO_CONSTRUCTOR'
  | 'TARJETA_PROFESIONAL_CONSTRUCTOR'
  | 'CERTIFICACION_EXPERIENCIA'
  | 'PLANOS_LEVANTAMIENTO_PDF'
  | 'PLANOS_LEVANTAMIENTO_DWG'
  | 'PLANOS_ARQUITECTONICOS_PDF'
  | 'PLANOS_ARQUITECTONICOS_DWG'
  | 'PLANOS_ESTRUCTURALES_PDF'
  | 'PLANOS_ESTRUCTURALES_DWG'
  | 'FOTO_VALLA_CURADURIA'
  | 'PRESUPUESTO_PDF'
  | 'PRESUPUESTO_XLSX'
  | 'OFICIO_USO_SUELOS'
  | 'CONCEPTO_GESTION_RIESGO'
  | 'RIESGO_INUNDACION_REMOCION'
  | 'CERTIFICACION_AGUA'
  | 'CERTIFICACION_ENERGIA';

export interface DocumentoProcesoInternoData {
  id: number;
  postulacion: number;
  tipo_documento: TipoDocumentoProcesoInterno;
  tipo_documento_label: string;
  nombre_archivo: string;
  ruta_archivo: string;
  numero_radicado_orfeo_solicitud: string;
  numero_radicado_orfeo_respuesta: string;
  observaciones: string;
  fecha_creacion_reg: string;
  activo_logico: boolean;
}

export interface SubirDocumentoPayload {
  postulacion: number;
  tipo_documento: TipoDocumentoProcesoInterno;
  archivo: File;
  numero_radicado_orfeo_solicitud?: string;
  numero_radicado_orfeo_respuesta?: string;
  observaciones?: string;
}

// ── Repositorio ───────────────────────────────────────────────────────────── //

export const documentoProcesoInternoRepository = {
  async listarPorPostulacion(postulacionId: number | string): Promise<DocumentoProcesoInternoData[]> {
    const { data } = await apiService.get<DocumentoProcesoInternoData[]>(
      'documentos-proceso-interno/',
      { params: { postulacion: postulacionId } },
    );
    return data;
  },

  async subir(payload: SubirDocumentoPayload): Promise<DocumentoProcesoInternoData> {
    const formData = new FormData();
    formData.append('postulacion', String(payload.postulacion));
    formData.append('tipo_documento', payload.tipo_documento);
    formData.append('archivo', payload.archivo);
    if (payload.numero_radicado_orfeo_solicitud) {
      formData.append('numero_radicado_orfeo_solicitud', payload.numero_radicado_orfeo_solicitud);
    }
    if (payload.numero_radicado_orfeo_respuesta) {
      formData.append('numero_radicado_orfeo_respuesta', payload.numero_radicado_orfeo_respuesta);
    }
    if (payload.observaciones) {
      formData.append('observaciones', payload.observaciones);
    }

    const { data } = await apiService.post<DocumentoProcesoInternoData>(
      'documentos-proceso-interno/subir/',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  async eliminar(docId: number): Promise<void> {
    await apiService.post(`documentos-proceso-interno/${docId}/eliminar/`);
  },
};
