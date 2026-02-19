import { Routes, Route } from "react-router-dom";
import RoleGuard from "./RoleGuard";
import { Role } from "../../domain/auth/role.enum";

// Módulo Admin
import DashboardAdminPage from "../modules/admin/pages/DashboardAdminPage";
import ProgramasPage from "../modules/admin/pages/ProgramasPage";
import CreateProgramPage from "../modules/admin/pages/CreateProgramPage";
import ProgramDetailsPage from "../modules/admin/pages/ProgramDetailsPage";
import PostulantsManagementPage from "../modules/admin/pages/PostulantsManagementPage";

// Módulo Funcionario
import DashboardPostulantePage from "../modules/funcionario/pages/DashboardPostulantePage";

// Módulo Visitante
import DashboardVisitantePage from "../modules/visitante/pages/DashboardVisitantePage";

// Módulo Compartido
import LoginPage from "../modules/shared/pages/LoginPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<div>Página Pública</div>} />

      <Route path="/login" element={<LoginPage />} />

      {/* Admin Routes */}
      <Route
        path="/dashboard"
        element={
          <RoleGuard allowedRoles={[Role.ADMIN]}>
            <DashboardAdminPage />
          </RoleGuard>
        }
      />
      <Route
        path="/usuarios"
        element={
          <RoleGuard allowedRoles={[Role.ADMIN]}>
            <div>Gestionar Usuarios - Próximamente</div>
          </RoleGuard>
        }
      />
      <Route
        path="/postulantes-admin"
        element={
          <RoleGuard allowedRoles={[Role.ADMIN]}>
            <div>Ver Postulantes - Próximamente</div>
          </RoleGuard>
        }
      />
      <Route
        path="/reportes"
        element={
          <RoleGuard allowedRoles={[Role.ADMIN]}>
            <div>Generar Reportes - Próximamente</div>
          </RoleGuard>
        }
      />
      <Route
        path="/programas"
        element={
          <RoleGuard allowedRoles={[Role.ADMIN]}>
            <ProgramasPage />
          </RoleGuard>
        }
      />
      <Route
        path="/programas/:programId"
        element={
          <RoleGuard allowedRoles={[Role.ADMIN]}>
            <ProgramDetailsPage />
          </RoleGuard>
        }
      />
      <Route
        path="/programas/crear"
        element={
          <RoleGuard allowedRoles={[Role.ADMIN]}>
            <CreateProgramPage />
          </RoleGuard>
        }
      />
      <Route
        path="/postulantes"
        element={
          <RoleGuard allowedRoles={[Role.ADMIN]}>
            <PostulantsManagementPage />
          </RoleGuard>
        }
      />

      {/* Funcionario Routes */}
      <Route
        path="/postulantes"
        element={
          <RoleGuard allowedRoles={[Role.FUNCIONARIO]}>
            <DashboardPostulantePage />
          </RoleGuard>
        }
      />
      <Route
        path="/postulaciones"
        element={
          <RoleGuard allowedRoles={[Role.FUNCIONARIO]}>
            <div>Gestionar Postulaciones - Próximamente</div>
          </RoleGuard>
        }
      />

      {/* Visitante Routes */}
      <Route
        path="/visitas"
        element={
          <RoleGuard allowedRoles={[Role.VISITANTE]}>
            <DashboardVisitantePage />
          </RoleGuard>
        }
      />
      <Route
        path="/mis-visitas"
        element={
          <RoleGuard allowedRoles={[Role.VISITANTE]}>
            <div>Gestionar Visitas - Próximamente</div>
          </RoleGuard>
        }
      />

      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}

export default AppRouter;
