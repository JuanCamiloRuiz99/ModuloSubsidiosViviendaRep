/**
 * Repositorio para la configuración de campos del formulario de Gestión Documental Interna.
 * Endpoint: GET/POST /api/etapas/{etapaId}/gestion-documental-config/
 */

import apiService from '../../../../core/services/api.service';
import type { CampoConfig } from '../../presentation/components/registro-hogar/config/CampoRow';

export type ConfigCamposGestionPayload = Record<string, CampoConfig>;

export interface ConfigGestionDocumentalResponse {
  campos: ConfigCamposGestionPayload;
  fecha_modificacion: string | null;
}

export const configGestionDocumentalRepository = {
  obtenerConfig(etapaId: number | string): Promise<ConfigGestionDocumentalResponse> {
    return apiService
      .get<ConfigGestionDocumentalResponse>(`etapas/${etapaId}/gestion-documental-config/`)
      .then(r => r.data);
  },

  guardarConfig(
    etapaId: number | string,
    campos: ConfigCamposGestionPayload,
  ): Promise<ConfigGestionDocumentalResponse> {
    return apiService
      .post<ConfigGestionDocumentalResponse>(`etapas/${etapaId}/gestion-documental-config/`, { campos })
      .then(r => r.data);
  },
};
