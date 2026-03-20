/**
 * HeaderPanel - Panel superior común para módulos
 * Contiene título y botón de acción principal
 */

import React from 'react';

interface HeaderPanelProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const HeaderPanel: React.FC<HeaderPanelProps> = ({
  title,
  subtitle,
  actionLabel = 'Crear',
  onAction,
}) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-600 text-sm">{subtitle}</p>
        )}
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="
            bg-blue-700 hover:bg-blue-800
            text-white font-semibold px-6 py-3 rounded-lg
            transition-colors duration-200
            flex items-center gap-2
            shadow-sm hover:shadow-md
            whitespace-nowrap ml-8
          "
        >
          <span className="text-lg">+</span>
          {actionLabel}
        </button>
      )}
    </div>
  );
};
