import { useState } from "react";
import MainLayout from "../../shared/components/layout/MainLayout";
import StatusFilter from "../../shared/components/filters/StatusFilter";
import PostulantsTable from "../components/PostulantsTable";

function PostulantsManagementPage() {
  const [activeStatus, setActiveStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Status options for filter
  const statusOptions = [
    { label: "Total", count: 5000, id: "total" },
    { label: "En Revisión", count: 1250, id: "en-revision" },
    { label: "Subsanación", count: 850, id: "subsanacion" },
    { label: "Aprobados", count: 2100, id: "aprobados" },
    { label: "Rechazados", count: 800, id: "rechazados" },
  ];

  return (
    <MainLayout centerContent={false}>
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Postulantes</h1>
          <p className="text-gray-600 mt-2">Revisión y administración de postulaciones</p>
        </div>

        {/* Status Filter */}
        <StatusFilter
          statuses={statusOptions}
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
          label=""
        />

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, documento"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          />
        </div>

        {/* Postulants Table */}
        <PostulantsTable />
      </div>
    </MainLayout>
  );
}

export default PostulantsManagementPage;
