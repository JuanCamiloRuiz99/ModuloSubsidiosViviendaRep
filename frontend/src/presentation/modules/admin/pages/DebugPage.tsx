/**
 * Página de Debug - Solo para testing
 */
import { useEffect, useState } from "react";
import { usuarioAPI } from "../../../../infraestructure/api/usuarios.api";
import type { UsuarioStats } from "../../../../domain/usuarios/usuario.model";

export default function DebugPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [stats, setStats] = useState<UsuarioStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔍 Iniciando test de API...");
      
      // Test usuarios
      const usuariosData = await usuarioAPI.listar();
      console.log("✓ Usuarios obtenidos:", usuariosData);
      setUsuarios(usuariosData);

      // Test estadísticas
      console.log("🔍 Obteniendo estadísticas...");
      const statsData = await usuarioAPI.obtenerEstadisticas();
      console.log("✓ Estadísticas obtenidas:", statsData);
      setStats(statsData);
    } catch (err: any) {
      console.error("❌ Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🔍 Debug API</h1>

      {loading && <p className="text-lg">Cargando...</p>}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <p className="font-semibold text-red-800">❌ Error:</p>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Sección de Usuarios */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Usuarios</h2>
        {usuarios.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
            <p className="font-semibold text-green-800">✓ {usuarios.length} usuarios encontrados:</p>
            <pre className="text-sm mt-2 overflow-auto bg-white p-2 rounded border max-h-96">
              {JSON.stringify(usuarios, null, 2)}
            </pre>
          </div>
        )}

        {usuarios.length === 0 && !loading && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-yellow-800">⚠ No hay usuarios en la BD</p>
          </div>
        )}
      </div>

      {/* Sección de Estadísticas */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Estadísticas</h2>
        {stats && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <p className="font-semibold text-blue-800">✓ Estadísticas obtenidas:</p>
            <pre className="text-sm mt-2 overflow-auto bg-white p-2 rounded border max-h-96">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </div>
        )}

        {!stats && !loading && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-yellow-800">⚠ No se obtuvieron estadísticas</p>
          </div>
        )}
      </div>

      <button
        onClick={testAPI}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
      >
        🔄 Reintentar
      </button>
    </div>
  );
}
