import { Routes, Route } from "react-router-dom";
import RoleGuard from "./RoleGuard";
import { Role } from "../../domain/auth/role.enum";

import DashboardPage from "../pages/DashboardPage";
import PostulantesPage from "../pages/PostulantesPage";
import VisitasPage from "../pages/VisitasPage";
import LoginPage from "../pages/LoginPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<div>Página Pública</div>} />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <RoleGuard allowedRoles={[Role.ADMIN]}>
            <DashboardPage />
          </RoleGuard>
        }
      />

      <Route
        path="/postulantes"
        element={
          <RoleGuard allowedRoles={[Role.FUNCIONARIO]}>
            <PostulantesPage />
          </RoleGuard>
        }
      />

      <Route
        path="/visitas"
        element={
          <RoleGuard allowedRoles={[Role.VISITANTE]}>
            <VisitasPage />
          </RoleGuard>
        }
      />

      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}

export default AppRouter;
