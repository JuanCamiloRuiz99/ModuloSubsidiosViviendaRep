/**
 * AppRouter - Rutas principales de la aplicacion
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UsuariosRoutes from '../../features/usuarios/presentation/routes/UsuariosRoutes';
import ProgramasRoutes from '../../features/programas/presentation/routes/ProgramasRoutes';
import PostulantesRoutes from '../../features/postulantes/presentation/routes/PostulantesRoutes';
import VisitasRoutes from '../../features/visitas/presentation/routes/VisitasRoutes';
import MisVisitasRoutes from '../../features/visitas/presentation/routes/MisVisitasRoutes';
import MisPostulacionesRoutes from '../../features/postulantes/presentation/routes/MisPostulacionesRoutes';
import LlamadasRoutes from '../../features/llamadas/presentation/routes/LlamadasRoutes';
import { FormularioPublicoPage, RegistroHogarPage } from '../../features/programas/presentation/pages';
import { LoginPage, PrivateRoute } from '../../features/auth';
import { MainLayout } from '../../shared/presentation/components';
import { ErrorBoundary } from '../../shared/presentation/components/ErrorBoundary';
import HomePage from '../pages/HomePage';
import DashboardPage from '../pages/DashboardPage';

export default function AppRouter() {
  return (
    <Router>
      <ErrorBoundary>
      <Routes>
        {/* Página de inicio pública para ciudadanos */}
        <Route path="/" element={<HomePage />} />

        {/* Ruta de login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas publicas para ciudadanos — sin MainLayout ni autenticacion */}
        <Route path="/formulario/:etapaId"    element={<FormularioPublicoPage />} />
        <Route path="/registro-hogar/:etapaId" element={<RegistroHogarPage />} />

        {/* Rutas privadas con layout del sistema */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <MainLayout>
                <Routes>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="usuarios/*"    element={<PrivateRoute allowedRoles={[1]}><UsuariosRoutes /></PrivateRoute>} />
                  <Route path="programas/*"   element={<PrivateRoute allowedRoles={[1, 2]}><ProgramasRoutes /></PrivateRoute>} />
                  <Route path="postulantes/*" element={<PrivateRoute allowedRoles={[1, 2]}><PostulantesRoutes /></PrivateRoute>} />
                  <Route path="visitas/*"     element={<PrivateRoute allowedRoles={[1, 2]}><VisitasRoutes /></PrivateRoute>} />
                  <Route path="mis-visitas/*" element={<PrivateRoute allowedRoles={[3]}><MisVisitasRoutes /></PrivateRoute>} />
                  <Route path="mis-postulaciones/*" element={<PrivateRoute allowedRoles={[2]}><MisPostulacionesRoutes /></PrivateRoute>} />
                  <Route path="llamadas/*" element={<PrivateRoute allowedRoles={[1, 2]}><LlamadasRoutes /></PrivateRoute>} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
      </ErrorBoundary>
    </Router>
  );
}
