/**
 * Loading - Componente de carga
 */

import React from 'react';

interface LoadingProps {
  isLoading: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8 border-2',
  md: 'w-12 h-12 border-4',
  lg: 'w-16 h-16 border-4',
};

export const Loading: React.FC<LoadingProps> = ({
  isLoading,
  message = 'Cargando...',
  size = 'md',
}) => {
  if (!isLoading) return null;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`
          ${sizeClasses[size]}
          border-blue-600 border-t-transparent rounded-full animate-spin
        `}
      ></div>
      {message && (
        <p className="text-gray-600 text-sm mt-4">{message}</p>
      )}
    </div>
  );
};
