/**
 * Repositorio para la configuración de campos del formulario de Registro del Hogar.
 * Endpoint: GET/POST /api/etapas/{etapaId}/registro-hogar-config/
 */

import apiService from '../../../../core/services/api.service';
import type { CampoConfig } from '../../presentation/components/registro-hogar/config/CampoRow';

export type ConfigCamposPayload = Record<string, CampoConfig>;

export interface ConfigRegistroHogarResponse {
  campos: ConfigCamposPayload;
  fecha_modificacion: string | null;
}

export const configRegistroHogarRepository = {
  obtenerConfig(etapaId: number | string): Promise<ConfigRegistroHogarResponse> {
    return apiService
      .get<ConfigRegistroHogarResponse>(`etapas/${etapaId}/registro-hogar-config/`)
      .then(r => r.data);
  },

  guardarConfig(
    etapaId: number | string,
    campos: ConfigCamposPayload,
  ): Promise<ConfigRegistroHogarResponse> {
    return apiService
      .post<ConfigRegistroHogarResponse>(`etapas/${etapaId}/registro-hogar-config/`, { campos })
      .then(r => r.data);
  },
};
