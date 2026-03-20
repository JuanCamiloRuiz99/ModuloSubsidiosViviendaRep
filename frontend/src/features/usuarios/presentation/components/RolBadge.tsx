/**
 * RolBadge Component - Badge para mostrar rol de usuario
 */

import React from 'react';

interface RolBadgeProps {
  idRol: number;
  nombre?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ROL_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: 'bg-red-100', text: 'text-red-800' },
  2: { bg: 'bg-blue-100', text: 'text-blue-800' },
  3: { bg: 'bg-green-100', text: 'text-green-800' },
};

const ROL_NAMES: Record<number, string> = {
  1: 'Admin',
  2: 'Funcionario',
  3: 'Técnico Visitante',
};

const SIZE_CLASSES: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const RolBadge: React.FC<RolBadgeProps> = ({ idRol, nombre, size = 'md' }) => {
  const colors = ROL_COLORS[idRol] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  const displayName = nombre || ROL_NAMES[idRol] || 'Desconocido';

  return (
    <span className={`${colors.bg} ${colors.text} rounded-full font-medium ${SIZE_CLASSES[size]}`}>
      {displayName}
    </span>
  );
};
