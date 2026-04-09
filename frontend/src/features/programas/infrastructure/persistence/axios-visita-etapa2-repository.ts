/**
 * Repositorio Axios para Visitas Etapa 2.
 */

import apiService from '../../../../core/services/api.service';

// ── Types ─────────────────────────────────────────────────────────────────── //

export interface VisitaEtapa2Item {
  id: number;
  postulacion: number;
  etapa: number;
  encuestador: number;
  encuestador_nombre: string;
  estado_visita: string;
  fecha_programada: string | null;
  fecha_visita: string;
  visita_efectiva: boolean;
  motivo_no_efectiva: string | null;
  nombre_encuestado: string;
  telefono_contacto: string;
  fecha_registro: string;
  activo_logico: boolean;
  postulacion_radicado: string | null;
  tiene_datos_hogar: boolean;
}

export interface VisitaEtapa2Detail extends VisitaEtapa2Item {
  miembro: number | null;
  motivo_no_efectiva_otro: string;
  numero_documento_encuestado: string;
  acta_firmada: string;
  observaciones_generales: string;
  datos_hogar: DatosHogarEtapa2 | null;
  documentos: DocumentoVisitaE2[];
}

export interface DatosHogarEtapa2 {
  visita: number;
  foto_predio_url: string;
  calidad_tenencia: string;
  tiene_escrituras: boolean | null;
  tiene_certificado_libertad: boolean | null;
  tiene_contrato_arrendamiento: boolean | null;
  uso_inmueble: string;
  rango_ingresos_hogar: string;
  hay_adultos_mayores: boolean | null;
  hay_personas_discapacidad: boolean | null;
  hay_madre_cabeza_hogar: boolean | null;
  hay_victimas_conflicto: boolean | null;
  material_pisos: string;
  material_paredes: string;
  numero_habitaciones: number | null;
  tiene_agua: boolean | null;
  tiene_energia: boolean | null;
  tiene_gas: boolean | null;
  tiene_alcantarillado: boolean | null;
  percepcion_seguridad: string;
  riesgo_inundacion: boolean | null;
  riesgo_deslizamiento: boolean | null;
  riesgo_estructural: boolean | null;
}

export interface DocumentoVisitaE2 {
  id: number;
  visita: number;
  tipo_documento: string;
  nombre_archivo: string;
  ruta_archivo: string;
  observaciones: string;
  fecha_creacion_reg: string;
  activo_logico: boolean;
}

export interface CrearVisitaEtapa2Payload {
  postulacion: number;
  etapa: number;
  encuestador: number;
  fecha_visita: string;
  visita_efectiva: boolean;
  miembro?: number | null;
  motivo_no_efectiva?: string;
  motivo_no_efectiva_otro?: string;
  nombre_encuestado?: string;
  numero_documento_encuestado?: string;
  telefono_contacto?: string;
  acta_firmada?: string;
  observaciones_generales?: string;
}

// ── Repository ────────────────────────────────────────────────────────────── //

const BASE = 'visitas-etapa2/';

export const visitaEtapa2Repository = {
  async listar(params?: Record<string, string | number>): Promise<VisitaEtapa2Item[]> {
    const { data } = await apiService.get<any>(BASE, { params });
    return Array.isArray(data) ? data : (data.results ?? []);
  },

  async obtener(id: number): Promise<VisitaEtapa2Detail> {
    const { data } = await apiService.get<VisitaEtapa2Detail>(`${BASE}${id}/`);
    return data;
  },

  async crear(payload: CrearVisitaEtapa2Payload): Promise<VisitaEtapa2Detail> {
    const { data } = await apiService.post<VisitaEtapa2Detail>(BASE, payload);
    return data;
  },

  async actualizar(id: number, payload: Partial<CrearVisitaEtapa2Payload>): Promise<VisitaEtapa2Detail> {
    const { data } = await apiService.patch<VisitaEtapa2Detail>(`${BASE}${id}/`, payload);
    return data;
  },

  // ── Datos Hogar ──

  async obtenerDatosHogar(visitaId: number): Promise<DatosHogarEtapa2> {
    const { data } = await apiService.get<DatosHogarEtapa2>(`${BASE}${visitaId}/datos-hogar/`);
    return data;
  },

  async guardarDatosHogar(visitaId: number, payload: Partial<DatosHogarEtapa2>): Promise<DatosHogarEtapa2> {
    const { data } = await apiService.post<DatosHogarEtapa2>(
      `${BASE}${visitaId}/datos-hogar/`,
      payload,
    );
    return data;
  },

  // ── Documentos ──

  async listarDocumentos(visitaId: number): Promise<DocumentoVisitaE2[]> {
    const { data } = await apiService.get<DocumentoVisitaE2[]>(`${BASE}${visitaId}/documentos/`);
    return data;
  },

  async subirDocumento(
    visitaId: number,
    tipoDocumento: string,
    archivo: File,
    observaciones?: string,
  ): Promise<DocumentoVisitaE2> {
    const formData = new FormData();
    formData.append('tipo_documento', tipoDocumento);
    formData.append('archivo', archivo);
    if (observaciones) formData.append('observaciones', observaciones);

    const { data } = await apiService.post<DocumentoVisitaE2>(
      `${BASE}${visitaId}/documentos/`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  async eliminarDocumento(visitaId: number, docId: number): Promise<void> {
    await apiService.delete(`${BASE}${visitaId}/documentos/${docId}/`);
  },
};
