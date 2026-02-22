/**
 * Esquemas de validación para Usuarios
 * Usando Zod para validación de tipos
 */
import { z } from "zod";

export const usuarioSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres"),
  apellidos: z
    .string()
    .min(2, "Los apellidos deben tener al menos 2 caracteres")
    .max(255, "Los apellidos no pueden exceder 255 caracteres"),
  numero_documento: z
    .string()
    .min(5, "El número de documento debe tener al menos 5 caracteres")
    .max(20, "El número de documento no puede exceder 20 caracteres"),
  correo: z
    .string()
    .email("El correo debe ser válido"),
  rol: z
    .enum(["ADMINISTRADOR", "FUNCIONARIO", "TECNICO"], {
      errorMap: () => ({ message: "Rol inválido" })
    }),
  estado: z
    .enum(["ACTIVO", "INACTIVO"], {
      errorMap: () => ({ message: "Estado inválido" })
    })
    .default("ACTIVO"),
});

export type UsuarioFormData = z.infer<typeof usuarioSchema>;

// Esquema para actualizar usuario (todos los campos opcionales excepto id implícito)
export const usuarioUpdateSchema = usuarioSchema.partial();
export type UsuarioUpdateFormData = z.infer<typeof usuarioUpdateSchema>;
