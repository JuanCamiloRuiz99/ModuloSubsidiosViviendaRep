/**
 * Componente UserForm
 * Formulario para crear/editar usuarios
 * Reutiliza componentes genéricos TextField, SelectField, etc.
 */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usuarioSchema, type UsuarioFormData } from "../schemas/usuarioSchema";
import {
  ROLES_ARRAY,
  ESTADOS_ARRAY,
} from "../constants/usuarioConstants";
import { TextField, SelectFieldSimple } from "../../shared/components/form";

interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  nombre_completo: string;
  numero_documento: string;
  correo: string;
  rol: "ADMINISTRADOR" | "FUNCIONARIO" | "TECNICO";
  estado: "ACTIVO" | "INACTIVO";
  fecha_creacion: string;
  fecha_actualizacion: string;
}

interface UserFormProps {
  mode: "create" | "edit";
  initialData?: Usuario;
  onSubmit: (data: UsuarioFormData) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function UserForm({
  mode,
  initialData,
  onSubmit,
  isLoading = false,
  onCancel,
}: UserFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    mode: "onBlur",
    defaultValues: {
      nombre: initialData?.nombre || "",
      apellidos: initialData?.apellidos || "",
      numero_documento: initialData?.numero_documento || "",
      correo: initialData?.correo || "",
      rol: initialData?.rol || "FUNCIONARIO",
      estado: initialData?.estado || "ACTIVO",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        nombre: initialData.nombre,
        apellidos: initialData.apellidos,
        numero_documento: initialData.numero_documento,
        correo: initialData.correo,
        rol: initialData.rol || "FUNCIONARIO",
        estado: initialData.estado || "ACTIVO",
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: UsuarioFormData) => {
    console.log("[UserForm] handleFormSubmit called with data:", data);
    console.log("[UserForm] Is valid:", isValid);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("[UserForm] Submit error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Información de Advertencia */}
      {mode === "edit" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-xl">ℹ️</span>
          <p className="text-sm text-blue-800">
            Los datos del usuario serán actualizados inmediatamente. Asegúrate de verificar toda la información antes de guardar.
          </p>
        </div>
      )}

      {/* Nombre */}
      <TextField
        label="Nombre"
        placeholder="Juan"
        required
        register={register}
        name="nombre"
        error={errors.nombre}
      />

      {/* Apellidos */}
      <TextField
        label="Apellidos"
        placeholder="Pérez García"
        required
        register={register}
        name="apellidos"
        error={errors.apellidos}
      />

      {/* Número de Documento */}
      <TextField
        label="Número de Documento"
        placeholder="1234567890"
        required
        register={register}
        name="numero_documento"
        error={errors.numero_documento}
      />

      {/* Correo */}
      <TextField
        label="Correo Electrónico"
        placeholder="usuario@popayan.gov.co"
        required
        register={register}
        name="correo"
        type="email"
        error={errors.correo}
      />

      {/* Rol */}
      <SelectFieldSimple
        label="Rol"
        required
        name="rol"
        control={control}
        options={ROLES_ARRAY}
        error={errors.rol}
      />

      {/* Estado */}
      <SelectFieldSimple
        label="Estado"
        required
        name="estado"
        control={control}
        options={ESTADOS_ARRAY}
        error={errors.estado}
      />

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          disabled={isLoading}
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="inline-block animate-spin">⏳</span>
              Guardando...
            </>
          ) : mode === "create" ? (
            <>➕ Crear Usuario</>
          ) : (
            <>✅ Guardar Cambios</>
          )}
        </button>
      </div>

      {/* Nota */}
      {mode === "create" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> La contraseña inicial será generada automáticamente y enviada al correo del empleado.
          </p>
        </div>
      )}
    </form>
  );
}
