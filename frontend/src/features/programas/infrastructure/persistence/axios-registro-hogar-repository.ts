/**
 * Repositorio del Registro del Hogar — Etapa 1.
 *
 * Gestiona el envío de datos de gestion_hogar_etapa1,
 * miembros_hogar, documentos_gestion_hogar_etapa1 e
 * documentos_miembro_hogar a través de la API.
 *
 * Flujo de envío:
 *   1.  POST /etapas/:id/registro-hogar/  → JSON   → devuelve id_postulacion + ids de miembros
 *   2a. POST /postulaciones/:id/documentos-hogar/   → FormData (por cada archivo del hogar)
 *   2b. POST /miembros-hogar/:id/documentos/        → FormData (por cada archivo de miembro)
 */

import apiService from '../../../../core/services/api.service';
import type {
  InfoHogarForm,
  MiembroHogarForm,
  TipoDocumentoHogar,
  TipoDocumentoMiembro,
  RegistroHogarResult,
  DocumentoHogarEntry,
  DocumentoMiembroEntry,
} from '../../domain/registro-hogar.types';

// ── Tipos de respuesta del backend ──────────────────────────────────────── //

interface RegistroHogarResponse extends RegistroHogarResult {
  /** Mapa _localId → id_miembro para subir los documentos por miembro. */
  miembros_ids: Record<string, number>;
}

// ── Helpers ──────────────────────────────────────────────────────────────── //

/** Serializa el payload de un miembro eliminando los campos de só control de UI. */
function serializarMiembro(m: MiembroHogarForm) {
  const { _localId: _, documentos: __, ...rest } = m;
  return rest;
}

// ── Repositorio ──────────────────────────────────────────────────────────── //

export const registroHogarRepository = {
  /**
   * Envía la estructura JSON del hogar y sus miembros.
   * Devuelve el resultado que incluye el id_postulacion y los ids de miembros.
   */
  async enviarRegistro(
    etapaId: number,
    infoHogar: InfoHogarForm,
    miembros: MiembroHogarForm[],
  ): Promise<RegistroHogarResponse> {
    const { data } = await apiService.post<RegistroHogarResponse>(
      `etapas/${etapaId}/registro-hogar/`,
      {
        info_hogar: infoHogar,
        miembros: miembros.map(serializarMiembro),
      },
    );
    return data;
  },

  /** Sube un documento del hogar como FormData. */
  async subirDocumentoHogar(
    postulacionId: number,
    entrada: DocumentoHogarEntry & { file: File },
  ): Promise<void> {
    const form = new FormData();
    form.append('tipo_documento', entrada.tipo_documento);
    form.append('archivo', entrada.file);
    if (entrada.observaciones) form.append('observaciones', entrada.observaciones);

    await apiService.post(
      `postulaciones/${postulacionId}/documentos-hogar/`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  /** Sube un documento de un miembro del hogar como FormData. */
  async subirDocumentoMiembro(
    miembroId: number,
    entrada: DocumentoMiembroEntry & { file: File },
  ): Promise<void> {
    const form = new FormData();
    form.append('tipo_documento', entrada.tipo_documento as TipoDocumentoMiembro);
    form.append('archivo', entrada.file);
    if (entrada.observaciones) form.append('observaciones', entrada.observaciones);

    await apiService.post(
      `miembros-hogar/${miembroId}/documentos/`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  /**
   * Orquesta el envío completo: datos JSON → documentos del hogar →
   * documentos de cada miembro. Si alguna subida de documento falla se
   * ignora el error (el registro ya quedó guardado).
   */
  async enviarCompleto(
    etapaId: number,
    infoHogar: InfoHogarForm,
    miembros: MiembroHogarForm[],
    documentosHogar: DocumentoHogarEntry[],
  ): Promise<RegistroHogarResult> {
    // 1. Enviar datos estructurados
    const resultado = await this.enviarRegistro(etapaId, infoHogar, miembros);

    // 2. Subir documentos del hogar (en paralelo, sin bloquear por errores)
    const uploadsHogar = documentosHogar
      .filter((d): d is DocumentoHogarEntry & { file: File } => d.file !== null)
      .map(d =>
        this.subirDocumentoHogar(resultado.id_postulacion, d).catch(() => undefined),
      );

    // 3. Subir documentos por miembro
    const uploadsMiembros = miembros.flatMap(m => {
      const miembroId = resultado.miembros_ids[m._localId];
      if (!miembroId) return [];
      return m.documentos
        .filter((d): d is DocumentoMiembroEntry & { file: File } => d.file !== null)
        .map(d =>
          this.subirDocumentoMiembro(miembroId, d).catch(() => undefined),
        );
    });

    await Promise.all([...uploadsHogar, ...uploadsMiembros]);

    return resultado;
  },
};
