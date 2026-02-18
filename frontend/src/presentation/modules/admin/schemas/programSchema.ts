import { z } from "zod";

export const programSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción no puede exceder 500 caracteres"),
  entidadResponsable: z
    .string()
    .min(1, "Debe seleccionar una entidad responsable"),
});

export type ProgramFormData = z.infer<typeof programSchema>;
