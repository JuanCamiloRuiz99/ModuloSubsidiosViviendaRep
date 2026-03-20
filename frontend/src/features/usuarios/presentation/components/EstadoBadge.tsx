/**
 * EstadoBadge Component - Badge reutilizable para mostrar estado activo/inactivo
 *
 * Ejemplo de uso:
 *   <EstadoBadge estado="activo" />
 *   <EstadoBadge estado="inactivo" size="lg" />
 */

import React from 'react';

interface EstadoBadgeProps {
  estado: string | boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const EstadoBadge: React.FC<EstadoBadgeProps> = ({
  estado,
  size = 'sm',
}) => {
  const esActivo =
    estado === true ||
    estado === 'activo' ||
    estado === 'ACTIVO' ||
    estado === 'active';

  const colorClass = esActivo
    ? 'bg-green-100 text-green-800 border border-green-200'
    : 'bg-red-100 text-red-800 border border-red-200';

  const label = esActivo ? 'Activo' : 'Inactivo';
  const dot = esActivo ? 'bg-green-500' : 'bg-red-500';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${colorClass} ${SIZE_CLASSES[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};
