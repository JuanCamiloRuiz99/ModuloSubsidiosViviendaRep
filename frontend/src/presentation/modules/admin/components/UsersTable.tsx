/**
 * Componente UsersTable
 * Tabla para mostrar lista de usuarios con acciones
 */
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
import {
  USUARIO_ROLE_LABELS,
  USUARIO_ESTADO_LABELS,
  USUARIO_ESTADO_COLORS,
} from "../constants/usuarioConstants";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface UsersTableProps {
  usuarios: Usuario[];
  loading?: boolean;
  onEdit?: (usuario: Usuario) => void;
  onChangeStatus?: (usuario: Usuario, nuevoEstado: "ACTIVO" | "INACTIVO") => void;
  onDelete?: (usuario: Usuario) => void;
}

export default function UsersTable({
  usuarios,
  loading = false,
  onEdit,
  onChangeStatus,
  onDelete,
}: UsersTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <p className="text-gray-600">Cargando usuarios...</p>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <p className="text-gray-600">No hay usuarios registrados</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left">
                <span className="text-sm font-semibold text-gray-700">
                  EMPLEADO
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-sm font-semibold text-gray-700">
                  DOCUMENTO
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-sm font-semibold text-gray-700">
                  CORREO
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-sm font-semibold text-gray-700">ROL</span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-sm font-semibold text-gray-700">
                  ESTADO
                </span>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-sm font-semibold text-gray-700">
                  ACCIONES
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {usuarios.map((usuario) => {
              const estadoColor =
                USUARIO_ESTADO_COLORS[
                  usuario.estado as keyof typeof USUARIO_ESTADO_COLORS
                ];

              return (
                <tr key={usuario.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {usuario.nombre[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {usuario.nombre_completo}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {usuario.numero_documento}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{usuario.correo}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {
                        USUARIO_ROLE_LABELS[
                          usuario.rol as keyof typeof USUARIO_ROLE_LABELS
                        ]
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${estadoColor.badgeColor}`}
                    >
                      {
                        USUARIO_ESTADO_LABELS[
                          usuario.estado as keyof typeof USUARIO_ESTADO_LABELS
                        ]
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-200 transition">
                            ⋮
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content
                          align="end"
                          className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50"
                        >
                          {onEdit && (
                            <DropdownMenu.Item
                              onSelect={() => onEdit(usuario)}
                              className="px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2"
                            >
                              ✏️ Editar
                            </DropdownMenu.Item>
                          )}
                          {onChangeStatus && (
                            <DropdownMenu.Item
                              onSelect={() =>
                                onChangeStatus(
                                  usuario,
                                  usuario.estado === "ACTIVO"
                                    ? "INACTIVO"
                                    : "ACTIVO"
                                )
                              }
                              className="px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2"
                            >
                              {usuario.estado === "ACTIVO"
                                ? "❌ Desactivar"
                                : "✅ Activar"}
                            </DropdownMenu.Item>
                          )}
                          {onDelete && (
                            <DropdownMenu.Item
                              onSelect={() => onDelete(usuario)}
                              className="px-3 py-2 text-sm hover:bg-red-100 text-red-600 rounded cursor-pointer flex items-center gap-2"
                            >
                              🗑️ Eliminar
                            </DropdownMenu.Item>
                          )}
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
