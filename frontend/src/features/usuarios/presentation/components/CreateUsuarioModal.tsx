/**
 * CreateUsuarioModal - Modal para crear un nuevo usuario
 * Usa Radix Dialog, React Hook Form y Zod para validación
 */

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { crearUsuarioSchema, type CrearUsuarioFormData } from '../../application/schemas';

export type { CrearUsuarioFormData };

interface CreateUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearUsuarioFormData) => Promise<void>;
  isLoading?: boolean;
}

const roleOptions = [
  { value: '1', label: 'Administrador' },
  { value: '2', label: 'Funcionario' },
  { value: '3', label: 'Técnico' },
];

export const CreateUsuarioModal: React.FC<CreateUsuarioModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CrearUsuarioFormData>({
    resolver: zodResolver(crearUsuarioSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      numeroDocumento: '',
      idRol: '2',
      password: '',
      confirmPassword: '',
    },
  });

  const onFormSubmit = async (data: CrearUsuarioFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch {
      // Error manejado por el caller; no resetear para conservar datos
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
      hasError
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:ring-blue-500'
    }`;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-50 focus:outline-none">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <Dialog.Title className="text-xl font-bold text-gray-900">
              Crear Nuevo Usuario
            </Dialog.Title>
            <Dialog.Close className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
              ×
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="px-6 py-4 space-y-4">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                <input
                  {...register('nombre')}
                  placeholder="Ej: Juan"
                  className={inputClass(!!errors.nombre)}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido *</label>
                <input
                  {...register('apellido')}
                  placeholder="Ej: García"
                  className={inputClass(!!errors.apellido)}
                />
                {errors.apellido && (
                  <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>
                )}
              </div>
            </div>

            {/* Email y Documento */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="ejemplo@alcaldia.gov.co"
                  className={inputClass(!!errors.email)}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nro. Documento *
                </label>
                <input
                  {...register('numeroDocumento')}
                  placeholder="Ej: 1234567890"
                  className={inputClass(!!errors.numeroDocumento)}
                />
                {errors.numeroDocumento && (
                  <p className="text-red-500 text-xs mt-1">{errors.numeroDocumento.message}</p>
                )}
              </div>
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rol *</label>
              <select
                {...register('idRol')}
                className={inputClass(!!errors.idRol)}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.idRol && (
                <p className="text-red-500 text-xs mt-1">{errors.idRol.message}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña *
                </label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className={inputClass(!!errors.password)}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar *
                </label>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  className={inputClass(!!errors.confirmPassword)}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={isLoading}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creando...
                  </>
                ) : (
                  '+ Crear Usuario'
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

