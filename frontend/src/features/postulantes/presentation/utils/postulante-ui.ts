/**
 * Utilidades de presentación compartidas para el módulo de Postulantes.
 * Centraliza estilos, helpers de formato y opciones de filtro
 * usados por PostulantesPage, PostulanteDetalleModal y PostulanteEditarModal.
 */

/** Clases Tailwind para cada estado de postulación */
export const ESTADO_STYLES: Record<string, string> = {
  REGISTRADA:          'bg-blue-100   text-blue-700   border border-blue-200',
  EN_REVISION:         'bg-yellow-100 text-yellow-700 border border-yellow-200',
  SUBSANACION:         'bg-amber-100  text-amber-800  border border-amber-200',
  VISITA_PENDIENTE:    'bg-orange-100 text-orange-700 border border-orange-200',
  VISITA_ASIGNADA:     'bg-sky-100    text-sky-700    border border-sky-200',
  VISITA_PROGRAMADA:   'bg-indigo-100 text-indigo-700 border border-indigo-200',
  VISITA_REALIZADA:        'bg-purple-100 text-purple-700 border border-purple-200',
  DOCUMENTOS_INCOMPLETOS:  'bg-teal-100   text-teal-700   border border-teal-200',
  DOCUMENTOS_CARGADOS:     'bg-cyan-100   text-cyan-700   border border-cyan-200',
  BENEFICIADO:             'bg-emerald-100 text-emerald-700 border border-emerald-200',
  NO_BENEFICIARIO:         'bg-rose-100    text-rose-700    border border-rose-200',
  APROBADA:                'bg-green-100  text-green-700  border border-green-200',
  RECHAZADA:           'bg-red-100    text-red-700    border border-red-200',
};

/** Opciones para el <select> de filtro por estado */
export const ESTADOS_FILTRO = [
  { value: '',                   label: 'Todos los estados' },
  { value: 'REGISTRADA',         label: 'Registrada' },
  { value: 'EN_REVISION',        label: 'En revisión' },
  { value: 'SUBSANACION',        label: 'Subsanación' },
  { value: 'VISITA_PENDIENTE',   label: 'Visita pendiente' },
  { value: 'VISITA_ASIGNADA',    label: 'Visita asignada' },
  { value: 'VISITA_PROGRAMADA',  label: 'Visita programada' },
  { value: 'VISITA_REALIZADA',       label: 'Visita realizada' },
  { value: 'DOCUMENTOS_INCOMPLETOS', label: 'Documentos incompletos' },
  { value: 'DOCUMENTOS_CARGADOS',    label: 'Documentos cargados' },
  { value: 'BENEFICIADO',        label: 'Beneficiado' },
  { value: 'NO_BENEFICIARIO',    label: 'No beneficiario' },
  { value: 'APROBADA',           label: 'Aprobada' },
  { value: 'RECHAZADA',          label: 'Rechazada' },
] as const;

/** Nombre completo del titular a partir de partes opcionales */
export function nombreCompleto(
  ...parts: (string | null | undefined)[]
): string {
  return parts.filter(Boolean).join(' ') || '—';
}

/** Formatea ISO → dd/mm/yyyy en locale Colombia */
export function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  });
}

/** Formatea ISO → dd de mes de yyyy en locale Colombia */
export function formatFechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

/** Formatea un valor numérico como moneda COP */
export function formatMoneda(val: string | null | undefined): string {
  if (!val) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(Number(val));
}

/** Formatea un booleano como Sí/No/— */
export function fmtBool(val: boolean | null | undefined): string {
  if (val === null || val === undefined) return '—';
  return val ? 'Sí' : 'No';
}

/** Valor de texto con fallback a — */
export function fmt(val: string | null | undefined): string {
  return val?.trim() || '—';
}
