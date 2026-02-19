import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { programSchema, type ProgramFormData } from "../schemas/programSchema";
import { useCreatePrograma } from "../../../../infraestructure/hooks";
import { RESPONSABLE_ENTITIES } from "../constants/programConstants";

interface ProgramCreationFormProps {
  onSuccess: (programCode: string) => void;
}

function ProgramCreationForm({ onSuccess }: ProgramCreationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
  });

  const createMutation = useCreatePrograma();

  const onSubmit = async (data: ProgramFormData) => {
    createMutation.mutate(
      {
        nombre: data.nombre,
        descripcion: data.descripcion,
        entidad_responsable: data.entidadResponsable,
      },
      {
        onSuccess: (response) => {
          reset();
          onSuccess(response.codigo_programa);
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-8 rounded-lg border-2 border-gray-300 max-w-2xl"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Nuevo Programa de Subsidio
      </h2>

      {/* Nombre del Programa */}
      <div className="mb-6">
        <label className="block text-gray-800 font-semibold mb-2">
          Nombre del Programa <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Ej: Vivienda Digna"
          {...register("nombre")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.nombre && (
          <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          * Nombre con el que se identificará públicamente el programa
        </p>
      </div>

      {/* Descripción */}
      <div className="mb-6">
        <label className="block text-gray-800 font-semibold mb-2">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          placeholder="Descripción breve del programa"
          {...register("descripcion")}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {errors.descripcion && (
          <p className="text-red-500 text-sm mt-1">
            {errors.descripcion.message}
          </p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          * Este texto será visible para los ciudadanos
        </p>
      </div>

      {/* Entidad Responsable */}
      <div className="mb-6">
        <label className="block text-gray-800 font-semibold mb-2">
          Entidad responsable <span className="text-red-500">*</span>
        </label>
        <select
          {...register("entidadResponsable")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">Seleccionar entidad</option>
          {RESPONSABLE_ENTITIES.map((entity) => (
            <option key={entity} value={entity}>
              {entity}
            </option>
          ))}
        </select>
        {errors.entidadResponsable && (
          <p className="text-red-500 text-sm mt-1">
            {errors.entidadResponsable.message}
          </p>
        )}
      </div>

      {/* Código del Programa */}
      <div className="mb-6">
        <label className="block text-gray-800 font-semibold mb-2">
          Código del programa
        </label>
        <input
          type="text"
          value="Se genera automáticamente"
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
        />
        <p className="text-gray-500 text-xs mt-1">
          * El código del programa se crea automáticamente, es un campo no editable
        </p>
      </div>

      {/* Nota final */}
      <p className="text-gray-600 text-sm mb-6 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
        * El programa se creará automáticamente con el estado "borrador"
      </p>

      {/* Botón Submit */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createMutation.isPending ? "Creando Programa..." : "Crear Programa"}
        </button>
      </div>
    </form>
  );
}

export default ProgramCreationForm;
