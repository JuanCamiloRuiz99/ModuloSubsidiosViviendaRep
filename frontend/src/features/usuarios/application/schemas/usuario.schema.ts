/**
 * Zod Schemas para validación de formularios de Usuarios
 */

import { z } from 'zod/v4';

export const crearUsuarioSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  numeroDocumento: z
    .string()
    .min(5, 'El documento debe tener al menos 5 caracteres')
    .max(20, 'Máximo 20 caracteres'),
  idRol: z.string().min(1, 'Debe seleccionar un rol'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type CrearUsuarioFormData = z.infer<typeof crearUsuarioSchema>;

export const editarUsuarioSchema = z.object({
  id: z.string().min(1),
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  numeroDocumento: z
    .string()
    .min(5, 'El documento debe tener al menos 5 caracteres')
    .max(20, 'Máximo 20 caracteres'),
  idRol: z.string().min(1, 'Debe seleccionar un rol'),
});

export type EditarUsuarioFormData = z.infer<typeof editarUsuarioSchema>;
