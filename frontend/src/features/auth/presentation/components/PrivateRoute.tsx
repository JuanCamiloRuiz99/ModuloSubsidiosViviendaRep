/**
 * PrivateRoute – Protege rutas que requieren autenticación.
 *
 * Si no hay token, redirige a /login.
 * Si se indica `allowedRoles`, solo permite acceso a los roles listados.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { storageService } from '../../../../core/services';

interface Props {
  children: React.ReactNode;
  allowedRoles?: number[];
}

export const PrivateRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const token = storageService.getToken();
  const user = storageService.getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Redirigir a cada rol a su módulo si intenta acceder a rutas no permitidas
    if (user.rol === 3) return <Navigate to="/mis-visitas" replace />;
    if (user.rol === 2) return <Navigate to="/mis-postulaciones" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
