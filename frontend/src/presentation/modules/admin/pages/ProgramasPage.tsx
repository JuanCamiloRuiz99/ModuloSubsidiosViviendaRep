import { useNavigate } from "react-router-dom";
import MainLayout from "../../shared/components/layout/MainLayout";
import ProgramDetails from "../components/ProgramDetails";

function ProgramasPage() {
  const navigate = useNavigate();

  return (
    <MainLayout centerContent={false}>
      <div className="w-full max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gestionar Programas</h1>
          <p className="text-gray-600 mt-2">Administra los programas de subsidios disponibles</p>
        </div>

        <div className="mb-6 flex justify-end">
          <button
            onClick={() => navigate("/programas/crear")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            + Nuevo Programa
          </button>
        </div>

        <ProgramDetails />
      </div>
    </MainLayout>
  );
}

export default ProgramasPage;
