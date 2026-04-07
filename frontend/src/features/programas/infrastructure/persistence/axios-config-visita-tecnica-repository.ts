/**
 * Repositorio para la configuración de campos del formulario de Visita Técnica.
 * Endpoint: GET/POST /api/etapas/{etapaId}/visita-tecnica-config/
 */

import apiService from '../../../../core/services/api.service';
import type { CampoConfig } from '../../presentation/components/registro-hogar/config/CampoRow';

export type ConfigCamposVisitaPayload = Record<string, CampoConfig>;

export interface ConfigVisitaTecnicaResponse {
  campos: ConfigCamposVisitaPayload;
  fecha_modificacion: string | null;
}

export const configVisitaTecnicaRepository = {
  obtenerConfig(etapaId: number | string): Promise<ConfigVisitaTecnicaResponse> {
    return apiService
      .get<ConfigVisitaTecnicaResponse>(`etapas/${etapaId}/visita-tecnica-config/`)
      .then(r => r.data);
  },

  guardarConfig(
    etapaId: number | string,
    campos: ConfigCamposVisitaPayload,
  ): Promise<ConfigVisitaTecnicaResponse> {
    return apiService
      .post<ConfigVisitaTecnicaResponse>(`etapas/${etapaId}/visita-tecnica-config/`, { campos })
      .then(r => r.data);
  },
};
