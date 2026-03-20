import { z } from 'zod/v4';

export const crearProgramaSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede superar 200 caracteres'),
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede superar 2000 caracteres'),
  entidadResponsable: z
    .string()
    .min(3, 'La entidad responsable debe tener al menos 3 caracteres')
    .max(200, 'La entidad responsable no puede superar 200 caracteres'),
});

export type CrearProgramaFormData = z.infer<typeof crearProgramaSchema>;

export const editarProgramaSchema = crearProgramaSchema.extend({
  id: z.string().min(1, 'ID requerido'),
});

export type EditarProgramaFormData = z.infer<typeof editarProgramaSchema>;
