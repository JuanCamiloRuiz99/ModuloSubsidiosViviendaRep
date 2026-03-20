/**
 * secciones-data.tsx
 *
 * Definicion de las secciones del formulario de Registro del Hogar.
 * Solo se incluyen en `grupos` los campos que el administrador PUEDE gestionar.
 * Los campos obligatorios del sistema (no configurables) se listan en `camposFijos`.
 */
import React from 'react';

// ── Tipos ─────────────────────────────────────────────────────────────────── //

export interface CampoDefinicion {
  id: string;
  label: string;
  requeridoPorDefecto: boolean;
}

export interface GrupoDefinicion {
  titulo: string;
  campos: CampoDefinicion[];
}

export interface SeccionConfig {
  numero: number;
  id: string;
  label: string;
  descripcion: string;
  obligatoria: boolean;
  tabla: string;
  grupos: GrupoDefinicion[];
  /** Campos fijos del sistema: siempre activos y obligatorios, no configurables. */
  camposFijos?: Array<{ label: string }>;
  /** Si true, la seccion es solo informativa y no tiene campos configurables. */
  soloInformativa?: boolean;
  colorClasses: {
    border: string;
    header: string;
    badge: string;
    numero: string;
    icon: string;
  };
  icon: React.ReactNode;
}

// ── Datos ─────────────────────────────────────────────────────────────────── //

