/**
 * Página de Crear Nuevo Usuario
 * Formulario dedicado para crear empleados en el sistema
 * 
 * Arquitectura Hexagonal:
 * - Domain: UsuarioFormData (esquema de validación)
 * - Infrastructure: useCreateUsuario hook
 * - Application: manejo de submit y navegación
 * - Presentation: formulario y layout
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../shared/components/layout/MainLayout";
import PageHeader from "../../shared/components/layout/PageHeader";
import ErrorBoundary from "../../../shared/components/errors/ErrorBoundary";
import { useCreateUsuario } from "../../../../infraestructure/hooks";
import UserForm from "../components/UserForm";
import type { UsuarioFormData } from "../schemas/usuarioSchema";

export default function CreateUsuarioPage() {
  const navigate = useNavigate();
  const createMutation = useCreateUsuario();
  const [successDialog, setSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Logging para debugging
  useEffect(() => {
    console.log("[CreateUsuarioPage] successDialog:", successDialog);
    console.log("[CreateUsuarioPage] successMessage:", successMessage);
  }, [successDialog, successMessage]);

  const handleCreateUsuario = async (data: UsuarioFormData) => {
    try {
      console.log("[CreateUsuarioPage] handleCreateUsuario called with:", data);
      setErrorMessage("");
      setSuccessMessage("");
      setSuccessDialog(false);
      
      const result = await createMutation.mutateAsync(data);
      console.log("[CreateUsuarioPage] User created successfully:", result);
      
      // Pequeño delay para asegurar que la UI se actualize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const message = `✅ Usuario "${result.nombre_completo}" creado exitosamente`;
      console.log("[CreateUsuarioPage] Setting success message:", message);
      setSuccessMessage(message);
      console.log("[CreateUsuarioPage] Opening success dialog");
      setSuccessDialog(true);
    } catch (error: any) {
      // Limpiar estado anterior
      setSuccessDialog(false);
      setSuccessMessage("");
      
      const errorMsg =
        error?.message || "Error al crear el usuario. Intenta nuevamente.";
      console.error("[CreateUsuarioPage] Error creating user:", error);
      setErrorMessage(errorMsg);
    }
  };

  const handleConfirmSuccess = () => {
    console.log("[CreateUsuarioPage] handleConfirmSuccess called");
    setSuccessDialog(false);
    navigate("/usuarios");
  };

  const handleCancel = () => {
    console.log("[CreateUsuarioPage] handleCancel called");
    navigate("/usuarios");
  };

  return (
    <MainLayout centerContent={false}>
      <div className="w-full max-w-3xl">
        {/* Encabezado con botón de volver */}
        <PageHeader
          title="Nuevo Empleado"
          description="Completa el formulario para crear un nuevo empleado en el sistema"
        >
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold transition"
          >
            ← Volver a Empleados
          </button>
        </PageHeader>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <span className="text-xl">❌</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Error</p>
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
            <button
              onClick={() => {
                console.log("[CreateUsuarioPage] Closing error message");
                setErrorMessage("");
              }}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Formulario en tarjeta */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <ErrorBoundary>
            <UserForm
              mode="create"
              onSubmit={handleCreateUsuario}
              onCancel={handleCancel}
              isLoading={createMutation.isPending}
            />
          </ErrorBoundary>
        </div>

        {/* Modal de Confirmación de Éxito - Sin Radix UI */}
        {successDialog && successMessage ? (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
              <div className="text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  ¡Éxito!
                </h2>
                <p className="text-gray-600 mb-3">{successMessage}</p>
                <p className="text-sm text-gray-500 mb-6">
                  El empleado ha sido registrado correctamente en el sistema.
                </p>
                <button
                  onClick={handleConfirmSuccess}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                >
                  Ir a la lista de empleados
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}
