/**
 * Modal - Diálogo modal compartido basado en Radix UI Dialog.
 * Accesible: portal, foco atrapado, cierre con Escape.
 */

import React, { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  actions?: ModalAction[];
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

const actionVariantClasses: Record<NonNullable<ModalAction['variant']>, string> = {
  primary: 'bg-blue-700 hover:bg-blue-800 text-white',
  secondary: 'bg-gray-400 hover:bg-gray-500 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  actions,
}) => (
  <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
    <Dialog.Portal>
      {/* Overlay */}
      <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

      {/* Content */}
      <Dialog.Content
        className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] ${sizeClasses[size]} max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <Dialog.Title className="text-xl font-bold text-gray-900">{title}</Dialog.Title>
          <Dialog.Close
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            aria-label="Cerrar"
          >
            ×
          </Dialog.Close>
        </div>

        {/* Body */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer - Acciones */}
        {actions && actions.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            {actions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={action.onClick}
                disabled={action.isLoading}
                className={`px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${actionVariantClasses[action.variant ?? 'primary']}`}
              >
                {action.isLoading ? 'Cargando...' : action.label}
              </button>
            ))}
          </div>
        )}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
