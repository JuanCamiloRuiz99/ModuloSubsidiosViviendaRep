import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { programSchema, type ProgramFormData } from "../schemas/programSchema";
import { useUpdatePrograma } from "../../../../infraestructure/hooks";
import { RESPONSABLE_ENTITIES } from "../constants/programConstants";
import * as Select from "@radix-ui/react-select";
import type { ProgramaResponse } from "../../../../infraestructure/api";

interface ProgramEditFormProps {
  program: ProgramaResponse;
  onSuccess: () => void;
}

function ProgramEditForm({ program, onSuccess }: ProgramEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      nombre: program.nombre,
      descripcion: program.descripcion,
      entidadResponsable: program.entidad_responsable,
    },
  });

  const updateMutation = useUpdatePrograma(program.id);

  const onSubmit = async (data: ProgramFormData) => {
    updateMutation.mutate(
      {
        nombre: data.nombre,
        descripcion: data.descripcion,
        entidad_responsable: data.entidadResponsable,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-8 rounded-lg border-2 border-yellow-300 max-w-2xl"
    >
      {/* Advertencia */}
      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
        <p className="text-yellow-800 font-semibold">⚠️ Advertencia</p>
        <p className="text-yellow-700 text-sm mt-2">
          Los cambios realizados aquí afectarán directamente a los datos del programa. 
          Asegúrate de que la información sea correcta antes de guardar.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Editar Programa: {program.nombre}
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
      </div>

      {/* Entidad Responsable - Usando Radix UI Select */}
      <div className="mb-6">
        <label className="block text-gray-800 font-semibold mb-2">
          Entidad responsable <span className="text-red-500">*</span>
        </label>
        <Controller
          name="entidadResponsable"
          control={control}
          render={({ field }) => (
            <Select.Root value={field.value} onValueChange={field.onChange}>
              <Select.Trigger className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white flex items-center justify-between">
                <Select.Value placeholder="Seleccionar entidad" />
                <Select.Icon>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  <Select.ScrollUpButton className="flex items-center justify-center h-6">
                    <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </Select.ScrollUpButton>
                  <Select.Viewport className="p-1">
                    {RESPONSABLE_ENTITIES.map((entity) => (
                      <Select.Item
                        key={entity}
                        value={entity}
                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer rounded text-gray-800"
                      >
                        <Select.ItemText>{entity}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                  <Select.ScrollDownButton className="flex items-center justify-center h-6">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </Select.ScrollDownButton>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          )}
        />
        {errors.entidadResponsable && (
          <p className="text-red-500 text-sm mt-1">
            {errors.entidadResponsable.message}
          </p>
        )}
      </div>

      {/* Información del Programa */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-800 font-semibold mb-2">
            Código del programa
          </label>
          <input
            type="text"
            value={program.codigo_programa}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
          />
          <p className="text-gray-500 text-xs mt-1">No editable</p>
        </div>
        <div>
          <label className="block text-gray-800 font-semibold mb-2">
            Estado actual
          </label>
          <input
            type="text"
            value={program.estado}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
          />
          <p className="text-gray-500 text-xs mt-1">No editable</p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4 justify-center">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}

export default ProgramEditForm;
