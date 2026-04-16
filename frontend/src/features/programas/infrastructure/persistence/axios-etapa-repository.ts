/**
 * Repositorio de Etapas usando apiService
 */

import apiService from '../../../../core/services/api.service';

export type ModuloPrincipal =
  | 'REGISTRO_HOGAR'
  | 'VISITA_TECNICA'
  | 'GESTION_DOCUMENTAL_INTERNA';

export interface EtapaData {
  id: number;
  programa: number;
  numero_etapa: number;
  modulo_principal: ModuloPrincipal;
  fecha_creacion: string;
  usuario_creacion: number | null;
  usuario_modificacion: number | null;
  fecha_modificacion: string | null;
  activo_logico: boolean;
  formulario_configurado: boolean;
  formulario_estado: 'BORRADOR' | 'PUBLICADO' | null;
  registro_hogar_publicado: boolean;
  visita_tecnica_publicado: boolean;
  gestion_documental_publicado: boolean;
  registro_hogar_guardado: boolean;
  visita_tecnica_guardado: boolean;
  gestion_documental_guardado: boolean;
  finalizada: boolean;
  fecha_finalizacion: string | null;
}

export interface CrearEtapaPayload {
  programa: number;
  numero_etapa: number;
  modulo_principal: ModuloPrincipal;
}

export interface ActualizarEtapaPayload {
  numero_etapa?: number;
  modulo_principal?: ModuloPrincipal;
}

export interface CampoFormularioData {
  campo_catalogo: string;
  orden: number;
  obligatorio: boolean;
  texto_ayuda: string;
}

export interface FormularioData {
  estado: 'BORRADOR' | 'PUBLICADO' | null;
  fecha_publicacion: string | null;
  campos: CampoFormularioData[];
}

export interface FormularioPublicoData extends FormularioData {
  etapa_id: number;
  numero_etapa: number;
  modulo_principal: ModuloPrincipal;
  programa_nombre: string;
}

export interface EtapaInfoPublica {
  etapa_id: number;
  numero_etapa: number;
  programa_nombre: string;
  registro_hogar_publicado: boolean;
}

export interface EnvioFormularioResult {
  id_persona: number;
  primer_nombre: string;
  primer_apellido: string;
  fecha_creacion: string;
  registrado: boolean;
}

export const etapaRepository = {
  async listarPorPrograma(programaId: string | number): Promise<EtapaData[]> {
    const { data } = await apiService.get<any>('etapas/', {
      params: { programa: programaId },
    });
    // DRF can return paginated or plain list
    return Array.isArray(data) ? data : (data.results ?? []);
  },

  async crear(payload: CrearEtapaPayload): Promise<EtapaData> {
    const { data } = await apiService.post<EtapaData>('etapas/', payload);
    return data;
  },

  async actualizar(id: number, payload: ActualizarEtapaPayload): Promise<EtapaData> {
    const { data } = await apiService.patch<EtapaData>(`etapas/${id}/`, payload);
    return data;
  },

  async eliminar(id: number): Promise<void> {
    await apiService.delete(`etapas/${id}/`);
  },

  async guardarFormulario(
    etapaId: number,
    campos: Array<{
      campo_catalogo: string;
      orden: number;
      obligatorio: boolean;
      texto_ayuda: string;
    }>,
  ): Promise<FormularioData> {
    const { data } = await apiService.post<FormularioData>(
      `etapas/${etapaId}/formulario/`,
      { campos },
    );
    return data;
  },

  async publicarFormulario(etapaId: number): Promise<{ estado: string; fecha_publicacion: string }> {
    const { data } = await apiService.post<{ estado: string; fecha_publicacion: string }>(
      `etapas/${etapaId}/publicar-formulario/`,
      {},
    );
    return data;
  },

  async inhabilitarFormulario(etapaId: number): Promise<FormularioData> {
    const { data } = await apiService.post<FormularioData>(
      `etapas/${etapaId}/inhabilitar-formulario/`,
      {},
    );
    return data;
  },

  async publicarRegistroHogar(etapaId: number): Promise<{ publicado: boolean; fecha_modificacion: string }> {
    const { data } = await apiService.post<{ publicado: boolean; fecha_modificacion: string }>(
      `etapas/${etapaId}/publicar-registro-hogar/`,
      {},
    );
    return data;
  },

  async inhabilitarRegistroHogar(etapaId: number): Promise<{ publicado: boolean; fecha_modificacion: string }> {
    const { data } = await apiService.post<{ publicado: boolean; fecha_modificacion: string }>(
      `etapas/${etapaId}/inhabilitar-registro-hogar/`,
      {},
    );
    return data;
  },

  async publicarVisitaTecnica(etapaId: number): Promise<{ estado: string; fecha_publicacion: string }> {
    const { data } = await apiService.post<{ estado: string; fecha_publicacion: string }>(
      `etapas/${etapaId}/publicar-visita-tecnica/`,
      {},
    );
    return data;
  },

  async inhabilitarVisitaTecnica(etapaId: number): Promise<{ estado: string }> {
    const { data } = await apiService.post<{ estado: string }>(
      `etapas/${etapaId}/inhabilitar-visita-tecnica/`,
      {},
    );
    return data;
  },

  async publicarGestionDocumental(etapaId: number): Promise<{ publicado: boolean; fecha_modificacion: string }> {
    const { data } = await apiService.post<{ publicado: boolean; fecha_modificacion: string }>(
      `etapas/${etapaId}/publicar-gestion-documental/`,
      {},
    );
    return data;
  },

  async inhabilitarGestionDocumental(etapaId: number): Promise<{ publicado: boolean }> {
    const { data } = await apiService.post<{ publicado: boolean }>(
      `etapas/${etapaId}/inhabilitar-gestion-documental/`,
      {},
    );
    return data;
  },

  async obtenerFormulario(etapaId: number): Promise<FormularioData> {
    const { data } = await apiService.get<FormularioData>(`etapas/${etapaId}/formulario/`);
    return data;
  },

  async obtenerFormularioPublico(etapaId: number): Promise<FormularioPublicoData> {
    const { data } = await apiService.get<FormularioPublicoData>(
      `etapas/${etapaId}/formulario-publico/`,
    );
    return data;
  },

  async obtenerInfoPublica(etapaId: number): Promise<EtapaInfoPublica> {
    const { data } = await apiService.get<EtapaInfoPublica>(
      `etapas/${etapaId}/info-publica/`,
    );
    return data;
  },

  async enviarFormulario(
    etapaId: number,
    respuestas: Record<string, string>,
  ): Promise<EnvioFormularioResult> {
    const { data } = await apiService.post<EnvioFormularioResult>(
      `etapas/${etapaId}/enviar-formulario/`,
      { respuestas },
    );
    return data;
  },

  async terminarEtapa(etapaId: number): Promise<EtapaData> {
    const { data } = await apiService.post<EtapaData>(
      `etapas/${etapaId}/terminar-etapa/`,
      {},
    );
    return data;
  },

  async reactivarEtapa(etapaId: number): Promise<EtapaData> {
    const { data } = await apiService.post<EtapaData>(
      `etapas/${etapaId}/reactivar-etapa/`,
      {},
    );
    return data;
  },
};
