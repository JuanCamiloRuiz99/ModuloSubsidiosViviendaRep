/**
 * Configuración visual y de datos por módulo principal de etapa.
 * Centraliza labels, colores e iconos para EtapaCard y ModalNuevaEtapa.
 */

import React from 'react';
import type { ModuloPrincipal } from '../infrastructure/persistence/axios-etapa-repository';

export interface ModuloConfigEntry {
  label: string;
  cardBorder: string;
  badge: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

export const MODULO_CONFIG: Record<ModuloPrincipal, ModuloConfigEntry> = {
  REGISTRO_HOGAR: {
    label: 'Registro del Hogar',
    cardBorder: 'border border-blue-300',
    badge: 'bg-blue-100 text-blue-700',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  VISITA_TECNICA: {
    label: 'Visita Técnica',
    cardBorder: 'border border-amber-300',
    badge: 'bg-amber-100 text-amber-700',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  GESTION_DOCUMENTAL_INTERNA: {
    label: 'Gestión Documental Interna',
    cardBorder: 'border border-purple-300',
    badge: 'bg-purple-100 text-purple-700',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
};

/** Mapeo fijo: número de etapa → módulo principal habilitado para esa posición. */
export const ETAPA_MODULO: Record<number, ModuloPrincipal> = {
  1: 'REGISTRO_HOGAR',
  2: 'VISITA_TECNICA',
  3: 'GESTION_DOCUMENTAL_INTERNA',
};

export const ETAPAS_DISPONIBLES = [
  { numero: 1 },
  { numero: 2 },
  { numero: 3 },
] as const;

export const MODULOS_OPCIONES: {
  value: ModuloPrincipal;
  label: string;
  etapa: number;
}[] = [
  { value: 'REGISTRO_HOGAR',             label: 'Registro del Hogar',         etapa: 1 },
  { value: 'VISITA_TECNICA',             label: 'Visita Técnica',              etapa: 2 },
  { value: 'GESTION_DOCUMENTAL_INTERNA', label: 'Gestión Documental Interna',  etapa: 3 },
];
