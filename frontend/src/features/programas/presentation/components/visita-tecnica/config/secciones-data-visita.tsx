/**
 * secciones-data-visita.tsx
 *
 * Definición de las secciones del formulario de Visita Técnica (Etapa 2).
 * Solo se incluyen en `grupos` los campos que el administrador PUEDE gestionar.
 * Los campos fijos del sistema (no configurables) se listan en `camposFijos`.
 */
import React from 'react';
import type {
  SeccionConfig,
} from '../../registro-hogar/config/secciones-data';

// ── Datos ─────────────────────────────────────────────────────────────────── //

export const SECCIONES_VISITA: SeccionConfig[] = [
  {
    numero: 1,
    id: 'info_visita',
    label: 'Información de la Visita',
    descripcion: 'Datos generales de la visita técnica realizada.',
    obligatoria: true,
    tabla: 'visitas',
    colorClasses: {
      border: 'border-blue-200',
      header: 'bg-blue-50',
      badge: 'bg-blue-100 text-blue-700',
      numero: 'bg-blue-600 text-white',
      icon: 'text-blue-500',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    camposFijos: [
      { label: 'Fecha de la visita' },
      { label: '¿Visita efectiva?' },
    ],
    grupos: [
      {
        titulo: 'Datos de la visita',
        campos: [
          { id: 'motivo_no_efectiva',       label: 'Motivo no efectiva',       requeridoPorDefecto: false },
          { id: 'motivo_no_efectiva_otro',  label: 'Motivo otro (detalle)',    requeridoPorDefecto: false },
        ],
      },
    ],
  },
  {
    numero: 2,
    id: 'encuestado',
    label: 'Datos del Encuestado',
    descripcion: 'Información de la persona encuestada durante la visita.',
    obligatoria: false,
    tabla: 'visitas',
    colorClasses: {
      border: 'border-purple-200',
      header: 'bg-purple-50',
      badge: 'bg-purple-100 text-purple-700',
      numero: 'bg-purple-600 text-white',
      icon: 'text-purple-500',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    grupos: [
      {
        titulo: 'Persona encuestada',
        campos: [
          { id: 'nombre_encuestado',            label: 'Nombre del encuestado',     requeridoPorDefecto: false },
          { id: 'numero_documento_encuestado',   label: 'Número de documento',       requeridoPorDefecto: false },
          { id: 'telefono_contacto',             label: 'Teléfono de contacto',      requeridoPorDefecto: false },
        ],
      },
    ],
  },
  {
    numero: 3,
    id: 'datos_hogar',
    label: 'Datos del Hogar',
    descripcion: 'Información socioeconómica y condiciones del hogar recopiladas en la visita.',
    obligatoria: true,
    tabla: 'datos_hogar_etapa2',
    colorClasses: {
      border: 'border-teal-200',
      header: 'bg-teal-50',
      badge: 'bg-teal-100 text-teal-700',
      numero: 'bg-teal-600 text-white',
      icon: 'text-teal-500',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    grupos: [
      {
        titulo: 'Tenencia',
        campos: [
          { id: 'calidad_tenencia',              label: 'Calidad de tenencia',              requeridoPorDefecto: true },
          { id: 'tiene_escrituras',               label: 'Tiene escrituras',                 requeridoPorDefecto: false },
          { id: 'tiene_certificado_libertad',     label: 'Tiene certificado de libertad',    requeridoPorDefecto: false },
          { id: 'tiene_contrato_arrendamiento',   label: 'Tiene contrato de arrendamiento', requeridoPorDefecto: false },
        ],
      },
      {
        titulo: 'Uso e ingresos',
        campos: [
          { id: 'uso_inmueble',          label: 'Uso del inmueble',       requeridoPorDefecto: true },
          { id: 'rango_ingresos_hogar',  label: 'Rango de ingresos',     requeridoPorDefecto: true },
        ],
      },
      {
        titulo: 'Vulnerabilidad',
        campos: [
          { id: 'hay_adultos_mayores',        label: 'Adultos mayores',              requeridoPorDefecto: false },
          { id: 'hay_personas_discapacidad',  label: 'Personas con discapacidad',    requeridoPorDefecto: false },
          { id: 'hay_madre_cabeza_hogar',     label: 'Madre cabeza de hogar',        requeridoPorDefecto: false },
          { id: 'hay_victimas_conflicto',     label: 'Víctimas del conflicto',       requeridoPorDefecto: false },
        ],
      },
      {
        titulo: 'Condiciones físicas de la vivienda',
        campos: [
          { id: 'material_pisos',         label: 'Material de pisos',       requeridoPorDefecto: true },
          { id: 'material_paredes',       label: 'Material de paredes',     requeridoPorDefecto: true },
          { id: 'numero_habitaciones',    label: 'Número de habitaciones',  requeridoPorDefecto: true },
        ],
      },
      {
        titulo: 'Servicios públicos',
        campos: [
          { id: 'tiene_agua',           label: 'Tiene agua',           requeridoPorDefecto: true },
          { id: 'tiene_energia',        label: 'Tiene energía',        requeridoPorDefecto: true },
          { id: 'tiene_gas',            label: 'Tiene gas',            requeridoPorDefecto: false },
          { id: 'tiene_alcantarillado', label: 'Tiene alcantarillado', requeridoPorDefecto: false },
        ],
      },
      {
        titulo: 'Entorno y riesgos',
        campos: [
          { id: 'percepcion_seguridad',   label: 'Percepción de seguridad',  requeridoPorDefecto: false },
          { id: 'riesgo_inundacion',       label: 'Riesgo de inundación',    requeridoPorDefecto: false },
          { id: 'riesgo_deslizamiento',    label: 'Riesgo de deslizamiento', requeridoPorDefecto: false },
          { id: 'riesgo_estructural',      label: 'Riesgo estructural',      requeridoPorDefecto: false },
        ],
      },
    ],
  },
  {
    numero: 4,
    id: 'acta_obs',
    label: 'Acta y Observaciones',
    descripcion: 'Registro documental y notas de la visita.',
    obligatoria: false,
    tabla: 'visitas',
    colorClasses: {
      border: 'border-amber-200',
      header: 'bg-amber-50',
      badge: 'bg-amber-100 text-amber-700',
      numero: 'bg-amber-600 text-white',
      icon: 'text-amber-500',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    grupos: [
      {
        titulo: 'Documentos y notas',
        campos: [
          { id: 'acta_firmada',             label: 'Acta firmada (archivo)',    requeridoPorDefecto: false },
          { id: 'observaciones_generales',  label: 'Observaciones generales',  requeridoPorDefecto: false },
          { id: 'foto_predio_url',          label: 'Foto del predio',          requeridoPorDefecto: false },
        ],
      },
    ],
  },
];

// ── Config por defecto ─────────────────────────────────────────────────────── //

export function buildDefaultConfigVisita(): Record<string, { requerido: boolean; habilitado: boolean }> {
  const config: Record<string, { requerido: boolean; habilitado: boolean }> = {};
  for (const seccion of SECCIONES_VISITA) {
    for (const grupo of seccion.grupos) {
      for (const campo of grupo.campos) {
        config[campo.id] = { requerido: campo.requeridoPorDefecto, habilitado: true };
      }
    }
  }
  return config;
}
