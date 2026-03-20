/**
 * StatCard - Tarjeta de estadística
 * Componente compartido para mostrar métricas en dashboard
 */

import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  description?: string;
  onClick?: () => void;
}

const colorClasses = {
  blue: {
    border: 'border-l-4 border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
  },
  green: {
    border: 'border-l-4 border-green-500',
    bg: 'bg-green-50',
    text: 'text-green-600',
    badge: 'bg-green-100 text-green-700',
  },
  purple: {
    border: 'border-l-4 border-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700',
  },
  orange: {
    border: 'border-l-4 border-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-700',
  },
  red: {
    border: 'border-l-4 border-red-500',
    bg: 'bg-red-50',
    text: 'text-red-600',
    badge: 'bg-red-100 text-red-700',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  color,
  description,
  onClick,
}) => {
  const colors = colorClasses[color];

  return (
    <div
      onClick={onClick}
      className={`
        ${colors.border} ${colors.bg}
        rounded-lg shadow-sm p-6 cursor-pointer
        transition-all duration-300 hover:shadow-md
        border border-gray-200
      `}
    >
      <div>
        <p className="text-sm text-gray-600 mb-3 font-medium">{title}</p>
        <p className={`text-4xl font-bold ${colors.text}`}>{value}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-2">{description}</p>
        )}
      </div>
    </div>
  );
};