export const SECCIONES: SeccionConfig[] = [
  {
    numero: 1,
    id: 'info_hogar',
    label: 'Informacion del Hogar',
    descripcion: 'Datos de ubicacion, caracteristicas del predio y servicios publicos.',
    obligatoria: true,
    tabla: 'gestion_hogar_etapa1',
    colorClasses: {
      border: 'border-blue-200',
      header: 'bg-blue-50',
      badge: 'bg-blue-100 text-blue-700',
      numero: 'bg-blue-600 text-white',
      icon: 'text-blue-500',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    camposFijos: [
      { label: 'Departamento' },
      { label: 'Municipio' },
      { label: 'Zona (Urbana / Rural)' },
      { label: 'Direccion' },
      { label: 'Aceptacion de terminos' },
    ],
    grupos: [
      {
        titulo: 'Ubicacion del predio',
        campos: [
          { id: 'tipo_predio',             label: 'Tipo de predio',             requeridoPorDefecto: true },
          { id: 'comuna',                  label: 'Comuna',                     requeridoPorDefecto: false },
          { id: 'barrio_vereda',           label: 'Barrio / Vereda',            requeridoPorDefecto: true },
          { id: 'observaciones_direccion', label: 'Observaciones de direccion', requeridoPorDefecto: false },
        ],
      },
      {
        titulo: 'Informacion del predio',
        campos: [
          { id: 'estrato',                label: 'Estrato socioeconomico',  requeridoPorDefecto: true },
          { id: 'es_propietario',         label: 'Condicion de propietario', requeridoPorDefecto: true },
          { id: 'numero_predial',         label: 'Numero predial',           requeridoPorDefecto: false },
          { id: 'matricula_inmobiliaria', label: 'Matricula inmobiliaria',   requeridoPorDefecto: false },
          { id: 'avaluo_catastral',       label: 'Avaluo catastral',         requeridoPorDefecto: false },
        ],
      },
      {
        titulo: 'Servicios publicos',
        campos: [
          { id: 'numero_matricula_agua',   label: 'No. matricula de agua',   requeridoPorDefecto: false },
          { id: 'numero_contrato_energia', label: 'No. contrato de energia', requeridoPorDefecto: false },
        ],
      },
      {
        titulo: 'Informacion adicional',
        campos: [
          { id: 'tiempo_residencia',               label: 'Tiempo de residencia',               requeridoPorDefecto: true },
          { id: 'tiene_dependientes',              label: 'Tiene dependientes',                 requeridoPorDefecto: true },
          { id: 'personas_con_discapacidad_hogar', label: 'Personas con discapacidad en hogar', requeridoPorDefecto: false },
        ],
      },
    ],
  },
  {
    numero: 2,
    id: 'miembros',
    label: 'Composicion del Hogar',
    descripcion: 'Registro de cada miembro del hogar con datos personales, socioeconomicos y condiciones especiales.',
    obligatoria: true,
    tabla: 'miembros_hogar',
    colorClasses: {
      border: 'border-purple-200',
      header: 'bg-purple-50',
      badge: 'bg-purple-100 text-purple-700',
      numero: 'bg-purple-600 text-white',
      icon: 'text-purple-500',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    camposFijos: [
      { label: 'Tipo de documento' },
      { label: 'Numero de documento' },
      { label: 'Primer nombre' },
      { label: 'Primer apellido' },
      { label: 'Fecha de nacimiento' },
      { label: 'Parentesco' },
    ],
    grupos: [
      {
        titulo: 'Datos personales',
        campos: [
          { id: 'miembro_segundo_nombre',   label: 'Segundo nombre',   requeridoPorDefecto: false },
          { id: 'miembro_segundo_apellido', label: 'Segundo apellido', requeridoPorDefecto: false },
        ],
      },
      {
        titulo: 'Vinculo con el hogar',
        campos: [
          { id: 'miembro_parentesco_otro', label: 'Otro parentesco',    requeridoPorDefecto: false },
          { id: 'miembro_es_cabeza_hogar', label: 'Es cabeza de hogar', requeridoPorDefecto: true },
        ],
      },
      {
        titulo: 'Informacion socioeconomica',
        campos: [
          { id: 'miembro_nivel_educativo',    label: 'Nivel educativo',    requeridoPorDefecto: true },
          { id: 'miembro_situacion_laboral',  label: 'Situacion laboral',  requeridoPorDefecto: true },
          { id: 'miembro_ingresos_mensuales', label: 'Ingresos mensuales', requeridoPorDefecto: true },
          { id: 'miembro_fuente_ingresos',    label: 'Fuente de ingresos', requeridoPorDefecto: false },
        ],
      },
      {
        titulo: 'Afiliacion SISBEN',
        campos: [
          { id: 'miembro_pertenece_sisben', label: 'Pertenece al SISBEN', requeridoPorDefecto: true },
          { id: 'miembro_grupo_sisben',     label: 'Grupo SISBEN',        requeridoPorDefecto: false },
          { id: 'miembro_puntaje_sisben',   label: 'Puntaje SISBEN',      requeridoPorDefecto: false },
        ],
      },
      {
        titulo: 'Discapacidad',
        campos: [
          { id: 'miembro_tiene_discapacidad',       label: 'Tiene discapacidad',          requeridoPorDefecto: false },
          { id: 'miembro_grado_discapacidad',       label: 'Grado de discapacidad',       requeridoPorDefecto: false },
          { id: 'miembro_certificado_discapacidad', label: 'Certificado de discapacidad', requeridoPorDefecto: false },
          { id: 'miembro_numero_certificado',       label: 'Numero de certificado',       requeridoPorDefecto: false },
        ],
      },
      {
        titulo: 'Victima del conflicto',
        campos: [
          { id: 'miembro_es_victima_conflicto',     label: 'Es victima del conflicto', requeridoPorDefecto: false },
          { id: 'miembro_numero_ruv',               label: 'Numero RUV',               requeridoPorDefecto: false },
          { id: 'miembro_hecho_victimizante',       label: 'Hecho victimizante',       requeridoPorDefecto: false },
          { id: 'miembro_fecha_hecho_victimizante', label: 'Fecha del hecho',          requeridoPorDefecto: false },
        ],
      },
      {
        titulo: 'Desplazamiento forzado',
        campos: [
          { id: 'miembro_es_desplazado',          label: 'Es desplazado',            requeridoPorDefecto: false },
          { id: 'miembro_fecha_desplazamiento',   label: 'Fecha de desplazamiento',  requeridoPorDefecto: false },
          { id: 'miembro_municipio_origen',       label: 'Municipio de origen',      requeridoPorDefecto: false },
          { id: 'miembro_departamento_origen',    label: 'Departamento de origen',   requeridoPorDefecto: false },
          { id: 'miembro_motivo_desplazamiento',  label: 'Motivo de desplazamiento', requeridoPorDefecto: false },
        ],
      },
      {
        titulo: 'Firmante de paz',
        campos: [
          { id: 'miembro_es_firmante_paz',                label: 'Es firmante de paz',        requeridoPorDefecto: false },
          { id: 'miembro_codigo_reincorporacion',         label: 'Codigo de reincorporacion', requeridoPorDefecto: false },
          { id: 'miembro_etcr',                           label: 'ETCR',                      requeridoPorDefecto: false },
          { id: 'miembro_estado_proceso_reincorporacion', label: 'Estado del proceso',        requeridoPorDefecto: false },
        ],
      },
    ],
  },
  {
    numero: 3,
    id: 'documentos',
    label: 'Documentos',
    descripcion: 'Carga de archivos del hogar y documentos individuales de cada miembro.',
    obligatoria: false,
    tabla: 'documentos_gestion_hogar_etapa1 · documentos_miembro_hogar',
    colorClasses: {
      border: 'border-teal-200',
      header: 'bg-teal-50',
      badge: 'bg-teal-100 text-teal-700',
      numero: 'bg-teal-600 text-white',
      icon: 'text-teal-500',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    camposFijos: [
      { label: 'Foto cedula frente' },
      { label: 'Foto cedula reverso' },
    ],
    grupos: [
      {
        titulo: 'Documentos del hogar',
        campos: [
          { id: 'doc_hogar_recibo_predial',                 label: 'Recibo predial',                      requeridoPorDefecto: false },
          { id: 'doc_hogar_certificado_tradicion_libertad', label: 'Certificado de tradicion y libertad', requeridoPorDefecto: false },
          { id: 'doc_hogar_escritura_publica_predio',       label: 'Escritura publica del predio',        requeridoPorDefecto: false },
          { id: 'doc_hogar_recibo_servicios_publicos',      label: 'Recibo de servicios publicos',        requeridoPorDefecto: false },
          { id: 'doc_hogar_declaracion_juramentada',        label: 'Declaracion juramentada',             requeridoPorDefecto: false },
          { id: 'doc_hogar_certificado_residencia',         label: 'Certificado de residencia',           requeridoPorDefecto: false },
          { id: 'doc_hogar_certificado_sisben',             label: 'Certificado SISBEN',                  requeridoPorDefecto: false },
          { id: 'doc_hogar_certificado_discapacidad',       label: 'Certificado de discapacidad',         requeridoPorDefecto: false },
          { id: 'doc_hogar_registro_victima',               label: 'Registro de victima (RUV)',           requeridoPorDefecto: false },
          { id: 'doc_hogar_otro',                           label: 'Otro (libre)',                        requeridoPorDefecto: false },
        ],
      },
      {
        titulo: 'Documentos por miembro',
        campos: [
          { id: 'doc_miembro_cedula',                   label: 'Cedula de ciudadania',        requeridoPorDefecto: false },
          { id: 'doc_miembro_registro_civil',           label: 'Registro civil',              requeridoPorDefecto: false },
          { id: 'doc_miembro_tarjeta_identidad',        label: 'Tarjeta de identidad',        requeridoPorDefecto: false },
          { id: 'doc_miembro_certificado_discapacidad', label: 'Certificado de discapacidad', requeridoPorDefecto: false },
          { id: 'doc_miembro_certificado_victima',      label: 'Certificado de victima',      requeridoPorDefecto: false },
          { id: 'doc_miembro_otro',                     label: 'Otro (libre)',                requeridoPorDefecto: false },
        ],
      },
    ],
  },
  {
    numero: 4,
    id: 'revision',
    label: 'Revision y Envio',
    descripcion: 'Resumen de todos los datos ingresados antes del envio final.',
    obligatoria: true,
    tabla: '— (paso de confirmacion)',
    soloInformativa: true,
    colorClasses: {
      border: 'border-green-200',
      header: 'bg-green-50',
      badge: 'bg-green-100 text-green-700',
      numero: 'bg-green-600 text-white',
      icon: 'text-green-500',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    grupos: [],
  },
];

// ── Config por defecto ─────────────────────────────────────────────────────── //

export function buildDefaultConfig(): Record<string, { requerido: boolean; habilitado: boolean }> {
  const config: Record<string, { requerido: boolean; habilitado: boolean }> = {};
  for (const seccion of SECCIONES) {
    for (const grupo of seccion.grupos) {
      for (const campo of grupo.campos) {
        config[campo.id] = { requerido: campo.requeridoPorDefecto, habilitado: true };
      }
    }
  }
  return config;
}
