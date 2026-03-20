/**
 * EditarProgramaModal - Modal para editar un programa existente
 * Usa Radix Dialog, React Hook Form y Zod para validación
 */

import React, { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editarProgramaSchema, type EditarProgramaFormData } from '../../application/schemas';
import type { ProgramaCardItem } from './ProgramaCard';

export type { EditarProgramaFormData };

interface EditarProgramaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditarProgramaFormData) => Promise<void>;
  programa: ProgramaCardItem | null;
  isLoading?: boolean;
}

export const EditarProgramaModal: React.FC<EditarProgramaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  programa,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditarProgramaFormData>({
    resolver: zodResolver(editarProgramaSchema),
  });

  useEffect(() => {
    if (programa) {
      reset({
        id: programa.id,
        nombre: programa.nombre,
        descripcion: programa.descripcion,
        entidadResponsable: programa.entidadResponsable,
      });
    }
  }, [programa, reset]);

  const onFormSubmit = async (data: EditarProgramaFormData) => {
    try {
      await onSubmit(data);
    } catch {
      // Error manejado por el caller
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
      hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
    }`;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-50 focus:outline-none">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <Dialog.Title className="text-xl font-bold text-gray-900">
              Editar Programa
            </Dialog.Title>
            <Dialog.Close className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
              ×
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="px-6 py-4 space-y-4">
            <input type="hidden" {...register('id')} />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                {...register('nombre')}
                className={inputClass(!!errors.nombre)}
              />
              {errors.nombre && (
                <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                {...register('descripcion')}
                rows={4}
                className={inputClass(!!errors.descripcion)}
              />
              {errors.descripcion && (
                <p className="text-red-500 text-xs mt-1">{errors.descripcion.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Entidad Responsable *
              </label>
              <input
                {...register('entidadResponsable')}
                className={inputClass(!!errors.entidadResponsable)}
              />
              {errors.entidadResponsable && (
                <p className="text-red-500 text-xs mt-1">{errors.entidadResponsable.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
