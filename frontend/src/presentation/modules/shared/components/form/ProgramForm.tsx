/**
 * Componente base para formularios de Programa
 * Reutilizable tanto para crear como para editar
 */
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { programSchema, type ProgramFormData } from "../../../admin/schemas/programSchema";
import { RESPONSABLE_ENTITIES } from "../../../admin/constants/programConstants";
import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import SelectFieldSimple from "./SelectFieldSimple";
import ReadonlyField from "./ReadonlyField";

interface ProgramFormProps {
  /**
   * Modo del formulario: 'create' o 'edit'
   */
  mode: "create" | "edit";
  
  /**
   * Datos iniciales (para edición)
   */
  initialData?: {
    nombre: string;
    descripcion: string;
    entidadResponsable: string;
    codigoPrograma?: string;
    estado?: string;
  };
  
  /**
   * Función de envío del formulario
   */
  onSubmit: SubmitHandler<ProgramFormData>;
  
  /**
   * Indicador de carga
   */
  isLoading?: boolean;
  
  /**
   * Texto del botón submit
   */
  submitButtonText?: string;
  
  /**
   * Nota adicional en el formulario
   */
  note?: string;
  
  /**
   * Muestra advertencia (para edición)
   */
  showWarning?: boolean;
}

function ProgramForm({
  mode,
  initialData,
  onSubmit,
  isLoading = false,
  submitButtonText,
  note,
  showWarning = false,
}: ProgramFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: initialData
      ? {
          nombre: initialData.nombre,
          descripcion: initialData.descripcion,
          entidadResponsable: initialData.entidadResponsable,
        }
      : undefined,
  });

  const borderStyle = mode === "edit" ? "border-yellow-300" : "border-gray-300";
  const defaultSubmitText =
    mode === "create" ? "Crear Programa" : "Guardar Cambios";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`bg-white p-8 rounded-lg border-2 ${borderStyle} max-w-2xl`}
    >
      {/* Advertencia para edición */}
      {showWarning && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
          <p className="text-yellow-800 font-semibold">⚠️ Advertencia</p>
          <p className="text-yellow-700 text-sm mt-2">
            Los cambios realizados aquí afectarán directamente a los datos del
            programa. Asegúrate de que la información sea correcta antes de
            guardar.
          </p>
        </div>
      )}

      {/* Título */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {mode === "create"
          ? "Nuevo Programa de Subsidio"
          : `Editar Programa: ${initialData?.nombre}`}
      </h2>

      {/* Campos editables */}
      <TextField
        label="Nombre del Programa"
        placeholder="Ej: Vivienda Digna"
        required
        register={register}
        name="nombre"
        error={errors.nombre}
        helperText={
          mode === "create"
            ? "* Nombre con el que se identificará públicamente el programa"
            : undefined
        }
      />

      <TextAreaField
        label="Descripción"
        placeholder="Descripción breve del programa"
        required
        register={register}
        name="descripcion"
        error={errors.descripcion}
        helperText={
          mode === "create"
            ? "* Este texto será visible para los ciudadanos"
            : undefined
        }
      />

      <SelectFieldSimple
        label="Entidad responsable"
        required
        name="entidadResponsable"
        control={control}
        options={RESPONSABLE_ENTITIES}
        error={errors.entidadResponsable}
      />

      {/* Campos de solo lectura (para edición) */}
      {mode === "edit" && initialData?.codigoPrograma && (
        <div className="grid grid-cols-2 gap-6 mb-6">
          <ReadonlyField
            label="Código del programa"
            value={initialData.codigoPrograma}
            helperText="No editable"
          />
          <ReadonlyField
            label="Estado actual"
            value={initialData.estado || ""}
            helperText="No editable"
          />
        </div>
      )}

      {/* Campos no editables (para creación) */}
      {mode === "create" && (
        <div className="mb-6">
          <ReadonlyField
            label="Código del programa"
            value="Se genera automáticamente"
            helperText="* El código del programa se crea automáticamente, es un campo no editable"
          />
        </div>
      )}

      {/* Nota */}
      {note && (
        <p className="text-gray-600 text-sm mb-6 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
          {note}
        </p>
      )}

      {/* Botón Submit */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? mode === "create"
              ? "Creando Programa..."
              : "Guardando..."
            : submitButtonText || defaultSubmitText}
        </button>
      </div>
    </form>
  );
}

export default ProgramForm;
