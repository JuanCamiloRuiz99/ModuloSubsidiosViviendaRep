import { useNavigate } from "react-router-dom";
import MainLayout from "../../shared/components/layout/MainLayout";
import PageHeader from "../../shared/components/layout/PageHeader";
import { ProgramDetails } from "../components";

function ProgramasPage() {
  const navigate = useNavigate();

  return (
    <MainLayout centerContent={false}>
      <div className="w-full max-w-6xl">
        <PageHeader
          title="Gestionar Programas"
          description="Administra los programas de subsidios disponibles"
        >
          <button
            onClick={() => navigate("/programas/crear")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            ➕ Nuevo Programa
          </button>
        </PageHeader>

        <ProgramDetails />
      </div>
    </MainLayout>
  );
}

export default ProgramasPage;
