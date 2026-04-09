/**
 * ProgramaCard - Tarjeta única para el módulo Programas
 * Muestra información del programa con borde de color según estado
 * y botones de acción contextuales
 */

import React from 'react';
import { EstadoPrograma } from '../../domain/programa';

export interface ProgramaCardItem {
  id: string;
  nombre: string;
  descripcion: string;
  entidadResponsable: string;
  codigoPrograma: string;
  estado: string;
  fechaCreacion?: Date | string;
}

interface ProgramaCardProps {
  programa: ProgramaCardItem;
  onEdit?: (programa: ProgramaCardItem) => void;
  onDelete?: (id: string) => void;
  onCambiarEstado?: (id: string, nuevoEstado: string) => void;
  onGestionarEtapas?: (programa: ProgramaCardItem) => void;
  isEstadoPending?: boolean;
}

const estadoConfig: Record<string, {
  border: string;
  badge: string;
  label: string;
  accionLabel: string;
  accionEstado: string;
  accionClass: string;
}> = {
  [EstadoPrograma.ACTIVO]: {
    border: 'border-l-4 border-green-500',
    badge: 'bg-green-100 text-green-700',
    label: 'Activo',
    accionLabel: 'Inhabilitar',
    accionEstado: EstadoPrograma.INHABILITADO,
    accionClass: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
  },
  [EstadoPrograma.BORRADOR]: {
    border: 'border-l-4 border-yellow-400',
    badge: 'bg-yellow-100 text-yellow-700',
    label: 'Borrador',
    accionLabel: 'Publicar',
    accionEstado: EstadoPrograma.ACTIVO,
    accionClass: 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200',
  },
  [EstadoPrograma.INHABILITADO]: {
    border: 'border-l-4 border-red-400',
    badge: 'bg-red-100 text-red-700',
    label: 'Inhabilitado',
    accionLabel: 'Activar',
    accionEstado: EstadoPrograma.ACTIVO,
    accionClass: 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200',
  },
  [EstadoPrograma.CULMINADO]: {
    border: 'border-l-4 border-indigo-500',
    badge: 'bg-indigo-100 text-indigo-700',
    label: 'Culminado',
    accionLabel: '',
    accionEstado: '',
    accionClass: 'hidden',
  },
};

const formatDate = (date?: Date | string): string => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Bogota',
  });
};

export const ProgramaCard: React.FC<ProgramaCardProps> = ({
  programa,
  onEdit,
  onDelete,
  onCambiarEstado,
  onGestionarEtapas,
  isEstadoPending = false,
}) => {
  const config = estadoConfig[programa.estado] ?? estadoConfig[EstadoPrograma.BORRADOR];

  const accionTitle: Record<string, string> = {
    [EstadoPrograma.ACTIVO]: 'Publica el programa para operación normal. Asegúrate de tener módulos configurados.',
    [EstadoPrograma.INHABILITADO]: 'Inhabilita el programa. No recibirá nuevas postulaciones.',
    [EstadoPrograma.BORRADOR]: 'Vuelve el programa a estado de edición.',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm ${config.border} hover:shadow-md transition-shadow duration-200 flex flex-col`}
    >
      <div className="p-5 flex-1">
        {/* Header: badge de estado + código */}
        <div className="flex items-start justify-between mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badge}`}
          >
            {config.label}
          </span>
          {programa.codigoPrograma && (
            <span className="text-xs text-gray-400 font-mono">{programa.codigoPrograma}</span>
          )}
        </div>

        {/* Nombre */}
        <h3 className="text-base font-semibold text-gray-900 mb-2 leading-tight">
          {programa.nombre}
        </h3>

        {/* Descripción truncada */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{programa.descripcion}</p>

        {/* Info rows */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-gray-400">🏛</span>
            <span className="truncate">{programa.entidadResponsable}</span>
          </div>
          {programa.fechaCreacion && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>📅</span>
              <span>Creado: {formatDate(programa.fechaCreacion)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2">
        <button
          onClick={() => onEdit?.(programa)}
          className="flex-1 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200 transition-colors"
        >
          Editar
        </button>
        {programa.estado !== EstadoPrograma.CULMINADO && (
        <button
          onClick={() => onCambiarEstado?.(programa.id, config.accionEstado)}
          disabled={isEstadoPending}
          title={accionTitle[config.accionEstado] ?? ''}
          className={`flex-1 text-sm font-medium px-3 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
            isEstadoPending ? 'opacity-60 cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200' : config.accionClass
          }`}
        >
          {isEstadoPending ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Procesando...
            </>
          ) : config.accionLabel}
        </button>
        )}
        {programa.estado !== EstadoPrograma.CULMINADO && (
        <button
          onClick={() => onDelete?.(programa.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          aria-label="Eliminar programa"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        )}
      </div>

      {/* Gestionar Etapas */}
      <div className="px-5 pb-4">
        <button
          onClick={() => onGestionarEtapas?.(programa)}
          className="w-full text-sm font-medium text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-md border border-blue-200 transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Gestionar Etapas
        </button>
      </div>
    </div>
  );
};
