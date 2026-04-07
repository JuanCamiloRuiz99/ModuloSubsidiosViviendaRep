/**
 * Hook para descarga masiva de documentos de postulaciones en ZIP.
 * Usa fetch en vez de axios para evitar problemas de timeout con blobs grandes.
 */

import { useMutation } from '@tanstack/react-query';
import storageService from '../../../../core/services/storage.service';

export interface TiposDocumentoSeleccion {
  hogar: string[];
  miembro: string[];
  visita: string[];
  proceso: string[];
}

export interface DescargarDocumentosPayload {
  postulacion_ids: number[];
  tipos_documento: TiposDocumentoSeleccion;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function useDescargarDocumentos() {
  return useMutation({
    mutationFn: async (payload: DescargarDocumentosPayload) => {
      const token = storageService.getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const url = `${API_BASE}/postulaciones/descargar-documentos/`;

      const resp = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Error ${resp.status}`);
      }

      const blob = await resp.blob();

      if (blob.size === 0) {
        throw new Error('El archivo descargado está vacío. No se encontraron documentos.');
      }

      // Extraer nombre del archivo del header Content-Disposition
      const disposition = resp.headers.get('Content-Disposition') ?? '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? 'documentos_postulaciones.zip';

      // Trigger browser download
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
}
