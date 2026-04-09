/**
 * secciones-data-gestion.tsx
 *
 * Definición de las secciones del formulario de Gestión Documental Interna (Etapa 3).
 * Cada campo corresponde a un tipo de documento del proceso interno (ENUM en backend).
 */
import React from 'react';
import type {
  SeccionConfig,
} from '../../registro-hogar/config/secciones-data';

// ── Datos ─────────────────────────────────────────────────────────────────── //

export const SECCIONES_GESTION: SeccionConfig[] = [
  {
    numero: 1,
    id: 'visita_formularios',
    label: 'Visita y Formularios',
    descripcion: 'Acta de visita técnica y formulario único nacional.',
    obligatoria: true,
    tabla: 'gestion_documental',
    colorClasses: {
      border: 'border-purple-200',
      header: 'bg-purple-50',
      badge: 'bg-purple-100 text-purple-700',
      numero: 'bg-purple-600 text-white',
      icon: 'text-purple-500',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    grupos: [
      {
        titulo: 'Documentos de visita',
        campos: [
          { id: 'ACTA_VISITA_TECNICA',         label: 'Acta de visita técnica',                requeridoPorDefecto: true },
          { id: 'FORMULARIO_UNICO_NACIONAL',   label: 'Formulario único nacional',             requeridoPorDefecto: true },
        ],
      },
    ],
  },
  {
    numero: 2,
    id: 'tramite_curaduria',
    label: 'Trámite de Curaduría',
    descripcion: 'Radicados, expensas y poder autenticado para trámite de licencia.',
    obligatoria: true,
    tabla: 'gestion_documental',
    colorClasses: {
      border: 'border-blue-200',
      header: 'bg-blue-50',
      badge: 'bg-blue-100 text-blue-700',
      numero: 'bg-blue-600 text-white',
      icon: 'text-blue-500',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    grupos: [
      {
        titulo: 'Documentos de curaduría',
        campos: [
          { id: 'RADICADO_CURADURIA',           label: 'Radicado de curaduría',                requeridoPorDefecto: true },
          { id: 'EXPENSA_RADICACION_INICIAL',    label: 'Expensa de radicación inicial',        requeridoPorDefecto: true },
          { id: 'EXPENSA_LICENCIA_FINAL',        label: 'Expensa de licencia final',            requeridoPorDefecto: true },
          { id: 'PODER_AUTENTICADO',             label: 'Poder autenticado',                    requeridoPorDefecto: true },
        ],
      },
    ],
  },
  {
    numero: 3,
    id: 'informes_aprobaciones',
    label: 'Informes y Aprobaciones',
    descripcion: 'Informes técnicos de validación y aprobación de MinVivienda.',
    obligatoria: true,
    tabla: 'gestion_documental',
    colorClasses: {
      border: 'border-teal-200',
      header: 'bg-teal-50',
      badge: 'bg-teal-100 text-teal-700',
      numero: 'bg-teal-600 text-white',
      icon: 'text-teal-500',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    grupos: [
      {
        titulo: 'Informes y aprobaciones',
        campos: [
          { id: 'INFORME_TECNICO_VALIDACION',   label: 'Informe técnico de validación',        requeridoPorDefecto: true },
          { id: 'APROBACION_MINVIVIENDA',        label: 'Aprobación MinVivienda',               requeridoPorDefecto: true },
        ],
      },
    ],
  },
  {
    numero: 4,
    id: 'constructor',
    label: 'Constructor',
    descripcion: 'Oficio, tarjeta profesional y certificación de experiencia del constructor.',
    obligatoria: true,
    tabla: 'gestion_documental',
    colorClasses: {
      border: 'border-amber-200',
      header: 'bg-amber-50',
      badge: 'bg-amber-100 text-amber-700',
      numero: 'bg-amber-600 text-white',
      icon: 'text-amber-500',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    grupos: [
      {
        titulo: 'Documentos del constructor',
        campos: [
          { id: 'OFICIO_CONSTRUCTOR',              label: 'Oficio del constructor',               requeridoPorDefecto: true },
          { id: 'TARJETA_PROFESIONAL_CONSTRUCTOR', label: 'Tarjeta profesional del constructor',  requeridoPorDefecto: true },
          { id: 'CERTIFICACION_EXPERIENCIA',       label: 'Certificación de experiencia',         requeridoPorDefecto: true },
        ],
      },
    ],
  },
  {
    numero: 5,
    id: 'planos',
    label: 'Planos y Diseño',
    descripcion: 'Planos de levantamiento, arquitectónicos y estructurales en PDF y DWG.',
    obligatoria: true,
    tabla: 'gestion_documental',
    colorClasses: {
      border: 'border-indigo-200',
      header: 'bg-indigo-50',
      badge: 'bg-indigo-100 text-indigo-700',
      numero: 'bg-indigo-600 text-white',
      icon: 'text-indigo-500',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    grupos: [
      {
        titulo: 'Planos de levantamiento',
        campos: [
          { id: 'PLANOS_LEVANTAMIENTO_PDF',     label: 'Planos de levantamiento (PDF)',        requeridoPorDefecto: true },
          { id: 'PLANOS_LEVANTAMIENTO_DWG',     label: 'Planos de levantamiento (DWG)',        requeridoPorDefecto: true },
        ],
      },
      {
        titulo: 'Planos arquitectónicos',
        campos: [
          { id: 'PLANOS_ARQUITECTONICOS_PDF',   label: 'Planos arquitectónicos (PDF)',         requeridoPorDefecto: true },
          { id: 'PLANOS_ARQUITECTONICOS_DWG',   label: 'Planos arquitectónicos (DWG)',         requeridoPorDefecto: true },
        ],
      },
      {
        titulo: 'Planos estructurales',
        campos: [
          { id: 'PLANOS_ESTRUCTURALES_PDF',     label: 'Planos estructurales (PDF)',           requeridoPorDefecto: true },
          { id: 'PLANOS_ESTRUCTURALES_DWG',     label: 'Planos estructurales (DWG)',           requeridoPorDefecto: true },
        ],
      },
    ],
  },
  {
    numero: 6,
    id: 'presupuesto_valla',
    label: 'Presupuesto y Valla',
    descripcion: 'Presupuesto de obra (PDF y Excel) y foto de valla de curaduría.',
    obligatoria: true,
    tabla: 'gestion_documental',
    colorClasses: {
      border: 'border-orange-200',
      header: 'bg-orange-50',
      badge: 'bg-orange-100 text-orange-700',
      numero: 'bg-orange-600 text-white',
      icon: 'text-orange-500',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    grupos: [
      {
        titulo: 'Presupuesto y valla',
        campos: [
          { id: 'FOTO_VALLA_CURADURIA',        label: 'Foto de valla de curaduría',           requeridoPorDefecto: true },
          { id: 'PRESUPUESTO_PDF',              label: 'Presupuesto de obra (PDF)',            requeridoPorDefecto: true },
          { id: 'PRESUPUESTO_XLSX',             label: 'Presupuesto de obra (Excel)',          requeridoPorDefecto: true },
        ],
      },
    ],
  },
  {
    numero: 7,
    id: 'oficios_certificaciones',
    label: 'Oficios y Certificaciones',
    descripcion: 'Uso de suelos, gestión de riesgo, certificaciones de servicios públicos.',
    obligatoria: true,
    tabla: 'gestion_documental',
    colorClasses: {
      border: 'border-emerald-200',
      header: 'bg-emerald-50',
      badge: 'bg-emerald-100 text-emerald-700',
      numero: 'bg-emerald-600 text-white',
      icon: 'text-emerald-500',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    grupos: [
      {
        titulo: 'Oficios y certificaciones',
        campos: [
          { id: 'OFICIO_USO_SUELOS',             label: 'Oficio de uso de suelos',              requeridoPorDefecto: true },
          { id: 'CONCEPTO_GESTION_RIESGO',        label: 'Concepto de gestión de riesgo',        requeridoPorDefecto: true },
          { id: 'RIESGO_INUNDACION_REMOCION',     label: 'Riesgo de inundación / remoción masa', requeridoPorDefecto: true },
          { id: 'CERTIFICACION_AGUA',              label: 'Certificación de agua',                requeridoPorDefecto: true },
          { id: 'CERTIFICACION_ENERGIA',           label: 'Certificación de energía',             requeridoPorDefecto: true },
        ],
      },
    ],
  },
];

// ── Config por defecto ─────────────────────────────────────────────────────── //

export function buildDefaultConfigGestion(): Record<string, { requerido: boolean; habilitado: boolean }> {
  const config: Record<string, { requerido: boolean; habilitado: boolean }> = {};
  for (const seccion of SECCIONES_GESTION) {
    for (const grupo of seccion.grupos) {
      for (const campo of grupo.campos) {
        config[campo.id] = { requerido: campo.requeridoPorDefecto, habilitado: true };
      }
    }
  }
  return config;
}
